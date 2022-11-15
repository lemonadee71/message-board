const { validationResult } = require('express-validator');
const { NotFoundError } = require('../utils');

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

const extractFlashMessages = (key, type) => (req, res, next) => {
  const messages = req.flash(key);

  if (messages.length > 1) {
    res.locals.messages = createMessages(type || key, messages);
  } else if (messages.length === 1) {
    res.locals.messages = createMessages(type || key, null, messages[0]);
  }

  next();
};

const ifNotFound = (view) => (err, req, res, next) => {
  if (err instanceof NotFoundError) {
    return res.render(view);
  }

  next(err);
};

const hasNoSpace = (value) => !/\s/.test(value);

const finishValidation = (fn) => {
  let fnIfSuccess = (req, res, next) => next();
  if (fn) fnIfSuccess = fn;
  let fnIfHasError = (_, req, res, next) => next();

  async function cb(req, res, next) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      await fnIfSuccess?.(req, res, next);
    } else {
      await fnIfHasError?.(
        createMessages('danger', errors.array()),
        req,
        res,
        next
      );
    }
  }

  cb.ifSuccess = (f) => {
    fnIfSuccess = f;
    return cb;
  };
  cb.ifHasError = (f) => {
    fnIfHasError = f;
    return cb;
  };

  return cb;
};

module.exports = {
  createMessages,
  extractFlashMessages,
  hasNoSpace,
  ifNotFound,
  finishValidation,
};
