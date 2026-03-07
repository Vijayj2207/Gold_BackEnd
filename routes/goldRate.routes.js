const express = require("express");
const router = express.Router();
const goldRateController = require("../controllers/goldRate.controller");

// GET /api/gold-rate/current - Get current rate with today's change
router.get("/current", goldRateController.getCurrentRate);

// GET /api/gold-rate/latest - Get most recent rate
router.get("/latest", goldRateController.getLatestRate);

// GET /api/gold-rate/history?days=30 - Get rate history
router.get("/history", goldRateController.getRateHistory);

// POST /api/gold-rate/refresh - Force refresh from GoldAPI.io
// router.post('/refresh', goldRateController.forceRefresh);

// GET /api/gold-rate/:date - Get rate for specific date
router.get("/:date", goldRateController.getRateByDate);

// POST /api/gold-rate - Create/update rate for a date (manual override)
router.post("/", goldRateController.setRate);

// DELETE /api/gold-rate/:date - Delete rate for specific date
router.delete("/:date", goldRateController.deleteRate);

module.exports = router;
