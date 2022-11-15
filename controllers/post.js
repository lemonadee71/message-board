const { body, param, validationResult } = require('express-validator');
const { isLoggedIn } = require('../middlewares/authentication');
const Post = require('../models/post');
const { createMessages, extractFlashMessages, ifNotFound } = require('./utils');

module.exports = {
  create: {
    get: [
      isLoggedIn,
      param('boardname').escape(),
      (req, res) => {
        res.render('pages/board/create_post_form', {
          title: 'Create post',
          action: `/b/${req.params.boardname}/post`,
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
      body('body').trim(),
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
            title: 'Create post',
            action: `/b/${req.params.boardname}/post`,
            messages: createMessages('danger', errors.array()),
          });
        }
      },
    ],
  },
  edit: {
    get: [
      isLoggedIn,
      (req, res, next) => {
        Post.findByObjId(req.params.postid)
          .then((post) => {
            if (req.user.id === post.author) {
              res.render('pages/board/create_post_form', {
                title: 'Update post',
                action: `${post.url}/edit`,
                // do not escape to show original input
                post: post.toObject({ virtuals: true }),
              });
            } else {
              req.flash('error', 'Invalid action');
              res.redirect(post.url);
            }
          })
          .catch(next);
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
      body('body').trim(),
      async (req, res, next) => {
        const errors = validationResult(req);

        if (errors.isEmpty()) {
          try {
            const post = await Post.findByObjId(req.params.postid);
            post.title = req.body.title;
            post.body = req.body.body;
            await post.save();

            req.flash('success', 'Post updated');
            res.redirect(post.url);
          } catch (err) {
            next(err);
          }
        } else {
          res.render('pages/board/create_post_form', {
            title: 'Update post',
            action: `/p/${req.params.postid}/edit`,
            post: { ...req.body, url: `/p/${req.params.postid}` },
            messages: createMessages('danger', errors.array()),
          });
        }
      },
      ifNotFound('pages/post/not_found'),
    ],
  },
  delete: [
    isLoggedIn,
    (req, res) => {
      Post.findByIdAndDelete(req.params.postid).then((post) => {
        res.redirect(`/b/${post.board}`);
      });
    },
  ],
  page: {
    get: [
      extractFlashMessages('success'),
      extractFlashMessages('error', 'danger'),
      (req, res, next) => {
        Post.findByObjId(req.params.postid)
          .populate('board')
          .then((post) => {
            res.render('pages/post/index', {
              post: post.toSafeObject(),
            });
          })
          .catch(next);
      },
      ifNotFound('pages/post/not_found'),
    ],
  },
};
