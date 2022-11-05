const url = require('url');

const ALERT_COLORS = {
  primary: {
    background: '#cfe2ff',
    text: '#084298',
    border: '#b6d4fe',
  },
  secondary: {
    background: '#353535',
    text: 'white',
    border: 'gray',
  },
  success: {
    background: '#d1e7dd',
    text: '#0f5132',
    border: '#badbcc',
  },
  danger: {
    background: '#f8d7da',
    text: '#842029',
    border: '#f5c2c7',
  },
  warning: {
    background: '#fff3cd',
    text: '#664d03',
    border: '#ffecb5',
  },
  info: {
    background: '#cff4fc',
    text: '#055160',
    border: '#b6effb',
  },
};

const createMessages = (type, items, header) => ({
  header,
  items:
    items &&
    [items].flat().map((e) => {
      let copy;
      if (e instanceof Error) {
        copy = { message: e.message };
      } else if (typeof e === 'string') {
        copy = { message: e };
      } else {
        copy = { ...e };
        delete copy.msg;
        copy.message = e.msg;
      }
      return copy;
    }),
  colors: ALERT_COLORS[type],
});

const hasNoSpace = (value) => !/\s/.test(value);

const isAlreadyLoggedIn = (req, res, next) => {
  if (req.user && req.isAuthenticated()) {
    res.redirect('/');
  } else {
    next();
  }
};

const isLoggedIn = (req, res, next) => {
  if (req.user && req.isAuthenticated()) {
    next();
  } else {
    res.redirect(
      url.format({
        pathname: '/login',
        query: { restricted: true },
      })
    );
  }
};

module.exports = { createMessages, hasNoSpace, isAlreadyLoggedIn, isLoggedIn };
