/* eslint-disable import/no-extraneous-dependencies */
const { faker } = require('@faker-js/faker');
const User = require('../models/user');
const Board = require('../models/board');
const Post = require('../models/post');

const createFakePosts = (n, author, board) =>
  new Array(n).fill().map(() => ({
    author,
    board,
    private: false,
    title: faker.random.words(),
    body: faker.hacker.phrase(),
  }));

module.exports = async () => {
  await User.create([
    { username: 'admin', password: 'admin' },
    { username: 'lemon', password: '1234', boards: ['top'] },
    { username: 'user', password: '1234', boards: ['test', 'top'] },
  ]);

  await Board.create([
    { boardname: 'test', creator: 'lemon', passcode: 'test', private: false },
    {
      boardname: 'top',
      display_name: 'The Odin Project',
      description: 'Anything related to The Odin Project can be posted here',
      passcode: 'top',
      private: false,
      creator: 'admin',
    },
  ]);

  await Post.create([
    ...createFakePosts(4, 'user', 'test'),
    ...createFakePosts(2, 'user', 'top'),
    ...createFakePosts(2, 'lemon', 'top'),
  ]);
};
