const async = require('async');
const { body, param } = require('express-validator');
const { isLoggedIn } = require('../middlewares/authentication');
const Board = require('../models/board');
const Post = require('../models/post');
const {
  hasNoSpace,
  createMessages,
  extractFlashMessages,
  ifNotFound,
  finishValidation,
} = require('./utils');

const validateAndSanitizeBoardData = [
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
  body('description').optional({ checkFalsy: true }).trim(),
  body('private').optional({ checkFalsy: true }).toBoolean(),
];

module.exports = {
  create: {
    get: [
      isLoggedIn,
      (req, res) => {
        res.render('pages/board/create_form', {
          title: 'Create New Board',
          action: `/create/board`,
        });
      },
    ],
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
          Board.findById(value.toLowerCase()).then(
            (res) =>
              res && Promise.reject(new Error(`Board name is already taken`))
          )
        )
        .custom((value) => {
          if (value.toLowerCase() === 'all') {
            throw new Error('`all` is a reserved word');
          }
          return true;
        }),
      ...validateAndSanitizeBoardData,
      finishValidation()
        .ifSuccess((req, res) => {
          // We didn't lowercase here so we can preserve original input as display_name
          new Board({
            boardname: req.body.boardname,
            display_name:
              req.body.display_name || req.body.boardname || undefined,
            passcode: req.body.passcode || undefined,
            description: req.body.description,
            private: !!req.body.private,
            creator: req.user.username,
          })
            .save()
            .then((board) => {
              req.user.boards.push(board.boardname);
              req.user.save().then(() => res.redirect(board.url));
            });
        })
        .ifHasError((errors, req, res) => {
          res.render('pages/board/create_form', {
            title: 'Create New Board',
            action: `/create/board`,
            messages: errors,
          });
        }),
    ],
  },
  page: {
    get: [
      param('boardname').toLowerCase().escape(),
      extractFlashMessages('info'),
      extractFlashMessages('success'),
      extractFlashMessages('error'),
      (req, res, next) => {
        async.parallel(
          {
            board: (callback) =>
              Board.findByName(req.params.boardname).exec(callback),
            posts: (callback) =>
              Post.find({ board: req.params.boardname }).exec(callback),
          },
          (err, results) => {
            if (err) return next(err);

            res.render('pages/board/index', {
              board: results.board.toSafeObject(),
              posts: results.posts.map((post) => post.toSafeObject()),
              is_current_user_member: req.user?.isMember(results.board.id),
            });
          }
        );
      },
      ifNotFound('pages/board/not_found'),
    ],
  },
  edit: {
    get: [
      isLoggedIn,
      param('boardname').toLowerCase().escape(),
      (req, res, next) => {
        Board.findByName(req.params.boardname)
          .then((board) => {
            if (req.user.id === board.creator) {
              res.render('pages/board/create_form', {
                title: 'Update board',
                mode: 'edit',
                action: `${board.url}/edit`,
                board: board.toObject({ virtuals: true }),
              });
            } else {
              req.flash(
                'error',
                'Invalid action. Only the creator of this board can edit it.'
              );
              res.redirect(board.url);
            }
          })
          .catch(next);
      },
      ifNotFound('pages/board/not_found'),
    ],
    post: [
      isLoggedIn,
      param('boardname').toLowerCase().escape(),
      ...validateAndSanitizeBoardData,
      finishValidation()
        .ifSuccess(async (req, res, next) => {
          try {
            const board = await Board.findById(req.params.boardname);
            Object.assign(board, {
              display_name: req.body.display_name || undefined,
              passcode: req.body.passcode || undefined,
              description: req.body.description,
              private: !!req.body.private,
            });
            await board.save();

            res.redirect(board.url);
          } catch (err) {
            next(err);
          }
        })
        .ifHasError((errors, req, res) => {
          res.render('pages/board/create_form', {
            title: 'Update board',
            mode: 'edit',
            action: `/b/${req.params.boardname}/edit`,
            board: req.body,
            messages: errors,
          });
        }),
    ],
  },
  join: {
    get: [
      isLoggedIn,
      param('boardname').toLowerCase().escape(),
      // Redirect if already a member
      (req, res, next) => {
        if (req.user?.isMember(req.params.boardname)) {
          req.flash('info', 'You are already a member of this board');
          return res.redirect(`/b/${req.params.boardname}`);
        }

        next();
      },
      (req, res) => {
        res.render('pages/board/join_form', {
          boardname: req.params.boardname,
          is_current_user_member: req.user?.isMember(req.params.boardname),
        });
      },
    ],
    post: [
      isLoggedIn,
      param('boardname').toLowerCase().escape(),
      body('passcode')
        .trim()
        .escape()
        .custom(hasNoSpace)
        .withMessage('No spaces are allowed')
        .isAlphanumeric()
        .withMessage('Input has non-alphanumeric characters'),
      finishValidation()
        .ifSuccess((req, res, next) => {
          Board.findByName(req.params.boardname)
            .then(async (board) => {
              try {
                await board.join(req.user, req.body.passcode);
                req.flash('success', `You successfully joined ${board.url}`);
                return res.redirect(board.url);
              } catch (err) {
                res.render('pages/board/join_form', {
                  messages: createMessages('error', {
                    msg: err.message,
                    param: 'passcode',
                  }),
                });
              }
            })
            .catch(next);
        })
        .ifHasError((errors, req, res) => {
          res.render('pages/board/join_form', { messages: errors });
        }),
      ifNotFound('pages/board/not_found'),
    ],
  },
  leave: {
    post: [
      isLoggedIn,
      param('boardname').toLowerCase().escape(),
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
