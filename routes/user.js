const express = require('express');
const controller = require('../controllers/user');
const router = express.Router();

router.get('/:username', controller.profile);

module.exports = router;
