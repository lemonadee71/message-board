const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const User = require('../models/user');

module.exports = {
  home: (req, res) => {
    res.render('index', { title: "Lemon's Message Board" });
  },
  signup: {
    get: (req, res) => {
      res.render('signup');
    },
    post: [
      body('username')
        .trim()
        .escape()
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
              res &&
              Promise.reject(
                new Error(`User with the username, ${value} already exists`)
              )
          )
        ),
      body('password')
        .trim()
        .isStrongPassword()
        .withMessage('Password must be a strong password'),
      (req, res, next) => {
        const errors = validationResult(req);
        const { username, password } = req.body;

        if (errors.isEmpty()) {
          new User({ username, password }).save(() => next());
        } else {
          res.render('signup', { errors: errors.array() });
        }
      },
      passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/',
      }),
    ],
  },
  login: {
    get: (req, res) => {
      res.render('login');
    },
    post: passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/signup',
    }),
  },
  logout: (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);

      res.redirect('/');
    });
  },
};
