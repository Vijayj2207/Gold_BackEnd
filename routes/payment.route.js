const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

router.get("/stats", paymentController.getStats);
router.get("/", paymentController.getAll);
router.post("/", paymentController.create);
router.get("/customer/:customerId", paymentController.getByCustomer);
router.get("/deposit/:depositId", paymentController.getByDeposit);
router.get("/:id", paymentController.getById);
router.delete("/:id", paymentController.remove);

module.exports = router;
