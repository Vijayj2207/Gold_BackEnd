const Payment = require("../models/payments.model.js");

exports.createPayment = async (data) => {
  const { deposit_id, customer_id, amount, payment_mode } = data;

  if (!deposit_id || !customer_id || !amount || !payment_mode) {
    throw new Error(
      "deposit_id, customer_id, amount and payment_mode are required",
    );
  }

  if (!["Cash", "GPay"].includes(payment_mode)) {
    throw new Error("payment_mode must be Cash or GPay");
  }

  if (amount <= 0) throw new Error("Amount must be positive");

  const id = await Payment.create({
    deposit_id,
    customer_id,
    amount,
    payment_mode,
  });

  return { id, deposit_id, customer_id, amount, payment_mode };
};

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
