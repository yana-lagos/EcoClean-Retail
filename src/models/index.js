const sequelize = require("../config/database");
const User = require("./User");
const Category = require("./Category");
const Product = require("./Product");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Delivery = require("./Delivery");

User.hasMany(Order, { foreingKey: "userID", as: "orders" });
Order.belongsTo(User, { foreingKey: "userID", as: "user" });

Category.hasMany(Product, { foreingKey: "categoryId", as: "products" });
Product.belongsTo(Category, { foreingKey: "categoryId", as: "category" });

Product.hasMany(OrderItem, { foreingKey: "productId", as: "products" });
OrderItem.belongsTo(Product, { foreingKey: "productId", as: "category" });

Order.hasMany(Delivery, { foreingKey: "orderId", as: "delivery" });
Delivery.belongsTo(Order, { foreingKey: "orderId", as: "order" });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Delivery,
};
