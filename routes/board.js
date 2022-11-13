const express = require('express');
const boardController = require('../controllers/board');
const postController = require('../controllers/post');
const router = express.Router();

router.get('/_/create', boardController.create.get);
router.post('/_/create', boardController.create.post);
router.get('/:boardname', boardController.page.get);
router.get('/:boardname/join', boardController.join.get);
router.post('/:boardname/join', boardController.join.post);
router.post('/:boardname/leave', boardController.leave.post);
router.get('/:boardname/post', postController.create.get);
router.post('/:boardname/post', postController.create.post);

module.exports = router;
