const Sequelize = require('sequelize');
const db = require('../config/database');

const Product = db.define('product', {
  product_name: {
    type: Sequelize.STRING
  },
  product_price: {
    type: Sequelize.INTEGER
  },
  product_decription: {
    type: Sequelize.STRING
  },
  lotus_id: {
    type: Sequelize.STRING
  },
  product_url: {
    type: Sequelize.STRING
  },
  ban: {
    type: Sequelize.INTEGER, defaultValue: 0
  },
  love: {
    type: Sequelize.INTEGER
  },
  hate: {
    type: Sequelize.INTEGER
  },
  favorite: {
    type: Sequelize.INTEGER
  },
  score:{
    type: Sequelize.INTEGER
  }
})


module.exports = Product;
