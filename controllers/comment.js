const { body } = require('express-validator');
const { isLoggedIn } = require('../middlewares/authentication');
const Comment = require('../models/comment');
const { finishValidation, populate } = require('./utils');

module.exports = {
  create: [
    isLoggedIn,
    body('comment').trim(),
    populate('postid'),
    finishValidation().ifSuccess(async (req, res) => {
      const comment = new Comment({
        author: req.user,
        board: req.data.post.board,
        post: req.data.post.id,
        body: req.body.comment,
      });
      await comment.save();

      const comments = await Comment.findByPost(req.data.post.id);

      res.render('pages/post/index', {
        post: req.data.post.toSafeObject(),
        comments: comments.map((o) => o.toSafeObject()),
        is_current_user_member: req.user?.isMember(req.data.post.board),
      });
    }),
  ],
};
