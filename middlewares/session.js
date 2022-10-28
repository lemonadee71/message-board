const session = require('express-session');

module.exports = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    // maxAge: 7 * 24 * 60 * 1000,
  },
});
