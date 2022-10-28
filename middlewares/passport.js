const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const User = require('../models/user');

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, {
          message: `No accout with username: ${username}`,
        });
      }

      bcrypt.compare(password, user.password, (e, res) => {
        if (e) return done(e);

        // passwords match! log user in
        if (res) return done(null, user);

        // passwords do not match!
        return done(null, false, { message: 'Incorrect password' });
      });
    });
  })
);

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, done);
});

module.exports = [
  passport.initialize(),
  passport.session(),
  // make user accessible to views
  (req, res, next) => {
    res.locals.currentUser = req.user;
    next();
  },
];
