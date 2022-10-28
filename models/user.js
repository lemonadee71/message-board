const mongoose = require('mongoose');
const { Timestamp, ObjectId } = require('./utils');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  // email: { type: String, unique: true },
  username: {
    type: String,
    lowercase: true,
    maxLength: 30,
    required: true,
    unique: true,
  },
  password: { type: String, required: true },
  display_name: {
    type: String,
    maxLength: 30,
    default: function () {
      return this.username;
    },
  },
  bio: { type: String, maxLength: 200 },
  boards: [{ type: ObjectId, ref: 'Board' }],
  date_created: Timestamp,
});

UserSchema.virtual('url').get(function () {
  return `/u/${this.username}`;
});

module.exports = mongoose.model('User', UserSchema);
