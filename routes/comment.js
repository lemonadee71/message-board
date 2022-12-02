const express = require('express');
const controller = require('../controllers/comment');
const router = express.Router();

router.delete('/:commentid', controller.delete);

module.exports = router;
