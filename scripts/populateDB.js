/* eslint-disable import/no-extraneous-dependencies */
const { faker } = require('@faker-js/faker');
const User = require('../models/user');
const Board = require('../models/board');
const Post = require('../models/post');

const createFakePosts = (n, author, board, isprivate = false) =>
  new Array(n).fill().map(() => ({
    author,
    board,
    private: isprivate,
    title: faker.random.words(),
    body: faker.hacker.phrase(),
  }));

module.exports = async () => {
  await User.create([
    {
      username: 'admin',
      password: 'admin',
      boards: ['playground', 'top', 'private'],
    },
    { username: 'lemon', password: '1234', boards: ['top'] },
    { username: 'user', password: '1234', boards: ['playground'] },
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
        'Anything related to The Odin Project can be posted here. Use passcode `dev` to join.',
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

  await Post.create([
    ...createFakePosts(4, 'user', 'playground'),
    ...createFakePosts(2, 'admin', 'top'),
    ...createFakePosts(2, 'lemon', 'top'),
    ...createFakePosts(2, 'admin', 'private', true),
  ]);
};
