const Payment = require("../models/payments.model.js");

const Deposit = require("../models/deposit.model");

exports.createPayment = async (data) => {
  const { deposit_id, customer_id, amount, payment_mode, paid_at } = data;

  if (!deposit_id || !customer_id || !amount || !payment_mode) {
    throw new Error("deposit_id, customer_id, amount and payment_mode are required");
  }
  if (!["Cash", "GPay"].includes(payment_mode)) {
    throw new Error("payment_mode must be Cash or GPay");
  }
  if (amount <= 0) throw new Error("Amount must be positive");

  // Force numeric — frontend may send strings
  const depositIdNum = Number(deposit_id);
  const amountNum    = parseFloat(amount);

  const deposit = await Deposit.getById(depositIdNum);

  // Add this debug temporarily to confirm what comes back:
  console.log("deposit row:", deposit);
  console.log("gold_rate_at_time:", deposit?.gold_rate_at_time);

  if (!deposit) throw new Error("Deposit not found");
  if (deposit.status === "closed") throw new Error("Deposit is closed");

  const rate = parseFloat(deposit.gold_rate_at_time);
  if (!rate || rate <= 0) throw new Error("Invalid gold rate on deposit");

  const gold_weight_grams = (amountNum / rate).toFixed(4);

  console.log(`amount=${amountNum}, rate=${rate}, grams=${gold_weight_grams}`);

  const id = await Payment.create({
    deposit_id:        depositIdNum,
    customer_id:       Number(customer_id),
    amount:            amountNum,
    payment_mode,
    gold_weight_grams,
    paid_at:           paid_at || new Date(),
  });

  return { id, deposit_id: depositIdNum, customer_id, amount: amountNum, payment_mode, gold_weight_grams };
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
