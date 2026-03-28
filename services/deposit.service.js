const Deposit = require("../models/deposit.model");

/* ================================================================
   UID FORMAT:  {cycle}-{seq:03d}
   - Sequences run 1 → 73 within each cycle
   - Cycle 0 → 0-001 … 0-073
   - Cycle 1 → 1-001 … 1-073
   - Cycle 2 → 2-001 … 2-073  … and so on indefinitely
================================================================ */
const CYCLE_SIZE = 73;

/**
 * Read the highest existing deposit_uid from the DB and derive
 * the next cycle + sequence numbers from it.
 *
 * Expected uid format:  "0-001", "1-073", "12-005" …
 * Falls back to 0-001 if table is empty or format doesn't match.
 */
const generateDepositUid = async () => {
  // Fetch the uid with the highest numeric value.
  // Sort by cycle DESC then seq DESC so the very last issued uid comes first.
  const lastRow = await Deposit.getLastUid(); // see note below ↓

  let nextCycle = 0;
  let nextSeq = 1;

  if (lastRow && lastRow.deposit_uid) {
    const parts = lastRow.deposit_uid.split("-");
    if (parts.length === 2) {
      const cycle = parseInt(parts[0], 10);
      const seq = parseInt(parts[1], 10);

      if (!isNaN(cycle) && !isNaN(seq)) {
        if (seq >= CYCLE_SIZE) {
          // Roll over to the next cycle
          nextCycle = cycle + 1;
          nextSeq = 1;
        } else {
          nextCycle = cycle;
          nextSeq = seq + 1;
        }
      }
    }
  }

  // Zero-pad the sequence to 3 digits
  const seqStr = String(nextSeq).padStart(3, "0");
  return `${nextCycle}-${seqStr}`;
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

  // Deposit.create() handles UID generation atomically inside a transaction.
  // Do NOT call generateDepositUid() separately — that causes race conditions.
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
         CAST(SUBSTRING_INDEX(deposit_uid, '-', 1) AS UNSIGNED) DESC,
         CAST(SUBSTRING_INDEX(deposit_uid, '-', -1) AS UNSIGNED) DESC
       LIMIT 1`,
      { type: QueryTypes.SELECT }
    );
    return rows[0] ?? null;
  }

  This sorts by cycle number first, then sequence number, so you
  always get the truly "last" issued uid regardless of insertion order.
─────────────────────────────────────────────────────────────────*/