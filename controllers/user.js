const async = require('async');
const { param } = require('express-validator');
const User = require('../models/user');
const Post = require('../models/post');
const { ifNotFound } = require('./utils');

module.exports = {
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
