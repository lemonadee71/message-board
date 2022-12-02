const { body } = require('express-validator');
const { isLoggedIn } = require('../middlewares/authentication');
const Comment = require('../models/comment');
const { NotFoundError } = require('../utils');
const { finishValidation, populate, ifNotFound } = require('./utils');

module.exports = {
  index: [
    populate('postid commentid', {
      commentid: (query) => query.orFail(new NotFoundError()),
    }),
    (req, res) => {
      res.render('pages/post/comment', {
        post: req.data.post.toSafeObject(),
        comment: req.data.comment.toSafeObject(),
        is_current_user_member: req.user?.isMember(req.data.post.board),
      });
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
  // edit: {
  //   get: [
  //     isLoggedIn,
  //     populate('commentid'),
  //     (req, res) =>
  //   ],
  // }
  // ,
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
