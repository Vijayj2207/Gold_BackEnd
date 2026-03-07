const userService = require("../services/user.service");
const generateToken = require("../utils/generateToken");

/* ===========================
   REGISTER
=========================== */
exports.register = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ===========================
   LOGIN
=========================== */
exports.login = async (req, res) => {
  try {
    const user = await userService.loginUser(req.body.email, req.body.password);
    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

/* ===========================
   GET ALL USERS
=========================== */
exports.getAll = async (req, res) => {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===========================
   GET USER BY ID
=========================== */
exports.getById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===========================
   UPDATE USER
=========================== */
exports.update = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===========================
   DELETE USER
=========================== */
exports.remove = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
