const async = require('async');
const { param } = require('express-validator');
const User = require('../models/user');
const Board = require('../models/board');
const Post = require('../models/post');
const { isLoggedIn } = require('../middlewares/authentication');
const { ifNotFound } = require('./utils');

module.exports = {
  index: [
    isLoggedIn,
    (req, res, next) => {
      async.parallel(
        {
          boards: (callback) =>
            Board.find({ _id: { $in: req.user.boards } }).exec(callback),
          posts: (callback) =>
            Post.findByAuthor(req.user.username).exec(callback),
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
            Post.findByAuthor(req.params.username).exec(callback),
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
};
