const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");
const upload = require("../middleware/upload.middleware.js"); // ← was missing

router.post("/",   upload.single("profilePicture"), customerController.createCustomer);
router.get("/",    customerController.getCustomers);
router.get("/:id", customerController.getCustomerById);
router.put("/:id", upload.single("profilePicture"), customerController.updateCustomer); // ← also needed for edit
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;