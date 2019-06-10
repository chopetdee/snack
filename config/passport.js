var passport = require  ('passport'),
google = require('./google');
// User = require('./../model/user'); // User is the  mongoose model


module.exports = function(app){
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser(function(user, done){
      done(null, user);
  });
  passport.deserializeUser(function (user, done) {
     done(null, user);
  });
  google();
};
