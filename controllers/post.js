const { body, param } = require('express-validator');
const { isLoggedIn } = require('../middlewares/authentication');
const Post = require('../models/post');
const Comment = require('../models/comment');
const {
  extractFlashMessages,
  ifNotFound,
  finishValidation,
  populate,
} = require('./utils');

module.exports = {
  create: {
    get: [
      isLoggedIn,
      param('boardname').escape(),
      populate('boardname'),
      (req, res) => {
        res.render('pages/board/create_post_form', {
          title: 'Create post',
          action: `${req.data.board.url}/post`,
          board: req.data.board,
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
      body('private').optional({ checkFalsy: true }).toBoolean(),
      param('boardname').escape(),
      populate('boardname'),
      finishValidation()
        .ifSuccess(async (req, res) => {
          const post = new Post({
            author: req.user.username,
            board: req.data.board.boardname,
            title: req.body.title,
            body: req.body.body,
            private: req.data.board.private ? true : !!req.body.private,
          });
          await post.save();

          res.redirect(post.url);
        })
        .ifHasError((errors, req, res) => {
          res.render('pages/board/create_post_form', {
            title: 'Create post',
            action: `${req.data.board.url}/post`,
            board: req.data.board,
            messages: errors,
          });
        }),
    ],
  },
  edit: {
    get: [
      isLoggedIn,
      populate('postid', (query) => query.populate('board')),
      (req, res) => {
        if (req.user.id === req.data.post.author) {
          res.render('pages/board/create_post_form', {
            title: 'Update post',
            action: `${req.data.post.shorturl}/edit`,
            // do not escape to show original input
            post: req.data.post.toObject({ virtuals: true }),
            board: req.data.post.board,
          });
        } else {
          req.flash('error', 'Invalid action');
          res.redirect(req.data.post.url);
        }
      },
      ifNotFound('pages/post/not_found'),
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
        .ifSuccess(populate('postid', (query) => query.populate('board')))
        .ifSuccess(async (req, res) => {
          Object.assign(req.data.post, {
            title: req.body.title,
            body: req.body.body,
            private: req.data.post.board.private ? true : !!req.body.private,
          });
          await req.data.post.save();

          req.flash('success', 'Post updated');
          res.redirect(req.data.post.url);
        })
        .ifHasError((errors, req, res) => {
          res.render('pages/board/create_post_form', {
            title: 'Update post',
            action: `/p/${req.params.postid}/edit`,
            post: req.body,
            messages: errors,
          });
        }),
      ifNotFound('pages/post/not_found'),
    ],
  },
  // Quick hack so this can be used by two different routes
  delete: (callback) => [
    isLoggedIn,
    (req, res) => {
      Post.findOneAndDelete({ shortid: req.params.postid }).then(
        callback(req, res)
      );
    },
  ],
  page: {
    get: [
      extractFlashMessages('success'),
      extractFlashMessages('error'),
      populate('postid'),
      async (req, res) => {
        const isMember = req.user?.isMember(req.data.post.board);

        if (!req.data.post.private || isMember) {
          const comments = await Comment.findByPost(req.data.post.id);
          res.locals.comments = comments.map((o) => o.toSafeObject());
        }

        res.render('pages/post/index', {
          post: req.data.post.toSafeObject(),
          is_current_user_member: isMember,
        });
      },
      ifNotFound('pages/post/not_found'),
    ],
  },
};
