const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
var https = require('https');
const db = require('./config/database');
var randomstring = require("randomstring");
// const session = require('session');
var session = require('express-session');
var cookieParser = require('cookie-parser')
//for google login and create account + session
const User = require('./models/User');
const Op = db.Op;
var passport = require('passport');

const app = express();
app.use(cookieParser());
app.use(express.static('public'));
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

// Handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

var GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.use(new GoogleStrategy({
        clientID: '466943566334-9bppfnsql29gra4g256rto8acbcaue90.apps.googleusercontent.com',
        clientSecret: 's7205z_fH4OWY7sfddHuyx3R',
        callbackURL: "http://snackbox.rockyou.th/connect/google/callback",
        passReqToCallback: true
    },
    function(request, accessToken, refreshToken, profile, done) {
        var google_id = profile.id;
        var full_name = profile.displayName;
        var token = accessToken;
        var user_name = profile.emails[0].value;
        var roll = "user";

        var cookieToken = request.cookies['snackToken'];
        console.log("found cookie: "+ cookieToken);
        session[cookieToken] = {};
        if (profile._json.domain == 'wildskymedia.com') {
                session[cookieToken].token = token;
                session[cookieToken].roll = roll;
                session[cookieToken].full_name = full_name;
                session[cookieToken].google_id = google_id;
                console.log("finding user");
                User.findOne({ where: { google_id:google_id} })
                .then( users => {
                    if (users == null || users.length < 1){ //can't find user
                    console.log("can't find user create new one");
                        User.create({
                            google_id,
                            full_name,
                            token,
                            user_name,
                            roll
                        });
                        console.log("Create account properly");
                    } else { //found user and update data
                        console.log("found user so update it");
                        users.update({
                            google_id: google_id,
                            name: full_name,
                            token: token,
                            user_name: user_name,
                        }).catch(err=> console.log(err));
                        session[cookieToken].roll = users.roll;
                        if (session[cookieToken].roll == "admin"){
                            session[cookieToken].admin = true;
                        } else {
                            session[cookieToken].admin = false;
                        }
                    }
                    console.log("Complete auth");
                    return done();
                })
                .catch(err => { //got error finding user, attemt to create new one
                    console.log(err);
                    console.log("got error finding user, attemt to create new one");
                    User.create({
                        google_id,
                        full_name,
                        token,
                        user_name,
                        roll
                    });
                })
            }
        }
));
// route
app.get('/', (req, res) => {
    console.log("//////////////////////////");
    let cookieToken = setCookie(res, req.cookies.snackToken);
    res.render('help', {
        user_name: session[cookieToken].full_name,
        roll: session[cookieToken].roll })
});

// Gig routes
app.use('/products', require('./routes/products'));

app.get('/convert/:url', (req, res, next) =>{
  https.get('https://shoponline.tescolotus.com/groceries/en-GB/products/'+req.params.url, (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => { res.send(data); });
  }).on("error", (err) => { res.send("Worng!"); });
});

app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'https://www.googleapis.com/auth/plus.login',
      , 'https://www.googleapis.com/auth/plus.profile.emails.read' ] }
));
// app.get('/connect/google/callback',
//     passport.authenticate( 'google', {
//         successRedirect: '/',
//         failureRedirect: '/'
// }));
app.get('/connect/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});
app.get('/logout', (req, res) => {
    let cookieToken = req.cookies['snackToken'];
    res.clearCookie("key");
    if (!cookieToken || cookieToken === 'undefined') {
        session[cookieToken] = null;
    }
    res.cookie('snackToken', null);
    res.render('index', { layout: 'landing' })
});

// const PORT = 3000;
const PORT = 80;
function setCookie(res, cookieToken){
    if (!cookieToken || cookieToken === 'undefined') {
        let cookieToken = randomstring.generate(32);
        // res.cookie('snackFullName', snackFullName);
        res.cookie('snackToken', cookieToken);
    }
    if (!session[cookieToken] || typeof session[cookieToken] === 'undefined' || cookieToken === 'undefined') {  session[cookieToken] = {};  }
    return cookieToken
}
app.listen(PORT, console.log(`Server started on port ${PORT}`));
