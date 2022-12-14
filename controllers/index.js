const async = require('async');
const { body } = require('express-validator');
const passport = require('passport');
const { isAlreadyLoggedIn } = require('../middlewares/authentication');
const Board = require('../models/board');
const Post = require('../models/post');
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
    (req, res, next) => {
      async.parallel(
        {
          boards: (callback) =>
            Board.find().sort({ date_created: 'desc' }).exec(callback),
          posts: (callback) =>
            Post.find({ private: false })
              .sort({ date_created: 'desc' })
              .exec(callback),
        },
        (err, results) => {
          if (err) return next(err);

          res.render('index', results);
        }
      );
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
        .toLowerCase()
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
      body('display_name')
        .optional({ checkFalsy: true })
        .trim()
        .escape()
        .isLength({ min: 2, max: 30 })
        .withMessage(
          'Must be at least 2 characteres and no more than 30 characters'
        ),
      body('password')
        .trim()
        .custom(hasNoSpace)
        .withMessage('No spaces are allowed')
        .isStrongPassword()
        .withMessage('Password must be a strong password'),
      body('bio')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 200 })
        .withMessage('User bio must not exceed 200 characters'),
      finishValidation()
        .ifSuccess((req, res, next) => {
          new User({
            username: req.body.username,
            password: req.body.password,
            display_name: req.body.display_name || undefined,
            bio: req.body.bio,
          }).save(next);
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
      extractFlashMessages('warning'),
      (req, res) => {
        req.flash('context.referer', req.get('referer'));
        res.render('login');
      },
    ],
    post: [
      body('username').trim().escape(),
      body('password').trim(),
      (req, res, next) => {
        req.fromPath = req.flash('context.referer')[0];

        passport.authenticate('local', (err, user) => {
          if (err) {
            return res.render('login', {
              messages: createMessages('error', null, err.message),
            });
          }

          if (!user) return res.redirect('/login');

          req.login(user, next);
        })(req, res, next);
      },
      (req, res) => {
        res.redirect(req.fromPath ? new URL(req.fromPath).pathname : '/');
      },
    ],
  },
  logout: (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      const referer = new URL(req.get('referer')).pathname;

      res.redirect(referer === '/profile' ? '/' : referer);
    });
  },
};
