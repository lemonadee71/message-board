const express = require('express');
const { getMessages } = require('./state');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: "Lemon's Message Board",
    messages: getMessages(),
  });
});

module.exports = router;
