const { connectDB } = require('../../db');
const Post = require('../post');

let db;
beforeAll(async () => {
  db = await connectDB();
});

afterAll((done) => {
  db.close();
  done();
});

it('A slug is automatically created', async () => {
  const post = new Post({ author: 'lemon', board: 'test', title: 'Test Post' });
  await post.save();

  expect(post.slug).toBe('test-post');
});

it('Slug generated is limited to 10 words', async () => {
  const post = new Post({
    author: 'lemon',
    board: 'test',
    title:
      'I am writing this long test title for testing purposes to see if this will be cut',
  });
  await post.save();

  expect(post.slug).toBe(
    'i-am-writing-this-long-test-title-for-testing-purposes'
  );
});

it('Slug generated is removes specific symbols', async () => {
  const post = new Post({
    author: 'lemon',
    board: 'test',
    title: 'This is a title!~ (yeah it is)',
  });
  await post.save();

  expect(post.slug).toBe('this-is-a-title-yeah-it-is');
});

it('Slug is auto generated if title is changed', async () => {
  const post = new Post({
    author: 'lemon',
    board: 'test',
    title: 'test post',
  });
  await post.save();

  post.title = 'new title';
  await post.save();

  expect(post.slug).toBe('new-title');
});
