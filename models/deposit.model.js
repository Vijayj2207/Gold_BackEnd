const { sequelize } = require("../config/db");
const { QueryTypes } = require("sequelize");

const Deposit = {
  create: async (data) => {
    const [result] = await sequelize.query(
      `INSERT INTO deposits 
        (deposit_uid, customer_id, amount, gold_rate_at_time, gold_weight_grams, created_at)
       VALUES 
        (:deposit_uid, :customer_id, :amount, :gold_rate_at_time, :gold_weight_grams, NOW())`,
      {
        replacements: {
          deposit_uid: data.deposit_uid,
          customer_id: data.customer_id,
          amount: data.amount,
          gold_rate_at_time: data.gold_rate_at_time,
          gold_weight_grams: data.gold_weight_grams,
        },
        type: QueryTypes.INSERT,
      },
    );
    return result;
  },

  // ✅ Fixed: c.name → c.full_name, c.phone → c.mobile_number
  getAll: async () => {
    return await sequelize.query(
      `SELECT 
        d.id,
        d.deposit_uid,
        d.customer_id,
        d.amount,
        d.gold_rate_at_time,
        d.gold_weight_grams,
        d.created_at,
        c.full_name AS customer_name,
        c.mobile_number AS customer_phone
       FROM deposits d
       JOIN customers c ON d.customer_id = c.id
       ORDER BY d.created_at DESC`,
      { type: QueryTypes.SELECT },
    );
  },

  getById: async (id) => {
    const rows = await sequelize.query(
      `SELECT 
        d.id,
        d.deposit_uid,
        d.customer_id,
        d.amount,
        d.gold_rate_at_time,
        d.gold_weight_grams,
        d.created_at,
        c.full_name AS customer_name,
        c.mobile_number AS customer_phone
       FROM deposits d
       JOIN customers c ON d.customer_id = c.id
       WHERE d.id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      },
    );
    return rows[0];
  },

  getByUid: async (deposit_uid) => {
    const rows = await sequelize.query(
      `SELECT 
        d.*,
        c.full_name AS customer_name,
        c.mobile_number AS customer_phone
       FROM deposits d
       JOIN customers c ON d.customer_id = c.id
       WHERE d.deposit_uid = :deposit_uid`,
      {
        replacements: { deposit_uid },
        type: QueryTypes.SELECT,
      },
    );
    return rows[0];
  },

  getByCustomerId: async (customer_id) => {
    return await sequelize.query(
      `SELECT 
        d.*,
        c.full_name AS customer_name,
        c.mobile_number AS customer_phone
       FROM deposits d
       JOIN customers c ON d.customer_id = c.id
       WHERE d.customer_id = :customer_id 
       ORDER BY d.created_at DESC`,
      {
        replacements: { customer_id },
        type: QueryTypes.SELECT,
      },
    );
  },

  delete: async (id) => {
    await sequelize.query("DELETE FROM deposits WHERE id = :id", {
      replacements: { id },
      type: QueryTypes.DELETE,
    });
  },

  getCount: async () => {
    const rows = await sequelize.query(
      "SELECT COUNT(*) AS total FROM deposits",
      { type: QueryTypes.SELECT },
    );
    return rows[0].total;
  },

  getTotalAmount: async () => {
    const rows = await sequelize.query(
      "SELECT SUM(amount) AS total FROM deposits",
      { type: QueryTypes.SELECT },
    );
    return rows[0].total || 0;
  },
};

module.exports = Deposit;
