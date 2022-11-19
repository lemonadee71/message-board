const express = require('express');
const controller = require('../controllers');
const boardController = require('../controllers/board');
const router = express.Router();

router.get('/', controller.home);
router.get('/signup', controller.signup.get);
router.post('/signup', controller.signup.post);
router.get('/login', controller.login.get);
router.post('/login', controller.login.post);
router.post('/logout', controller.logout);
router.get('/create/board', boardController.create.get);
router.post('/create/board', boardController.create.post);

module.exports = router;
