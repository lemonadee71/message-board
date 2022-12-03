const express = require('express');
const controller = require('../controllers/comment');
const router = express.Router();

router.post('/:commentid/edit', controller.edit);
router.delete('/:commentid', controller.delete);

module.exports = router;
