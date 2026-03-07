// export interface Customer {
//   id?: number;
//   full_name: string;
//   mobile_number: string;
//   address: string;
//   profile_picture_url?: string;
// }

module.exports = (sequelize: any, DataTypes: any) => {
  const Customer = sequelize.define("Customer", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profile_picture_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return Customer;
};
