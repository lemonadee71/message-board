const async = require('async');
const { body, param, validationResult } = require('express-validator');
const { isLoggedIn } = require('../middlewares/authentication');
const Board = require('../models/board');
const Post = require('../models/post');
const { hasNoSpace, createMessages, extractFlashMessages } = require('./utils');

const boardNotFound = (err, req, res, next) => {
  if (err.message === 'Board not found') {
    return res.render('pages/board/not_found');
  }

  next(err);
};

const isMember = (user, boardname) => user?.boards.includes(boardname);

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
              req.user.boards = [...req.user.boards, board.boardname];
              req.user.save().then(() => res.redirect(board.url));
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
      extractFlashMessages('info'),
      extractFlashMessages('success'),
      (req, res, next) => {
        async.parallel(
          {
            board: (callback) =>
              Board.findById(req.params.boardname)
                .orFail(new Error('Board not found'))
                .exec(callback),
            posts: (callback) =>
              Post.find({ board: req.params.boardname }).exec(callback),
          },
          (err, results) => {
            if (err) return next(err);

            res.render('pages/board/index', {
              board: results.board.toObject({ virtuals: true }),
              posts: results.posts.map((post) =>
                post.toObject({ virtuals: true })
              ),
              is_current_user_member: isMember(
                req.user,
                results.board.boardname
              ),
            });
          }
        );
      },
      boardNotFound,
    ],
  },
  join: {
    get: [
      isLoggedIn,
      param('boardname').escape(),
      // Redirect if already a member
      (req, res, next) => {
        req.isMember = isMember(req.user, req.params.boardname);

        if (req.isMember) {
          req.flash('info', 'You are already a member of this board');
          return res.redirect(`/b/${req.params.boardname}`);
        }

        next();
      },
      (req, res) => {
        res.render('pages/board/join_form', {
          boardname: req.params.boardname,
          is_current_user_member: req.isMember,
        });
      },
    ],
    post: [
      isLoggedIn,
      param('boardname').escape(),
      body('passcode')
        .trim()
        .escape()
        .custom(hasNoSpace)
        .withMessage('No spaces are allowed')
        .isAlphanumeric()
        .withMessage('Input has non-alphanumeric characters'),
      (req, res, next) => {
        Board.findById(req.params.boardname)
          .orFail(new Error('Board not found'))
          .then(async (board) => {
            const errors = validationResult(req);
            res.locals.boardname = req.params.boardname;

            if (errors.isEmpty()) {
              try {
                await board.join(req.user, req.body.passcode);
                req.flash('success', `You successfully joined ${board.url}`);
                return res.redirect(board.url);
              } catch (err) {
                res.locals.messages = createMessages('danger', {
                  msg: err.message,
                  param: 'passcode',
                });
              }
            } else {
              res.locals.messages = createMessages('danger', errors.array());
            }

            res.render('pages/board/join_form');
          })
          .catch(next);
      },
      boardNotFound,
    ],
  },
  leave: {
    post: [
      isLoggedIn,
      async (req, res) => {
        req.user.boards = req.user.boards.filter(
          (v) => v !== req.params.boardname
        );
        await req.user.save();

        req.flash(
          'success',
          `You successfully left /b/${req.params.boardname}`
        );
        res.redirect('/');
      },
    ],
  },
};
