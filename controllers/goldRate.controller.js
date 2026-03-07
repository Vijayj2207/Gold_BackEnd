const { sequelize } = require("../config/db");
const { QueryTypes } = require("sequelize");

/* =========================
   SET GOLD RATE
========================= */
exports.setRate = async (req, res) => {
  try {
    const { date, rate } = req.body;

    if (!date || !rate) {
      return res.status(400).json({ message: "date and rate are required" });
    }

    const prevRows = await sequelize.query(
      "SELECT rate, `change`, changePercentage FROM gold_rates ORDER BY `date` DESC LIMIT 1",
      { type: QueryTypes.SELECT },
    );

    let change = 0;
    let changePercentage = 0;

    if (prevRows.length > 0) {
      const previousRate = prevRows[0].rate;
      change = rate - previousRate;
      changePercentage = (change / previousRate) * 100;
    }

    await sequelize.query(
      `INSERT INTO gold_rates (\`date\`, rate, \`change\`, changePercentage, createdAt, updatedAt)
       VALUES (:date, :rate, :change, :changePercentage, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
       rate = VALUES(rate),
       \`change\` = VALUES(\`change\`),
       changePercentage = VALUES(changePercentage),
       updatedAt = NOW()`,
      {
        replacements: { date, rate, change, changePercentage },
        type: QueryTypes.INSERT,
      },
    );

    res.json({ message: "Gold rate saved successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to set gold rate", error: error.message });
  }
};

/* =========================
   GET LATEST RATE
========================= */
exports.getLatestRate = async (req, res) => {
  try {
    const rows = await sequelize.query(
      "SELECT * FROM gold_rates ORDER BY `date` DESC LIMIT 1",
      { type: QueryTypes.SELECT },
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No gold rate found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch latest rate", error: error.message });
  }
};

/* =========================
   GET CURRENT RATE
========================= */
exports.getCurrentRate = async (req, res) => {
  try {
    const rows = await sequelize.query(
      "SELECT * FROM gold_rates ORDER BY `date` DESC LIMIT 1",
      { type: QueryTypes.SELECT },
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No rate available" });
    }

    res.json(rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch current rate", error: error.message });
  }
};

/* =========================
   GET RATE BY DATE
========================= */
exports.getRateByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const rows = await sequelize.query(
      "SELECT * FROM gold_rates WHERE `date` = :date",
      {
        replacements: { date },
        type: QueryTypes.SELECT,
      },
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Rate not found for this date" });
    }

    res.json(rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch rate", error: error.message });
  }
};

/* =========================
   GET RATE HISTORY
========================= */
exports.getRateHistory = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const rows = await sequelize.query(
      "SELECT * FROM gold_rates ORDER BY `date` DESC LIMIT :days",
      {
        replacements: { days },
        type: QueryTypes.SELECT,
      },
    );

    res.json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch history", error: error.message });
  }
};

/* =========================
   DELETE RATE
========================= */
exports.deleteRate = async (req, res) => {
  try {
    const { date } = req.params;

    await sequelize.query("DELETE FROM gold_rates WHERE `date` = :date", {
      replacements: { date },
      type: QueryTypes.DELETE,
    });

    res.json({ message: "Gold rate deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete rate", error: error.message });
  }
};
