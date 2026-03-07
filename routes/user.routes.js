const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");

// register
router.post("/register", userController.register);

// login
router.post("/login", userController.login);

// get all users
router.get("/", userController.getAll);

// get user by id
router.get("/:id", userController.getById);

// update user
router.put("/:id", userController.update);

// delete user
router.delete("/:id", userController.remove);

module.exports = router;
