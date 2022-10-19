const express = require('express');
const { addMessage } = require('./state');
const router = express.Router();

router.get('/', function (req, res) {
  res.render('message');
});

router.post('/', function (req, res) {
  addMessage({
    text: req.body.message,
    user: req.body.username || 'Anonymous',
  });

  res.redirect('/');
});

module.exports = router;
