const express = require('express');
const controller = require('../controllers/board');
const router = express.Router();

router.get('/_/create', controller.create.get);
router.post('/_/create', controller.create.post);

module.exports = router;
