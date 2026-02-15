const userService = require("../services/user.service");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await userService.loginUser(
      req.body.email,
      req.body.password
    );

    const token = generateToken(user);

    res.json({ user, token });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  const users = await userService.getUsers();
  res.json(users);
};

exports.getById = async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json(user);
};

exports.update = async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json(user);
};

exports.remove = async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.json({ message: "User deleted" });
};
