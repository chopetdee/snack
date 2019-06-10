const Sequelize = require('sequelize');

// module.exports =  new Sequelize('snack', 'root', 'password@123', {
module.exports =  new Sequelize('snack', 'root', 'master', {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});
