const Deposit = require("../models/deposit.model");

// Generate unique deposit UID like DEP-20240307-0001
const generateDepositUid = () => {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DEP-${date}-${random}`;
};

exports.createDeposit = async (data) => {
  const { customer_id, amount, gold_rate_at_time } = data;

  if (!customer_id || !amount || !gold_rate_at_time) {
    throw new Error("customer_id, amount, and gold_rate_at_time are required");
  }

  if (amount <= 0) throw new Error("Amount must be positive");
  if (gold_rate_at_time <= 0) throw new Error("Gold rate must be positive");

  const gold_weight_grams = parseFloat(amount) / parseFloat(gold_rate_at_time);
  const deposit_uid = generateDepositUid();

  const id = await Deposit.create({
    deposit_uid,
    customer_id,
    amount,
    gold_rate_at_time,
    gold_weight_grams: gold_weight_grams.toFixed(4),
  });

  return {
    id,
    deposit_uid,
    customer_id,
    amount,
    gold_rate_at_time,
    gold_weight_grams: gold_weight_grams.toFixed(4),
  };
};

exports.getAllDeposits = async () => {
  return await Deposit.getAll();
};

exports.getDepositById = async (id) => {
  const deposit = await Deposit.getById(id);
  if (!deposit) throw new Error("Deposit not found");
  return deposit;
};

exports.getDepositByUid = async (uid) => {
  const deposit = await Deposit.getByUid(uid);
  if (!deposit) throw new Error("Deposit not found");
  return deposit;
};

exports.getDepositsByCustomer = async (customer_id) => {
  return await Deposit.getByCustomerId(customer_id);
};

exports.deleteDeposit = async (id) => {
  const deposit = await Deposit.getById(id);
  if (!deposit) throw new Error("Deposit not found");
  await Deposit.delete(id);
};

exports.getStats = async () => {
  const total = await Deposit.getCount();
  const totalAmount = await Deposit.getTotalAmount();
  return { total, totalAmount };
};
