const { sequelize } = require("../config/db");
const { QueryTypes } = require("sequelize");

exports.getStats = async (req, res) => {
  try {
    // Total customers
    const [customerCount] = await sequelize.query(
      "SELECT COUNT(*) AS total FROM customers",
      { type: QueryTypes.SELECT },
    );

    // Total deposits
    const [depositCount] = await sequelize.query(
      "SELECT COUNT(*) AS total FROM deposits",
      { type: QueryTypes.SELECT },
    );

    // Total payments amount
    const [paymentTotal] = await sequelize.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM payments",
      { type: QueryTypes.SELECT },
    );

    // Recent deposits (last 5)
    const recentDeposits = await sequelize.query(
      `SELECT d.*, c.full_name AS customer_name
       FROM deposits d
       JOIN customers c ON d.customer_id = c.id
       ORDER BY d.created_at DESC LIMIT 5`,
      { type: QueryTypes.SELECT },
    );

    // Recent payments (last 5)
    const recentPayments = await sequelize.query(
      `SELECT p.*, c.full_name AS customer_name, d.deposit_uid
       FROM payments p
       JOIN customers c ON p.customer_id = c.id
       JOIN deposits d ON p.deposit_id = d.id
       ORDER BY p.paid_at DESC LIMIT 5`,
      { type: QueryTypes.SELECT },
    );

    res.json({
      totalUsers: Number(customerCount.total) || 0,
      totalDeposits: Number(depositCount.total) || 0,
      totalPayments: Number(paymentTotal.total) || 0,
      recentDeposits,
      recentPayments,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
