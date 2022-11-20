const { connectDB } = require('../../db');
const Board = require('../board');
const User = require('../user');

// eslint-disable-next-line
let db, user;
beforeAll(async () => {
  db = await connectDB();
  user = new User({ username: 'testuser', password: '123' });
  await user.save();
});

afterAll((done) => {
  db.close();
  done();
});

it('Boardname is lowercased', async () => {
  const board = new Board({ boardname: 'Foo', creator: user.username });
  await board.save();

  expect(board.boardname).toBe('foo');
  expect(async () => Board.findByName('foo')).not.toThrow();
});

it("Updates user's boards when it joins a board", async () => {
  const board = new Board({ boardname: 'testboard', creator: user.username });
  await board.save();

  await board.join(user, board.passcode);

  expect(user.boards).toStrictEqual([board.boardname]);
});
