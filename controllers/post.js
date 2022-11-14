const { body, param, validationResult } = require('express-validator');
const escapeHtml = require('escape-html');
const { isLoggedIn } = require('../middlewares/authentication');
const Post = require('../models/post');
const { createMessages } = require('./utils');

module.exports = {
  create: {
    get: [
      isLoggedIn,
      param('boardname').escape(),
      (req, res) => {
        res.render('pages/board/create_post_form', {
          boardname: req.params.boardname,
        });
      },
    ],
    post: [
      isLoggedIn,
      body('title')
        .trim()
        .escape()
        .isLength({ min: 1, max: 150 })
        .withMessage(
          'Must be at least 1 character and no more than 150 characters'
        ),
      body('body').trim().customSanitizer(escapeHtml),
      param('boardname').escape(),
      (req, res) => {
        const errors = validationResult(req);

        if (errors.isEmpty()) {
          new Post({
            author: req.user.username,
            board: req.params.boardname,
            title: req.body.title,
            body: req.body.body,
          })
            .save()
            .then((post) => {
              res.redirect(post.url);
            });
        } else {
          res.render('pages/board/create_post_form', {
            boardname: req.params.boardname,
            messages: createMessages('danger', errors.array()),
          });
        }
      },
    ],
  },
  page: {
    get: [
      (req, res, next) => {
        Post.findById(req.params.postid)
          .populate('board')
          .orFail(new Error('Post not found'))
          .then((post) => {
            res.render('pages/post/index', {
              post: post.toObject({ virtuals: true }),
            });
          })
          .catch(next);
      },
      (err, req, res, next) => {
        if (err.message === 'Post not found') {
          return res.render('pages/post/not_found', {
            boardname: req.params.boardname,
          });
        }

        next(err);
      },
    ],
  },
};
