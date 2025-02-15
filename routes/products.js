const express = require('express');
var session = require('express-session');
// const session = require('session');
const router = express.Router();
const db = require('../config/database');
const Product = require('../models/Product');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
var randomstring = require("randomstring");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
let limit = 40; //limit item perpage

// Get Product list
router.get('/page/:page', (req, res) => {
    let cookieToken = setCookie(res, req.cookies.snackToken);
    let product_query_name = "";
    let categories = {};
    let count = [];
    if (!(parseInt(req.params.page))) {
        product_query_name = req.params.page;
        req.params.page = 1;
        limit = 1000;
    }
    Product.hasMany(Favorite, {foreignKey: 'product_id'});
    Favorite.belongsTo(Product, {foreignKey: 'product_id'});
    Product.findAll({ where: { ban: 0}} ).then(products =>{
        for (var i = 0 ; i < products.length; i++) {
            categories[products[i].product_decription] = products[i].product_decription;
        }
        categories = Object.keys(categories);
        count = [];
        for(let i = 0 ; i <= (products.length-1)/limit ; i++){
            count[i] = i+1;
        }
    });
    Product.findAll({
        include: [{
            model: Favorite,
            require: false,
            attributes: ['feeling', 'google_id'],
        }],
        where: { ban: 0 , [Op.or]: [{product_name: {[Op.like]: "%"+product_query_name+"%"}},  {product_decription: {[Op.like]: "%"+product_query_name+"%"}}] },
        order: [ ['score', 'DESC'], ['favorite', 'DESC'] ],
        offset: (req.params.page - 1) * limit,
        limit: limit
    })
    .then(products => {
        for (var i = 0 ; i < products.length; i++) {
            products[0].id=products[0].id;
            products[i].feeling = "natural";
            if (products[i].favorites.length > 0){
                for (var j = 0 ; j < products[i].favorites.length; j++) {
                    if (products[i].favorites[j].google_id == session[cookieToken].google_id){
                        products[i].feeling = products[i].favorites[j].feeling;
                        products[i]["current_"+products[i].feeling] = true;
                    }
                }
            }
        }
        res.render('products', {
            products,
            count: count,
            user_name: session[cookieToken].full_name,
            admin: session[cookieToken].admin,
            categories
        })
    })
    .catch(err => console.log(err))
});

//for admin
router.get('/ban/:page', (req, res) =>{
    let cookieToken = setCookie(res, req.cookies.snackToken);
    let categories = {};
    let count = [];
    let product_query_name = "";
    if (!(parseInt(req.params.page))) {
        product_query_name = req.params.page;
        req.params.page = 1;
        limit = 1000;
    }
    Product.findAll({where: { ban: 1 }}).then(products =>{
        for(let i = 0 ; i <= (products.length-1)/limit ; i++){
            count[i] = i+1;
        }
        for (var i = 0 ; i < products.length; i++) {
            categories[products[i].product_decription] = products[i].product_decription;
        }
        categories = Object.keys(categories);
    });
    Product.findAll({
        where: { ban: 1 , [Op.or]: [{product_name: {[Op.like]: "%"+product_query_name+"%"}},  {product_decription: {[Op.like]: "%"+product_query_name+"%"}}] },
        order: [ ['score', 'DESC'], ['favorite', 'DESC'] ],
        offset: (req.params.page - 1) * limit,
        limit: limit
    })
        .then(products => {
            res.render('products', { products, count:count, user_name: session[cookieToken].full_name , admin:session[cookieToken].admin, ban:true, categories})
        })
        .catch(err => console.log(err))});
//make admin

//for each member

router.get('/feeling/:felt/:page', (req, res) => {
    let cookieToken = setCookie(res, req.cookies.snackToken);
    let categories = {};
    let count = [];
    let product_query_name = "";
    if (!(parseInt(req.params.page))) {
        product_query_name = req.params.page;
        req.params.page = 1;
        limit = 1000;
    }
    Product.hasMany(Favorite, {foreignKey: 'product_id'});
    Favorite.belongsTo(Product, {foreignKey: 'product_id'});
    Product.findAll({
        include: [{
            model: Favorite,
            require: false,
            attributes: ['feeling', 'google_id'],
            where: { google_id: session[cookieToken].google_id, feeling:req.params.felt },
        }],
        where: { ban: 0 },
    })
        .then(products =>{
            for(let i = 0 ; i <= (products.length-1)/limit ; i++){
                count[i] = i+1;
            }
            for (var i = 0 ; i < products.length; i++) {
                categories[products[i].product_decription] = products[i].product_decription;
            }
            categories = Object.keys(categories);
        });
    Product.findAll({
        include: [{
            model: Favorite,
            require: false,
            attributes: ['feeling', 'google_id'],
            where: { google_id: session[cookieToken].google_id, feeling:req.params.felt },
        }],
        where: {
            ban: 0 ,
            [Op.or]: [{product_name: {[Op.like]: "%"+product_query_name+"%"}},  {product_decription: {[Op.like]: "%"+product_query_name+"%"}}]
        },
        order: [ ['score', 'DESC'], ['favorite', 'DESC'] ],
        offset: (req.params.page - 1) * limit,
        limit: limit
    })
        .then(products => {
            for (var i = 0 ; i < products.length; i++) {
                products[i].feeling = "natural";
                if (products[i].favorites.length > 0){
                    for (var j = 0 ; j < products[i].favorites.length; j++) {
                        if (products[i].favorites[j].google_id == session[cookieToken].google_id){
                            products[i].feeling = products[i].favorites[j].feeling;
                            products[i]["current_"+products[i].feeling] = true;
                        }
                    }
                }
            }
            res.render('products', {
                products,
                count: count,
                user_name: session[cookieToken].full_name,
                admin: session[cookieToken].admin,
                categories
            })
        })
        .catch(err => console.log(err))
});
//for member to express there feeling
router.post('/banItem', (req, res) => {
    let { lotus_id } = req.body;
    Product.findAll({ where: { lotus_id: lotus_id } })
    .then(products => {
        if (products.length < 1) {
            res.send("Not Found");
        } else {
            products[0].update({ ban: 1 - products[0].ban });
            res.send("Updated");
        }
    })
    .catch(err => { res.send("Fail"); });
});
router.post('/expressFelling', (req, res) => {
    let cookieToken = setCookie(res, req.cookies.snackToken);

//      UPDATE `products` SET `love` = '0' , `hate` = '0' , `favorite` = '0' WHERE 1;
    if(session[cookieToken].google_id){
        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++");
        let { lotus_id, felt, product_id } = req.body;
        Favorite.findOrCreate({
            where: { lotus_id: lotus_id, google_id:session[cookieToken].google_id, product_id:product_id } ,
            defaults: {feeling:"natural"}
        })
        .spread( (favorites,created) => {
            Product.findOne({ where: { lotus_id: lotus_id } })
                .then(products => {
                    if (favorites.feeling != "natural") products[favorites.feeling] -= 1;
                    if (["love","favorite"].includes(favorites.feeling)) products.score -= 1;
                    if (["love","favorite"].includes(felt)) products.score += 1;
                    favorites.feeling = felt;
                    products[felt] += 1 ;
                    products.save();
                    favorites.save();
                    res.send("success");
                });
        });
    }
});

// Display add Product form
router.get('/add', (req, res) => {
    let cookieToken = setCookie(res, req.cookies.snackToken);
    res.render('add', {
    user_name: session[cookieToken].full_name,
    admin: session[cookieToken].admin
})});
// Add a Product
router.post('/add', (req, res) => {
    console.log('/add');
    let cookieToken = setCookie(res, req.cookies.snackToken);
    var ress = "none";
    let {
        product_name,
        product_price,
        product_decription, //its actually category
        lotus_id,
        product_url
    } = req.body;
    let ban = 0;
    if (!allows.includes(product_decription)){ return res.send("block");  }
    if (session[cookieToken].google_id){
        let errors = [];
        Product.findAll({ where: { lotus_id: lotus_id } })
        .then(products => {
            if (products.length < 1) {
                Product.create({
                    product_name,
                    product_price,
                    product_decription,
                    lotus_id,
                    product_url,
                    ban
                })
                .then(products => { res.send(products); })
            } else {
                if (products[0].ban == 1) { res.send("ban"); }
                else { res.send("update"); }
                products[0].update({
                    product_name: product_name,
                    product_price: product_price,
                    product_decription: product_decription,
                    lotus_id: lotus_id,
                    product_url: product_url
                });
            }
        })
        .catch(err => { res.send("fail"); });
    } else {
        res.send("not login");
    }
});
// Reser score
router.post('/reset', (req, res) => {
    let { feeling } = req.body;
    let cookieToken = setCookie(res, req.cookies.snackToken);
    let neEqzoro = { [Op.not]: 0};
    let condotionF = { where: { feeling: { [Op.not]: 'hate'} }};
    let condotionP = { where: { [Op.or]: [{love: neEqzoro} ,{favorite: neEqzoro}] }};
    let resetZ = {
        favorite : 0,
        love : 0,
        score : 0
    };
    if (feeling == 'hard'){
        condotionF = { where: {}, truncate: true };
        condotionP = { where: { [Op.or]: [{love: neEqzoro},{favorite: neEqzoro}, {hate: neEqzoro}] }};
        resetZ.hate = 0;
    }
    if(session[cookieToken].google_id){
        Favorite.destroy(condotionF);
        Product.update(resetZ, condotionP);
    }
});
// Search for products
router.get('/search', (req, res) => {
    let cookieToken = setCookie(res, req.cookies.snackToken);

    let { term } = req.query;
    Product.findAll({
            where: {
                id: term
            }
        })
        .then(products => res.render('products', {
            products,
            admin: session[cookieToken].admin
        }))
        .catch(err => console.log(err));
});

const allows = [
    "Cooking Ingredients",
    "Instant Noodles, Porridge & Soup",
    "Beverages",
    "Snacks",
    "Milk",
    "Tea",
    "Coffee",
    "Ice Cream & Desserts",
    "Juices"
];

function setCookie(res, cookieToken){
    if (!cookieToken || cookieToken === 'undefined') {
        let cookieToken = ran32();
        res.cookie('snackToken', cookieToken);
    }
    if (!session[cookieToken] || typeof session[cookieToken] === 'undefined' || cookieToken === 'undefined') {  session[cookieToken] = {};  }
    return cookieToken
}
function ran32(){
    let gen = randomstring.generate(32);
    while (gen in session){
        gen = randomstring.generate(32);
    }
    return gen;
}
module.exports = router;
