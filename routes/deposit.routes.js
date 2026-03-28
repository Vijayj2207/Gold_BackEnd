const express = require("express");
const router = express.Router();
const depositController = require("../controllers/deposit.controller");

// GET  /api/deposits/stats
router.get("/stats", depositController.getStats);
router.patch("/:id/close", depositController.close);
// GET  /api/deposits
router.get("/", depositController.getAll);

// POST /api/deposits
router.post("/", depositController.create);

// GET  /api/deposits/uid/:uid
router.get("/uid/:uid", depositController.getByUid);

// GET  /api/deposits/customer/:customerId
router.get("/customer/:customerId", depositController.getByCustomer);

// GET  /api/deposits/:id
router.get("/:id", depositController.getById);

// DELETE /api/deposits/:id
router.delete("/:id", depositController.remove);

module.exports = router;
