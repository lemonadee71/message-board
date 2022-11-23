const async = require('async');
const { body } = require('express-validator');
const { param } = require('express-validator');
const User = require('../models/user');
const Board = require('../models/board');
const Post = require('../models/post');
const { isLoggedIn } = require('../middlewares/authentication');
const {
  ifNotFound,
  finishValidation,
  extractFlashMessages,
} = require('./utils');

module.exports = {
  index: [
    isLoggedIn,
    extractFlashMessages('error'),
    (req, res, next) => {
      async.parallel(
        {
          boards: (callback) =>
            Board.find({ _id: { $in: req.user.boards } })
              .sort({ boardname: 'desc' })
              .exec(callback),
          posts: (callback) =>
            Post.findByAuthor(req.user.username)
              .sort({ date_created: 'desc' })
              .exec(callback),
        },
        (err, results) => {
          if (err) return next(err);

          res.render('pages/user/index', {
            posts: results.posts.map((post) => post.toSafeObject()),
            boards: results.boards.map((board) => board.toSafeObject()),
            global_state: "{ tab: 'posts' }",
          });
        }
      );
    },
  ],
  profile: [
    // TODO: Add profile banner like for board page
    param('username').toLowerCase().escape(),
    (req, res, next) => {
      async.parallel(
        {
          user: (callback) =>
            User.findByName(req.params.username).exec(callback),
          posts: (callback) =>
            Post.findByAuthor(req.params.username)
              .sort({ date_created: 'desc' })
              .where({ private: false })
              .exec(callback),
        },
        (err, results) => {
          if (err) return next(err);

          res.render('pages/user/public_profile', {
            user: results.user.toSafeObject(),
            posts: results.posts.map((post) => post.toSafeObject()),
          });
        }
      );
    },
    ifNotFound('pages/user/not_found'),
  ],
  edit: [
    isLoggedIn,
    body('display_name')
      .optional({ checkFalsy: true })
      .trim()
      .escape()
      .isLength({ min: 2, max: 30 })
      .withMessage(
        'Must be at least 2 characteres and no more than 30 characters'
      ),
    body('bio')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 200 })
      .withMessage('User bio must not exceed 200 characters'),
    finishValidation()
      .ifSuccess((req, res) => {
        if (req.query.field === 'display_name') {
          req.user.display_name = req.body.display_name || undefined;
        } else if (req.query.field === 'bio') {
          req.user.bio = req.body.bio || '';
        }

        req.user.save().then(() => res.redirect('/profile'));
      })
      .ifHasError((errors, req, res) => {
        req.flash('error', errors);
        res.redirect('/profile');
      }),
  ],
};
