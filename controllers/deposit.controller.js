const depositService = require("../services/deposit.service");

/* ===========================
   CREATE DEPOSIT
=========================== */
exports.create = async (req, res) => {
  try {
    const deposit = await depositService.createDeposit(req.body);
    res.status(201).json({
      message: "Deposit created successfully",
      deposit,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ===========================
   GET ALL DEPOSITS
=========================== */
exports.getAll = async (req, res) => {
  try {
    const deposits = await depositService.getAllDeposits();
    res.json(deposits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===========================
   GET BY ID
=========================== */
exports.getById = async (req, res) => {
  try {
    const deposit = await depositService.getDepositById(req.params.id);
    res.json(deposit);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* ===========================
   GET BY UID
=========================== */
exports.getByUid = async (req, res) => {
  try {
    const deposit = await depositService.getDepositByUid(req.params.uid);
    res.json(deposit);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* ===========================
   GET BY CUSTOMER ID
=========================== */
exports.getByCustomer = async (req, res) => {
  try {
    const deposits = await depositService.getDepositsByCustomer(
      req.params.customerId,
    );
    res.json(deposits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===========================
   DELETE DEPOSIT
=========================== */
exports.remove = async (req, res) => {
  try {
    await depositService.deleteDeposit(req.params.id);
    res.json({ message: "Deposit deleted successfully" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* ===========================
   GET STATS
=========================== */
exports.getStats = async (req, res) => {
  try {
    const stats = await depositService.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
