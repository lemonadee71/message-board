/* eslint-disable import/no-extraneous-dependencies, no-console  */
const mongoose = require('mongoose');

exports.connectDB = async function () {
  mongoose.Promise = global.Promise;

  let uri;
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  if (process.env.NODE_ENV === 'production') {
    uri = process.env.MONGODB_URI;
  } else {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
  }

  // Set up mongoose connection
  mongoose.connect(uri, options);

  const db = mongoose.connection;

  db.on('error', (e) => {
    console.log(e);

    if (e.message.code === 'ETIMEDOUT') {
      mongoose.connect(uri, options);
    }
  });

  db.once('open', () => {
    console.log(`MongoDB successfully connected to ${uri}`);
  });

  return db;
};
