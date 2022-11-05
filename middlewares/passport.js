const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const defaultError = new Error(
      'You have entered an invalid username or password'
    );

    try {
      const user = await User.findById(username).orFail(defaultError);
      const isMatch = await user.comparePassword(password);

      if (isMatch) done(null, user);
      else done(defaultError);
    } catch (error) {
      done(error);
    }
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.username);
});

passport.deserializeUser(function (username, done) {
  User.findById(username)
    .then((user) => done(null, user))
    .catch(done);
});

module.exports = [
  passport.initialize(),
  passport.session(),
  // make user accessible to views
  (req, res, next) => {
    res.locals.current_user = req.user?.toSafeObject();
    next();
  },
];
