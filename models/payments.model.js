const { sequelize } = require("../config/db");
const { QueryTypes } = require("sequelize");

const Payment = {
 create: async (data) => {
  // Convert ISO string → MySQL datetime format (YYYY-MM-DD HH:MM:SS)
  const paidAt = data.paid_at
    ? new Date(data.paid_at).toISOString().slice(0, 19).replace("T", " ")
    : new Date().toISOString().slice(0, 19).replace("T", " ");

  const [result] = await sequelize.query(
    `INSERT INTO payments (deposit_id, customer_id, amount, payment_mode, gold_weight_grams, paid_at)
     VALUES (:deposit_id, :customer_id, :amount, :payment_mode, :gold_weight_grams, :paid_at)`,
    {
      replacements: {
        deposit_id:        data.deposit_id,
        customer_id:       data.customer_id,
        amount:            data.amount,
        payment_mode:      data.payment_mode,
        gold_weight_grams: data.gold_weight_grams,
        paid_at:           paidAt,
      },
      type: QueryTypes.INSERT,
    }
  );
  return result;
},

  getAll: async () => {
    return await sequelize.query(
      `SELECT
         p.id,
         p.deposit_id,
         p.customer_id,
         p.amount,
         p.payment_mode,
         p.gold_weight_grams,
         p.paid_at,
         c.full_name       AS customer_name,
         c.mobile_number   AS customer_phone,
         d.deposit_uid,
         d.gold_rate_at_time
       FROM payments p
       JOIN customers c ON p.customer_id = c.id
       JOIN deposits  d ON p.deposit_id  = d.id
       ORDER BY p.paid_at DESC`,
      { type: QueryTypes.SELECT }
    );
  },

  getById: async (id) => {
    const rows = await sequelize.query(
      `SELECT
         p.id,
         p.deposit_id,
         p.customer_id,
         p.amount,
         p.payment_mode,
         p.gold_weight_grams,
         p.paid_at,
         c.full_name       AS customer_name,
         c.mobile_number   AS customer_phone,
         d.deposit_uid,
         d.gold_rate_at_time
       FROM payments p
       JOIN customers c ON p.customer_id = c.id
       JOIN deposits  d ON p.deposit_id  = d.id
       WHERE p.id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );
    return rows[0] || null;
  },

  getByCustomerId: async (customer_id) => {
    return await sequelize.query(
      `SELECT
         p.*,
         c.full_name     AS customer_name,
         d.deposit_uid,
         d.gold_rate_at_time
       FROM payments p
       JOIN customers c ON p.customer_id = c.id
       JOIN deposits  d ON p.deposit_id  = d.id
       WHERE p.customer_id = :customer_id
       ORDER BY p.paid_at DESC`,
      { replacements: { customer_id }, type: QueryTypes.SELECT }
    );
  },

  getByDepositId: async (deposit_id) => {
    return await sequelize.query(
      `SELECT
         p.*,
         c.full_name     AS customer_name,
         d.deposit_uid,
         d.gold_rate_at_time
       FROM payments p
       JOIN customers c ON p.customer_id = c.id
       JOIN deposits  d ON p.deposit_id  = d.id
       WHERE p.deposit_id = :deposit_id
       ORDER BY p.paid_at DESC`,
      { replacements: { deposit_id }, type: QueryTypes.SELECT }
    );
  },

  delete: async (id) => {
    await sequelize.query("DELETE FROM payments WHERE id = :id", {
      replacements: { id },
      type: QueryTypes.DELETE,
    });
  },

  getCount: async () => {
    const rows = await sequelize.query(
      "SELECT COUNT(*) AS total FROM payments",
      { type: QueryTypes.SELECT }
    );
    return rows[0]?.total || 0;
  },

  getTotalAmount: async () => {
    const rows = await sequelize.query(
      "SELECT SUM(amount) AS total FROM payments",
      { type: QueryTypes.SELECT }
    );
    return rows[0]?.total || 0;
  },
};

module.exports = Payment;