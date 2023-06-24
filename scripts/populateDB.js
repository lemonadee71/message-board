/* eslint-disable import/no-extraneous-dependencies */
const { faker } = require('@faker-js/faker');
const User = require('../models/user');
const Board = require('../models/board');
const Post = require('../models/post');
const Comment = require('../models/comment');

const createFakePosts = (n, author, board, isprivate = false) =>
  new Array(n).fill().map(() => ({
    author,
    board,
    private: isprivate,
    title: faker.random.words(),
    body: faker.hacker.phrase(),
  }));

const createFakeComments = (n, author, post, board) =>
  new Array(n).fill().map(() => ({
    author,
    post,
    board,
    body: faker.hacker.phrase(),
  }));

const rand = (n = 1) => Math.floor(Math.random() * n);

module.exports = async () => {
  await User.create([
    {
      username: 'admin',
      password: 'admin',
      boards: ['playground', 'top', 'private'],
    },
    { username: 'lemon', password: '1234', boards: ['top'] },
    {
      username: 'user',
      password: '1234',
      boards: ['playground', 'top', 'private'],
    },
  ]);

  await Board.create([
    {
      boardname: 'playground',
      description: 'A place to test this website. Passcode is `dev`.',
      passcode: 'dev',
      private: false,
      creator: 'admin',
    },
    {
      boardname: 'top',
      display_name: 'The Odin Project',
      description:
        'Anything related to The Odin Project can be posted here. Use passcode `top` to join.',
      passcode: 'top',
      private: false,
      creator: 'admin',
    },
    {
      boardname: 'private',
      passcode: '1234',
      private: true,
      creator: 'admin',
    },
  ]);

  const posts = await Post.create([
    ...createFakePosts(4, 'user', 'playground'),
    ...createFakePosts(2, 'admin', 'top'),
    ...createFakePosts(2, 'lemon', 'top'),
    ...createFakePosts(2, 'admin', 'private', true),
  ]);

  for (const post of posts) {
    // eslint-disable-next-line no-await-in-loop
    await Comment.create(
      createFakeComments(rand(4), post.author, post.id, post.board)
    );
  }
};
