const express = require('express');
const router = express.Router();
const db = require('../config/database');
const User = require('../models/User');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Get Product list
router.get('/page/:page', (req, res) =>
  Product.findAll({ where: { ban: { [Op.like]: '' + 0 + '' } }, order: [['favorite', 'DESC'],['like', 'DESC']], offset: (req.params.page-1)*5, limit: 5  })
    .then(products => res.render('products', { products, count: 3  } ) )
router.get('/ban', (req, res) =>
  Product.findAll({ where: { ban: { [Op.like]: '' + 1 + '' } } })
    .then(products => res.render('products', {
      products
      }))
    .catch(err => console.log(err)));

// Add a Product
router.post('/login', (req, res) => {
  var ress = "none";
  let { id, google_id, first_name, last_name, token, user_name, roll} = req.body;
  User.findAll({ where: { google_id: { [Op.like]: google_id } } })
    .then( products => {
      if (products.length < 1){
        User.create({
          id,
          google_id,
          first_name,
          last_name,
          token,
          user_name,
          roll
        });
        res.send("create");
      } else {
        products[0].update({
          id: id,
          google_id: google_id,
          first_name: first_name,
          last_name: last_name,
          token: token,
          user_name: user_name,
          roll: roll
        });
        res.send("update");
      }
    })
    .catch(err => {
      res.send("fail");
    });
});


// Search for products
router.get('/search', (req, res) => {
  let { term } = req.query;
  // term = term.toLowerCase();

  Product.findAll({ where: { id: { [Op.like]: '' + term + '' } } })
    .then(products => res.render('products', { products }))
    .catch(err => console.log(err));
});

module.exports = router;
