const { connectDB } = require('../../db');
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

it('It hashes the password on creation', async () => {
  expect(user.password).not.toBe('123');
  expect(await user.comparePassword('123')).toBe(true);
});

it('It hashes the password on update', async () => {
  const oldPassword = user.password;
  user.password = '321';
  await user.save();

  expect(user.password).not.toBe('321');
  expect(user.password).not.toBe(oldPassword);
  expect(await user.comparePassword('123')).toBe(false);
  expect(await user.comparePassword('321')).toBe(true);
});

it('Password is not rehashed if other fields changed', async () => {
  user.bio = 'This is a paragraph';
  await user.save();

  expect(await user.comparePassword('321')).toBe(true);
});

it('Username is lowercased', async () => {
  const newUser = new User({ username: 'Foo', password: '1234' });
  await newUser.save();

  expect(newUser.username).toBe('foo');
  expect(async () => User.findById('foo').orFail(new Error())).not.toThrow();
});

// Reliant on populateDB.js so not stable
it('isMember works', async () => {
  const lemon = await User.findById('lemon');

  expect(lemon.isMember('top')).toBe(true);
});
