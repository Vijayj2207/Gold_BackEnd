const { sequelize } = require("../config/db");
const { QueryTypes } = require("sequelize");

// CREATE CUSTOMER
exports.createCustomer = async (data) => {
  const [result] = await sequelize.query(
    `INSERT INTO customers 
     (full_name, mobile_number, address, profile_picture_url)
     VALUES (:full_name, :mobile_number, :address, :profile_picture_url)`,
    {
      replacements: {
        full_name: data.full_name,
        mobile_number: data.mobile_number,
        address: data.address,
        profile_picture_url: data.profile_picture_url,
      },
      type: QueryTypes.INSERT,
    },
  );

  return {
    id: result,
    ...data,
  };
};

// GET ALL CUSTOMERS
exports.getCustomers = async () => {
  return await sequelize.query(
    `SELECT id, full_name, mobile_number, address, profile_picture_url 
     FROM customers`,
    {
      type: QueryTypes.SELECT,
    },
  );
};

// GET CUSTOMER BY ID
exports.getCustomerById = async (id) => {
  const rows = await sequelize.query(
    `SELECT id, full_name, mobile_number, address, profile_picture_url 
     FROM customers 
     WHERE id = :id`,
    {
      replacements: { id },
      type: QueryTypes.SELECT,
    },
  );

  return rows[0];
};

// UPDATE CUSTOMER
exports.updateCustomer = async (id, data) => {
  await sequelize.query(
    `UPDATE customers
     SET full_name = :full_name,
         mobile_number = :mobile_number,
         address = :address,
         profile_picture_url = :profile_picture_url
     WHERE id = :id`,
    {
      replacements: {
        id,
        full_name: data.full_name,
        mobile_number: data.mobile_number,
        address: data.address,
        profile_picture_url: data.profile_picture_url,
      },
      type: QueryTypes.UPDATE,
    },
  );

  return { id, ...data };
};

// DELETE CUSTOMER
exports.deleteCustomer = async (id) => {
  await sequelize.query(`DELETE FROM customers WHERE id = :id`, {
    replacements: { id },
    type: QueryTypes.DELETE,
  });
};
