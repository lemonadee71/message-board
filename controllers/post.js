const { body, param } = require('express-validator');
const { isLoggedIn } = require('../middlewares/authentication');
const Board = require('../models/board');
const Post = require('../models/post');
const {
  extractFlashMessages,
  ifNotFound,
  finishValidation,
} = require('./utils');

module.exports = {
  create: {
    get: [
      isLoggedIn,
      param('boardname').escape(),
      (req, res, next) => {
        Board.findByName(req.params.boardname)
          .then((board) => {
            res.render('pages/board/create_post_form', {
              title: 'Create post',
              action: `${board.url}/post`,
              board,
            });
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
      body('private').optional({ checkFalsy: true }).toBoolean(),
      param('boardname').escape(),
      finishValidation()
        .ifSuccess(async (req, res) => {
          const board = await Board.findByName(req.params.boardname);
          const post = new Post({
            author: req.user.username,
            board: board.boardname,
            title: req.body.title,
            body: req.body.body,
            private: board.private ? true : !!req.body.private,
          });
          await post.save();

          res.redirect(post.url);
        })
        .ifHasError((errors, req, res, next) => {
          Board.findByName(req.params.boardname)
            .then((board) => {
              res.render('pages/board/create_post_form', {
                title: 'Create post',
                action: `${board.url}/post`,
                board,
                messages: errors,
              });
            })
            .catch(next);
        }),
    ],
  },
  edit: {
    get: [
      isLoggedIn,
      (req, res, next) => {
        Post.findByObjId(req.params.postid)
          .populate('board')
          .then((post) => {
            if (req.user.id === post.author) {
              res.render('pages/board/create_post_form', {
                title: 'Update post',
                action: `${post.url}/edit`,
                // do not escape to show original input
                post: post.toObject({ virtuals: true }),
                board: post.board,
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
      body('private').optional({ checkFalsy: true }).toBoolean(),
      finishValidation()
        .ifSuccess(async (req, res, next) => {
          try {
            const post = await Post.findByObjId(req.params.postid).populate(
              'board'
            );
            Object.assign(post, {
              title: req.body.title,
              body: req.body.body,
              private: post.board.private ? true : !!req.body.private,
            });
            await post.save();

            req.flash('success', 'Post updated');
            res.redirect(post.url);
          } catch (err) {
            next(err);
          }
        })
        .ifHasError((errors, req, res) => {
          res.render('pages/board/create_post_form', {
            title: 'Update post',
            action: `/p/${req.params.postid}/edit`,
            post: { ...req.body, url: `/p/${req.params.postid}` },
            messages: errors,
          });
        }),
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
      extractFlashMessages('error'),
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
