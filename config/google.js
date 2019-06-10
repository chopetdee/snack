var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
// var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// User = require('./../model/user');
module.exports = function () {
passport.use(new GoogleStrategy({
      clientID: '466943566334-9bppfnsql29gra4g256rto8acbcaue90.apps.googleusercontent.com',
      clientSecret: 's7205z_fH4OWY7sfddHuyx3R',
      callbackURL: "http://localhost:5000"
    },
    function(accessToken, refreshToken, profile, cb) {
      console.log("Logged in!!!!!!");
      console.log(profile.emails[0].value);
        // User.findOne({ googleId : profile.id }, function (err, user) {
        //     if(err){
        //         return cb(err, false, {message : err});
        //     }else {
        //         if (user != '' && user != null) {
        //             return cb(null, user, {message : "User "});
        //         } else {
        //             var username  = profile.displayName.split(' ');
        //             var userData = new User({
        //                 name : profile.displayName,
        //                 username : username[0],
        //                 password : username[0],
        //                 facebookId : '',
        //                 googleId : profile.id,
        //             });
        //             // send email to user just in case required to send the newly created
        //             // credentails to user for future login without using google login
        //             userData.save(function (err, newuser) {
        //                 if (err) {
        //                     return cb(null, false, {message : err + " !!! Please try again"});
        //                 }else{
        //                     return cb(null, newuser);
        //                 }
        //             });
        //         }
        //     }
        // });
      }
  ));
};
