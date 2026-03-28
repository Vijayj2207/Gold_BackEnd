const { sequelize } = require("../config/db");
const { QueryTypes } = require("sequelize");

const Deposit = {

  // ================================================================
  // ATOMIC UID GENERATION
  // Uses SELECT FOR UPDATE inside a transaction so two simultaneous
  // requests can never read the same "last uid" and collide.
  // ================================================================
  async getLastUidForUpdate(transaction) {
    const rows = await sequelize.query(
      `SELECT deposit_uid
       FROM deposits
       ORDER BY
         CAST(SUBSTRING_INDEX(deposit_uid, '-', 1) AS UNSIGNED) DESC,
         CAST(SUBSTRING_INDEX(deposit_uid, '-', -1) AS UNSIGNED) DESC
       LIMIT 1
       FOR UPDATE`,          
      {
        type: QueryTypes.SELECT,
        transaction,
      }
    );
    return rows[0] || null;
  },

  // ================================================================
  // CREATE — wraps UID generation + INSERT in a single transaction
  // This is the only correct way to avoid duplicate UID race conditions.
  // ================================================================
  // deposit.model.js — replace the create() method

async create(data) {
  const CYCLE_SIZE = 73;
  const LOCK_NAME = 'deposit_uid_lock';
  const LOCK_TIMEOUT = 10; // seconds

  return await sequelize.transaction(async (t) => {
    // 1. Acquire a named advisory lock — works even on empty table
    await sequelize.query(
      `SELECT GET_LOCK(:lockName, :timeout)`,
      {
        replacements: { lockName: LOCK_NAME, timeout: LOCK_TIMEOUT },
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    try {
      // 2. Read last UID (no FOR UPDATE needed — advisory lock protects us)
      const rows = await sequelize.query(
        `SELECT deposit_uid
         FROM deposits
         ORDER BY
           CAST(SUBSTRING_INDEX(deposit_uid, '-', 1) AS UNSIGNED) DESC,
           CAST(SUBSTRING_INDEX(deposit_uid, '-', -1) AS UNSIGNED) DESC
         LIMIT 1`,
        { type: QueryTypes.SELECT, transaction: t }
      );

      const lastRow = rows[0] || null;

      // 3. Derive next cycle + sequence
      let nextCycle = 0;
      let nextSeq = 1;

      if (lastRow?.deposit_uid) {
        const parts = lastRow.deposit_uid.split('-');
        if (parts.length === 2) {
          const cycle = parseInt(parts[0], 10);
          const seq   = parseInt(parts[1], 10);
          if (!isNaN(cycle) && !isNaN(seq)) {
            if (seq >= CYCLE_SIZE) {
              nextCycle = cycle + 1;
              nextSeq   = 1;
            } else {
              nextCycle = cycle;
              nextSeq   = seq + 1;
            }
          }
        }
      }

      const deposit_uid = `${nextCycle}-${String(nextSeq).padStart(3, '0')}`;

      // 4. INSERT
      const [result] = await sequelize.query(
        `INSERT INTO deposits
           (deposit_uid, customer_id, amount, gold_rate_at_time, gold_weight_grams, status, created_at)
         VALUES
           (:deposit_uid, :customer_id, :amount, :gold_rate_at_time, :gold_weight_grams, 'active', NOW())`,
        {
          replacements: {
            deposit_uid,
            customer_id:       data.customer_id,
            amount:            data.amount,
            gold_rate_at_time: data.gold_rate_at_time,
            gold_weight_grams: data.gold_weight_grams,
          },
          type: QueryTypes.INSERT,
          transaction: t,
        }
      );

      return { insertId: result, deposit_uid };

    } finally {
      // 5. Always release the lock
      await sequelize.query(
        `SELECT RELEASE_LOCK(:lockName)`,
        {
          replacements: { lockName: LOCK_NAME },
          type: QueryTypes.SELECT,
          transaction: t,
        }
      );
    }
  });
},

  // ================================================================
  // GET ALL DEPOSITS
  // ================================================================
  async getAll() {
    try {
      return await sequelize.query(
        `SELECT
           d.id,
           d.deposit_uid,
           d.customer_id,
           d.amount,
           d.gold_rate_at_time,
           d.gold_weight_grams,
           d.status,
           d.created_at,
           c.full_name     AS customer_name,
           c.mobile_number AS customer_phone
         FROM deposits d
         JOIN customers c ON d.customer_id = c.id
         ORDER BY d.created_at DESC`,
        { type: QueryTypes.SELECT }
      );
    } catch (err) {
      console.error("Error in getAll:", err);
      throw err;
    }
  },

  // ================================================================
  // GET BY ID
  // ================================================================
  async getById(id) {
    try {
      const rows = await sequelize.query(
        `SELECT
           d.id,
           d.deposit_uid,
           d.customer_id,
           d.amount,
           d.gold_rate_at_time,
           d.gold_weight_grams,
           d.status,
           d.created_at,
           c.full_name     AS customer_name,
           c.mobile_number AS customer_phone
         FROM deposits d
         JOIN customers c ON d.customer_id = c.id
         WHERE d.id = :id`,
        {
          replacements: { id },
          type: QueryTypes.SELECT,
        }
      );
      return rows[0] || null;
    } catch (err) {
      console.error("Error in getById:", err);
      throw err;
    }
  },

  // ================================================================
  // GET BY UID
  // ================================================================
  async getByUid(deposit_uid) {
    try {
      const rows = await sequelize.query(
        `SELECT
           d.*,
           c.full_name     AS customer_name,
           c.mobile_number AS customer_phone
         FROM deposits d
         JOIN customers c ON d.customer_id = c.id
         WHERE d.deposit_uid = :deposit_uid`,
        {
          replacements: { deposit_uid },
          type: QueryTypes.SELECT,
        }
      );
      return rows[0] || null;
    } catch (err) {
      console.error("Error in getByUid:", err);
      throw err;
    }
  },

  // ================================================================
  // GET BY CUSTOMER ID
  // ================================================================
  async getByCustomerId(customer_id) {
    try {
      return await sequelize.query(
        `SELECT
           d.*,
           c.full_name     AS customer_name,
           c.mobile_number AS customer_phone
         FROM deposits d
         JOIN customers c ON d.customer_id = c.id
         WHERE d.customer_id = :customer_id
         ORDER BY d.created_at DESC`,
        {
          replacements: { customer_id },
          type: QueryTypes.SELECT,
        }
      );
    } catch (err) {
      console.error("Error in getByCustomerId:", err);
      throw err;
    }
  },

  // ================================================================
  // DELETE
  // ================================================================
  async delete(id) {
    try {
      await sequelize.query(
        "DELETE FROM deposits WHERE id = :id",
        {
          replacements: { id },
          type: QueryTypes.DELETE,
        }
      );
      return true;
    } catch (err) {
      console.error("Error in delete:", err);
      throw err;
    }
  },

  // ================================================================
  // CLOSE DEPOSIT (US12)
  // Sets status = 'closed' — closed deposits reject new payments
  // ================================================================
  async close(id) {
    try {
      await sequelize.query(
        `UPDATE deposits
         SET status = 'closed', updated_at = NOW()
         WHERE id = :id`,
        {
          replacements: { id },
          type: QueryTypes.UPDATE,
        }
      );
      return true;
    } catch (err) {
      console.error("Error in close:", err);
      throw err;
    }
  },

  // ================================================================
  // COUNT
  // ================================================================
  async getCount() {
    try {
      const rows = await sequelize.query(
        "SELECT COUNT(*) AS total FROM deposits",
        { type: QueryTypes.SELECT }
      );
      return rows[0]?.total || 0;
    } catch (err) {
      console.error("Error in getCount:", err);
      throw err;
    }
  },

  // ================================================================
  // TOTAL AMOUNT
  // ================================================================
  async getTotalAmount() {
    try {
      const rows = await sequelize.query(
        "SELECT SUM(amount) AS total FROM deposits",
        { type: QueryTypes.SELECT }
      );
      return rows[0]?.total || 0;
    } catch (err) {
      console.error("Error in getTotalAmount:", err);
      throw err;
    }
  },
};

module.exports = Deposit;