const paymentService = require("../services/payment.service");

exports.create = async (req, res) => {
  try {
    const payment = await paymentService.createPayment(req.body);
    res.status(201).json({
      message: "Payment created successfully",
      payment,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    res.json(payment);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.getByCustomer = async (req, res) => {
  try {
    const payments = await paymentService.getPaymentsByCustomer(
      req.params.customerId,
    );
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getByDeposit = async (req, res) => {
  try {
    const payments = await paymentService.getPaymentsByDeposit(
      req.params.depositId,
    );
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await paymentService.deletePayment(req.params.id);
    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await paymentService.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
