const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/db");
const { QueryTypes } = require("sequelize");
exports.createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const [result] = await sequelize.query(
    "INSERT INTO users (name, email, password) VALUES (:name, :email, :password)",
    {
      replacements: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      type: QueryTypes.INSERT,
    },
  );

  return { id: result, name: data.name, email: data.email };
};

exports.loginUser = async (email, password) => {
  const rows = await sequelize.query(
    "SELECT * FROM users WHERE email = :email",
    {
      replacements: { email: email }, // ✅ explicit key
      type: QueryTypes.SELECT,
    },
  );

  if (!rows || rows.length === 0) {
    throw new Error("User not found");
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid password");
  }

  return { id: user.id, name: user.name, email: user.email };
};

exports.getUsers = async () => {
  return await sequelize.query("SELECT id, name, email FROM users", {
    type: QueryTypes.SELECT,
  });
};

exports.getUserById = async (id) => {
  const rows = await sequelize.query(
    "SELECT id, name, email FROM users WHERE id = :id",
    {
      replacements: { id },
      type: QueryTypes.SELECT,
    },
  );
  return rows[0];
};

exports.updateUser = async (id, data) => {
  await sequelize.query(
    "UPDATE users SET name = :name, email = :email WHERE id = :id",
    {
      replacements: { name: data.name, email: data.email, id },
      type: QueryTypes.UPDATE,
    },
  );
  return { id, ...data };
};

exports.deleteUser = async (id) => {
  await sequelize.query("DELETE FROM users WHERE id = :id", {
    replacements: { id },
    type: QueryTypes.DELETE,
  });
};
