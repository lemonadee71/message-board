const { body, param, validationResult } = require('express-validator');
const Board = require('../models/board');
const { hasNoSpace, createMessages, isLoggedIn } = require('./utils');

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
        .custom(hasNoSpace)
        .withMessage('No spaces are allowed')
        .isAlphanumeric()
        .withMessage('Input has non-alphanumeric characters'),
      body('description').optional({ checkFalsy: true }).trim().escape(),
      body('private').optional({ checkFalsy: true }),
      (req, res) => {
        const errors = validationResult(req);

        if (errors.isEmpty()) {
          new Board({
            boardname: req.body.boardname,
            display_name: req.body.display_name,
            passcode: req.body.passcode,
            description: req.body.description,
            private: req.body.private,
            creator: req.user.username,
          }).save((board) => res.redirect(board.url));
        } else {
          res.render('pages/board/create_form', {
            messages: createMessages('danger', errors.array()),
          });
        }
      },
    ],
  },
};
