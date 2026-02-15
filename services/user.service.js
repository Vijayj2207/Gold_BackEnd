const bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.User;

exports.createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword
  });
};

exports.loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });

  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid password");

  return user;
};

exports.getUsers = async () => {
  return await User.findAll();
};

exports.getUserById = async (id) => {
  return await User.findByPk(id);
};

exports.updateUser = async (id, data) => {
  await User.update(data, { where: { id } });
  return await User.findByPk(id);
};

exports.deleteUser = async (id) => {
  return await User.destroy({ where: { id } });
};
