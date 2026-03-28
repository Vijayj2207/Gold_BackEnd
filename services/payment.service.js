const Payment = require("../models/payments.model.js");

const GoldRate = require("../models/goldRate.model.js");


exports.createPayment = async (data) => {
  const { deposit_id, customer_id, amount, payment_mode, paid_at } = data;

  if (!deposit_id || !customer_id || !amount || !payment_mode) {
    throw new Error("deposit_id, customer_id, amount and payment_mode are required");
  }
  if (!["Cash", "GPay"].includes(payment_mode)) {
    throw new Error("payment_mode must be Cash or GPay");
  }
  if (amount <= 0) throw new Error("Amount must be positive");

  const amountNum = parseFloat(amount);

  // ── Get date in IST (UTC+5:30) ──────────────────────────────
  // Frontend sends "2026-03-28T00:00:00.000Z" which is IST midnight
  // Converting via toISOString() gives "2026-03-27" (wrong — UTC date)
  // Instead: offset by +5:30 before extracting the date string
  const getISTDateString = (dateInput) => {
    const d = dateInput ? new Date(dateInput) : new Date();
    // Add 5 hours 30 minutes to get IST
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(d.getTime() + istOffset);
    return istDate.toISOString().split("T")[0]; // "YYYY-MM-DD" in IST
  };

  const paymentDate = getISTDateString(paid_at);

  console.log("paid_at received:", paid_at);
  console.log("paymentDate in IST:", paymentDate); // should be "2026-03-28"

  const { Op } = require("sequelize");

  let goldRateRow = await GoldRate.findOne({
    where: { date: paymentDate },
  });

  if (!goldRateRow) {
    goldRateRow = await GoldRate.findOne({
      where: { date: { [Op.lte]: paymentDate } },
      order: [["date", "DESC"]],
    });
  }

  if (!goldRateRow) {
    throw new Error(`No gold rate found for ${paymentDate}. Please set today's gold rate first.`);
  }

  const rate = parseFloat(goldRateRow.rate);
  const gold_weight_grams = (amountNum / rate).toFixed(4);

  console.log("Rate used:", rate, "| Grams:", gold_weight_grams);

  const id = await Payment.create({
    deposit_id:        Number(deposit_id),
    customer_id:       Number(customer_id),
    amount:            amountNum,
    payment_mode,
    gold_weight_grams,
    paid_at:           paid_at || new Date(),
  });

  return {
    id,
    deposit_id,
    customer_id,
    amount:            amountNum,
    payment_mode,
    gold_weight_grams,
    rate_used:         rate,
  };
};




exports.getAllPayments    = async () => await Payment.getAll();
exports.getPaymentById   = async (id) => {
  const p = await Payment.getById(id);
  if (!p) throw new Error("Payment not found");
  return p;
};
exports.getPaymentsByCustomer = async (customer_id) => Payment.getByCustomerId(customer_id);
exports.getPaymentsByDeposit  = async (deposit_id)  => Payment.getByDepositId(deposit_id);
exports.deletePayment = async (id) => {
  const p = await Payment.getById(id);
  if (!p) throw new Error("Payment not found");
  await Payment.delete(id);
};
exports.getStats = async () => ({
  total:       await Payment.getCount(),
  totalAmount: await Payment.getTotalAmount(),
});

exports.getAllPayments = async () => {
  return await Payment.getAll();
};

exports.getPaymentById = async (id) => {
  const payment = await Payment.getById(id);
  if (!payment) throw new Error("Payment not found");
  return payment;
};

exports.getPaymentsByCustomer = async (customer_id) => {
  return await Payment.getByCustomerId(customer_id);
};

exports.getPaymentsByDeposit = async (deposit_id) => {
  return await Payment.getByDepositId(deposit_id);
};

exports.deletePayment = async (id) => {
  const payment = await Payment.getById(id);
  if (!payment) throw new Error("Payment not found");
  await Payment.delete(id);
};

exports.getStats = async () => {
  const total = await Payment.getCount();
  const totalAmount = await Payment.getTotalAmount();
  return { total, totalAmount };
};
