const express = require('express');
const controller = require('../controllers/board');
const router = express.Router();

router.get('/_/create', controller.create.get);
router.post('/_/create', controller.create.post);
router.get('/:boardname', controller.page.get);
router.get('/:boardname/join', controller.join.get);
router.post('/:boardname/join', controller.join.post);

module.exports = router;
