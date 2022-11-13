const express = require('express');
const controller = require('../controllers/post');
const router = express.Router();

router.get('/:postid', controller.page.get);

module.exports = router;
