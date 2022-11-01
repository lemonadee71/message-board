const { default: mongoose } = require('mongoose');
const { setupDatabase } = require('../../db');
const User = require('../user');

let db;
beforeAll(async () => {
  db = await setupDatabase();
});

afterAll((done) => {
  db.close();
  done();
});

it('It hashes the password', async () => {
  const user = new User({ username: 'Lemon', password: '123' });
  await user.save();

  expect(user.password).not.toBe('123');
  expect(await user.comparePassword('123')).toBe(true);
});
