const Deposit = require("../models/deposit.model");

const CYCLE_SIZE = 73;

const generateDepositUid = async () => {
  const lastRow = await Deposit.getLastUid();

  let nextCycle = 1;
  let nextSeq = 1;

  if (lastRow && lastRow.deposit_uid) {
    const parts = lastRow.deposit_uid.split("/");
    if (parts.length === 2) {
      const cycle = parseInt(parts[0], 10);
      const seq = parseInt(parts[1], 10);

      if (!isNaN(cycle) && !isNaN(seq)) {
        if (seq >= CYCLE_SIZE) {
          nextCycle = cycle + 1;
          nextSeq = 1;
        } else {
          nextCycle = cycle;
          nextSeq = seq + 1;
        }
      }
    }
  }

  const seqStr = String(nextSeq).padStart(3, "0");
  return `${nextCycle}/${seqStr}`;
};

/* ================================================================
   CRUD
================================================================ */

exports.createDeposit = async (data) => {
  const { customer_id, amount, gold_rate_at_time } = data;

  if (!customer_id || !amount || !gold_rate_at_time) {
    throw new Error("customer_id, amount, and gold_rate_at_time are required");
  }
  if (amount <= 0) throw new Error("Amount must be positive");
  if (gold_rate_at_time <= 0) throw new Error("Gold rate must be positive");

  const gold_weight_grams = (parseFloat(amount) / parseFloat(gold_rate_at_time)).toFixed(4);

  const { insertId, deposit_uid } = await Deposit.create({
    customer_id,
    amount,
    gold_rate_at_time,
    gold_weight_grams,
  });

  return {
    id: insertId,
    deposit_uid,
    customer_id,
    amount,
    gold_rate_at_time,
    gold_weight_grams,
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

exports.closeDeposit = async (id) => {
  const deposit = await Deposit.getById(id);
  if (!deposit) throw new Error("Deposit not found");
  if (deposit.status === "closed") throw new Error("Deposit is already closed");

  await Deposit.close(id);

  return {
    id,
    deposit_uid: deposit.deposit_uid,
    status: "closed",
  };
};

/*
  ── NOTE: Deposit.getLastUid() ──────────────────────────────────
  Add this method to your Deposit model (deposit.model.js):

  static async getLastUid() {
    const rows = await sequelize.query(
      `SELECT deposit_uid
       FROM deposits
       ORDER BY
         CAST(SUBSTRING_INDEX(deposit_uid, '/', 1) AS UNSIGNED) DESC,
         CAST(SUBSTRING_INDEX(deposit_uid, '/', -1) AS UNSIGNED) DESC
       LIMIT 1`,
      { type: QueryTypes.SELECT }
    );
    return rows[0] ?? null;
  }
─────────────────────────────────────────────────────────────────*/