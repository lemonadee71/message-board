const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findById(username).orFail(
        new Error('User not found!')
      );
      const isMatch = await user.comparePassword(password);

      if (isMatch) done(null, user);
      else done(null, false, { message: 'Incorrect pasword' });
    } catch (error) {
      done(error);
    }
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.username);
});

passport.deserializeUser(function (username, done) {
  User.findById(username, done);
});

module.exports = [
  passport.initialize(),
  passport.session(),
  // make user accessible to views
  (req, res, next) => {
    const user = { ...req.user };
    delete user.password;
    res.locals.currentUser = user;
    next();
  },
];
