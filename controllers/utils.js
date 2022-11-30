const async = require('async');
const { validationResult } = require('express-validator');
const { NotFoundError } = require('../utils');
const { paramNameMap, queryMap, ALERT_COLORS } = require('./constants');

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
  colors: ALERT_COLORS[type === 'error' ? 'danger' : type],
});

const hasNoSpace = (value) => !/\s/.test(value);

const extractFlashMessages = (key, type) => (req, res, next) => {
  const messages = [req.flash(key)].flat();

  if (messages[0]?.items && messages[0]?.colors) {
    res.locals.messages = messages[0];
  } else if (messages.length > 1) {
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

const finishValidation = () => {
  const ifSuccess = [];
  const ifHasError = [];

  async function middleware(req, res, next) {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      async.series(
        ifSuccess.map((fn) => (callback) => fn(req, res, callback)),
        (err) => {
          if (err) return next(err);
          next();
        }
      );
    } else {
      const msgs = createMessages('error', errors.array());

      async.series(
        ifHasError.map((fn) => (callback) => fn(msgs, req, res, callback)),
        (err) => {
          if (err) return next(err);
          next();
        }
      );
    }
  }

  middleware.ifSuccess = (fn) => {
    ifSuccess.push(fn);
    return middleware;
  };
  middleware.ifHasError = (fn) => {
    ifHasError.push(fn);
    return middleware;
  };

  return middleware;
};

const populate = (field, ...options) => {
  const fields = field.split(' ');
  const o = {};

  const createTask = (req, param, opts) => {
    let key = paramNameMap[param];
    let query = queryMap[param](req.params[param]);

    if (opts.length) {
      if (typeof opts[0] === 'string') {
        key = opts[0];
      } else if (typeof opts[0] === 'function') {
        query = opts[0](query);
      } else if (opts.length === 2) {
        key = opts[0];
        query = opts[1](query);
      }
    }

    o[key] = (cb) => query.exec(cb);
  };

  return async function fn(req, res, next) {
    if (fields.length === 1) {
      createTask(req, fields[0], options);
    } else {
      for (const fieldname of fields) {
        createTask(req, fieldname, options[0]?.[fieldname] ?? []);
      }
    }

    async
      .parallel(o)
      .then((results) => {
        req.data = results;
        next();
      })
      .catch(next);
  };
};

module.exports = {
  createMessages,
  extractFlashMessages,
  hasNoSpace,
  ifNotFound,
  finishValidation,
  populate,
};
