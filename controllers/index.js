const { body } = require('express-validator');
const passport = require('passport');
const { isAlreadyLoggedIn } = require('../middlewares/authentication');
const User = require('../models/user');
const {
  createMessages,
  hasNoSpace,
  extractFlashMessages,
  finishValidation,
} = require('./utils');

module.exports = {
  home: [
    extractFlashMessages('success'),
    extractFlashMessages('error'),
    (req, res) => {
      res.render('index');
    },
  ],
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
      finishValidation()
        .ifSuccess((req, res, next) => {
          const { username, password } = req.body;
          new User({ username, password }).save(next);
        })
        .ifHasError((errors, req, res) =>
          res.render('signup', { messages: errors })
        ),
      passport.authenticate('local', {
        failureRedirect: '/',
        failureFlash: true,
      }),
      (req, res) => {
        req.flash('success', 'You successfully created your account!');
        res.redirect('/');
      },
    ],
  },
  login: {
    get: [
      isAlreadyLoggedIn,
      extractFlashMessages('restricted', 'warning'),
      (req, res) => res.render('login'),
    ],
    post: [
      body('username').trim().escape(),
      body('password').trim(),
      (req, res, next) => {
        passport.authenticate('local', (err, user) => {
          if (err) {
            return res.render('login', {
              messages: createMessages('danger', null, err.message),
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

      res.redirect(new URL(req.get('referer')).pathname);
    });
  },
};
