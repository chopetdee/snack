const Sequelize = require('sequelize');
const Product = require('../models/Product');
const db = require('../config/database');

const Favorite = db.define('favorite', {
    lotus_id: {
        type: Sequelize.STRING
    },
    product_id: {
      type: Sequelize.STRING
    },
    google_id: {
        type: Sequelize.STRING
    },
    feeling: {
        type: Sequelize.STRING
    }
})

module.exports = Favorite;
