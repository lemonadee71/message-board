const express = require('express');
const controller = require('../controllers/post');
const router = express.Router();

router.get('/:postid', controller.page.get);
router.get('/:postid/edit', controller.edit.get);
router.get('/:postid/:slug', controller.page.get);
router.post('/:postid/edit', controller.edit.post);
router.post('/:postid/delete', controller.delete);

module.exports = router;
