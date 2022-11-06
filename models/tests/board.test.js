const { connectDB } = require('../../db');
const Board = require('../board');
const User = require('../user');

// eslint-disable-next-line
let db, user;
beforeAll(async () => {
  db = await connectDB();
  user = new User({ username: 'Lemon', password: '123' });
  await user.save();
});

afterAll((done) => {
  db.close();
  done();
});

it("Updates user's boards when it joins a board", async () => {
  const board = new Board({ boardname: 'test', creator: 'shin' });
  await board.save();

  await board.join(user, board.passcode);

  expect(user.boards).toStrictEqual([board.boardname]);
});
