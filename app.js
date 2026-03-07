const express = require("express");
const cors = require("cors");

const app = express();

/* =========================
   CORS
========================= */
app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "http://127.0.0.1:8080",
      "http://192.168.1.20:8080",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

/* =========================
   BODY PARSER
========================= */
app.use(express.json());

/* =========================
   ROUTES
========================= */
const userRoutes = require("./routes/user.routes");
const customerRoutes = require("./routes/customer.routes");
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);

module.exports = app;
