const { sequelize } = require("../config/db");
const { QueryTypes } = require("sequelize");

const Payment = {
  create: async (data) => {
    const [result] = await sequelize.query(
      `INSERT INTO payments (deposit_id, customer_id, amount, payment_mode, paid_at)
       VALUES (:deposit_id, :customer_id, :amount, :payment_mode, NOW())`,
      {
        replacements: {
          deposit_id: data.deposit_id,
          customer_id: data.customer_id,
          amount: data.amount,
          payment_mode: data.payment_mode,
        },
        type: QueryTypes.INSERT,
      },
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
        p.paid_at,
        c.full_name AS customer_name,
        c.mobile_number AS customer_phone,
        d.deposit_uid
       FROM payments p
       JOIN customers c ON p.customer_id = c.id
       JOIN deposits d ON p.deposit_id = d.id
       ORDER BY p.paid_at DESC`,
      { type: QueryTypes.SELECT },
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
        p.paid_at,
        c.full_name AS customer_name,
        c.mobile_number AS customer_phone,
        d.deposit_uid
       FROM payments p
       JOIN customers c ON p.customer_id = c.id
       JOIN deposits d ON p.deposit_id = d.id
       WHERE p.id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      },
    );
    return rows[0];
  },

  getByCustomerId: async (customer_id) => {
    return await sequelize.query(
      `SELECT 
        p.*,
        c.full_name AS customer_name,
        d.deposit_uid
       FROM payments p
       JOIN customers c ON p.customer_id = c.id
       JOIN deposits d ON p.deposit_id = d.id
       WHERE p.customer_id = :customer_id
       ORDER BY p.paid_at DESC`,
      {
        replacements: { customer_id },
        type: QueryTypes.SELECT,
      },
    );
  },

  getByDepositId: async (deposit_id) => {
    return await sequelize.query(
      `SELECT 
        p.*,
        c.full_name AS customer_name,
        d.deposit_uid
       FROM payments p
       JOIN customers c ON p.customer_id = c.id
       JOIN deposits d ON p.deposit_id = d.id
       WHERE p.deposit_id = :deposit_id
       ORDER BY p.paid_at DESC`,
      {
        replacements: { deposit_id },
        type: QueryTypes.SELECT,
      },
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
      { type: QueryTypes.SELECT },
    );
    return rows[0].total;
  },

  getTotalAmount: async () => {
    const rows = await sequelize.query(
      "SELECT SUM(amount) AS total FROM payments",
      { type: QueryTypes.SELECT },
    );
    return rows[0].total || 0;
  },
};

module.exports = Payment;
