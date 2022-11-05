const { body, param, validationResult } = require('express-validator');
const Board = require('../models/board');
const User = require('../models/user');
const { hasNoSpace, createMessages, isLoggedIn } = require('./utils');

const boardNotFound = (err, req, res, next) => {
  if (err.message === 'Board not found') {
    return res.render('pages/board/not_found');
  }

  next(err);
};

module.exports = {
  create: {
    get: [isLoggedIn, (req, res) => res.render('pages/board/create_form')],
    post: [
      isLoggedIn,
      body('boardname')
        .trim()
        .escape()
        .custom(hasNoSpace)
        .withMessage('No spaces are allowed')
        .isAlphanumeric()
        .withMessage('Input has non-alphanumeric characters')
        .isLength({ min: 2, max: 30 })
        .withMessage(
          'Must be at least 2 characters and no more than 30 characters'
        )
        .custom((value) =>
          // Might throw an error unrelated to validation (fetching errors)
          Board.findById(value).then(
            (res) =>
              res && Promise.reject(new Error(`Board name is already taken`))
          )
        ),
      body('display_name')
        .optional({ checkFalsy: true })
        .trim()
        .escape()
        .isLength({ min: 2, max: 50 })
        .withMessage(
          'Must be at least 2 characters and no more than 50 characters'
        ),
      body('passcode')
        .optional({ checkFalsy: true })
        .trim()
        .escape()
        .isEmpty()
        .custom(hasNoSpace)
        .withMessage('No spaces are allowed')
        .isAlphanumeric()
        .withMessage('Input has non-alphanumeric characters'),
      body('description').optional({ checkFalsy: true }).trim().escape(),
      body('private').optional({ checkFalsy: true }).toBoolean(),
      (req, res) => {
        const errors = validationResult(req);

        if (errors.isEmpty()) {
          new Board({
            boardname: req.body.boardname,
            display_name: req.body.display_name || undefined,
            passcode: req.body.passcode || undefined,
            description: req.body.description,
            private: req.body.private,
            creator: req.user.username,
          })
            .save()
            .then((board) => {
              User.findById(req.user.username).then((user) => {
                user.boards.push(board.boardname);
                user.save().then(() => res.redirect(board.url));
              });
            });
        } else {
          res.render('pages/board/create_form', {
            messages: createMessages('danger', errors.array()),
          });
        }
      },
    ],
  },
  page: {
    get: [
      param('boardname').escape(),
      (req, res, next) => {
        Board.findById(req.params.boardname)
          .orFail(new Error('Board not found'))
          .then((board) => {
            const copy = board.toObject({ virtuals: true });
            delete copy.passcode;

            res.render('pages/board/index', {
              board: copy,
              is_current_user_member: req.user?.boards.includes(
                board.boardname
              ),
            });
          })
          .catch(next);
      },
      boardNotFound,
    ],
  },
};
