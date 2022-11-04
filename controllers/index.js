const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const User = require('../models/user');
const { createMessages, hasNoSpace, isAlreadyLoggedIn } = require('./utils');

module.exports = {
  home: (req, res) => {
    res.render('index');
  },
  signup: {
    get: [
      isAlreadyLoggedIn,
      (req, res) => {
        res.render('signup');
      },
    ],
    post: [
      body('username')
        .trim()
        .escape()
        .custom(hasNoSpace)
        .withMessage('No spaces are allowed')
        .isAlphanumeric()
        .withMessage('Username has non-alphanumeric characters')
        .isLength({ min: 4, max: 30 })
        .withMessage(
          'Username must be at least 4 characters and no more than 30 characters'
        )
        .custom((value) =>
          // Might throw an error unrelated to validation (fetching errors)
          User.findById(value).then(
            (res) =>
              res && Promise.reject(new Error(`Username is already taken`))
          )
        ),
      body('password')
        .trim()
        .custom(hasNoSpace)
        .withMessage('No spaces are allowed')
        .isStrongPassword()
        .withMessage('Password must be a strong password'),
      (req, res, next) => {
        const errors = validationResult(req);
        const { username, password } = req.body;

        if (errors.isEmpty()) {
          new User({ username, password }).save(next);
        } else {
          res.render('signup', {
            messages: createMessages('danger', errors.array()),
          });
        }
      },
      passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/',
      }),
    ],
  },
  login: {
    get: [
      isAlreadyLoggedIn,
      (req, res) => {
        if (req.query.restricted) {
          res.locals.messages = createMessages(
            'warning',
            'You must be logged in to continue'
          );
        }

        res.render('login');
      },
    ],
    post: [
      body('username').trim().escape(),
      body('password').trim(),
      (req, res, next) => {
        passport.authenticate('local', (err, user) => {
          if (err) {
            return res.render('login', {
              messages: createMessages('danger', err),
            });
          }

          if (!user) return res.redirect('/login');

          req.login(user, next);
        })(req, res, next);
      },
      (req, res) => {
        res.redirect('/');
      },
    ],
  },
  logout: (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);

      res.redirect('/');
    });
  },
};
