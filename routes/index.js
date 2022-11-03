const express = require('express');
const controller = require('../controllers');
const router = express.Router();

router.get('/', controller.home);
router.get('/signup', controller.signup.get);
router.post('/signup', controller.signup.post);
router.get('/login', controller.login.get);
router.post('/login', controller.login.post);
router.get('/logout', controller.logout);

module.exports = router;
