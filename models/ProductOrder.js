// models/ProductOrder.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Assuming your Sequelize instance is initialized here

const ProductOrder = sequelize.define("ProductOrder", {
  order_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  Buyer: {
    type: DataTypes.STRING,
    defaultValue: "Eiichiro Masaki",
  },
  expected_arrival: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Other fields...
});

module.exports = ProductOrder;
