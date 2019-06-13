const Sequelize = require('sequelize');
const db = require('../config/database');

const User = db.define('user', {
    google_id: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    },
    token: {
        type: Sequelize.STRING
    },
    user_name: {
        type: Sequelize.STRING
    },
    roll: {
        type: Sequelize.STRING
    },
    token: {
        type: Sequelize.STRING
    }
})

module.exports = User;
