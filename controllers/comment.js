const { body } = require('express-validator');
const { isLoggedIn } = require('../middlewares/authentication');
const Comment = require('../models/comment');
const { NotFoundError } = require('../utils');
const {
  finishValidation,
  populate,
  ifNotFound,
  createMessages,
  extractFlashMessages,
} = require('./utils');

module.exports = {
  // TODO: Do not proceed if post is private
  index: [
    extractFlashMessages('success'),
    extractFlashMessages('error'),
    populate('postid commentid', {
      commentid: (query) => query.orFail(new NotFoundError()),
    }),
    (req, res) => {
      const willEdit = 'edit' in req.query;

      res.locals.post = req.data.post.toSafeObject();
      res.locals.comment = req.data.comment.toObject({ virtuals: true });
      res.locals.is_current_user_member = req.user?.isMember(
        req.data.post.board
      );

      res.locals.is_editing = willEdit;

      if (willEdit && req.user.username !== req.data.comment.author) {
        res.locals.is_editing = false;
        res.locals.messages = createMessages('error', null, 'Invalid action');
      }

      res.render('pages/post/comment');
    },
    ifNotFound('pages/post/not_found'),
  ],
  create: [
    isLoggedIn,
    body('comment').trim(),
    populate('postid'),
    finishValidation().ifSuccess(async (req, res) => {
      await new Comment({
        author: req.user,
        board: req.data.post.board,
        post: req.data.post.id,
        body: req.body.comment,
      }).save();

      const comments = await Comment.findByPost(req.data.post.id);

      res.render('pages/post/index', {
        post: req.data.post.toSafeObject(),
        comments: comments.map((o) => o.toSafeObject()),
        is_current_user_member: req.user?.isMember(req.data.post.board),
      });
    }),
  ],
  edit: [
    isLoggedIn,
    body('comment').trim(),
    populate('commentid'),
    async (req, res) => {
      req.data.comment.body = req.body.comment;
      await req.data.comment.save();

      req.flash('success', 'Comment updated');
      res.redirect(new URL(req.get('referer')).pathname);
    },
  ],
  delete: [
    isLoggedIn,
    populate('commentid'),
    (req, res) => {
      if (req.user.username === req.data.comment.author) {
        Comment.findByIdAndDelete(req.data.comment.id).then(() => {
          // SEE: https://stackoverflow.com/questions/65444011/page-not-refreshing-after-res-redirect303-done-after-delete-request
          // Solution results in two get requests
          res.redirect(303, 'back');
        });
      }
    },
  ],
};
