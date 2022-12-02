const express = require('express');
const postController = require('../controllers/post');
const commentController = require('../controllers/comment');
const router = express.Router();

router.get('/:postid', postController.page.get);
router.get('/:postid/edit', postController.edit.get);
router.get('/:postid/comment/:commentid', commentController.index);
router.get('/:postid/:slug', postController.page.get);
router.post('/:postid/edit', postController.edit.post);
router.post('/:postid/delete', postController.delete);
router.post('/:postid/comment', commentController.create);

module.exports = router;
