const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { Timestamp } = require('./utils');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  _id: {
    type: String,
    maxLength: 30,
    alias: 'username',
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
  boards: [{ type: String, ref: 'Board' }],
  date_created: Timestamp,
});

UserSchema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.virtual('url').get(function () {
  return `/u/${this.username}`;
});

UserSchema.methods.comparePassword = function (input) {
  return bcrypt.compare(input, this.password);
};

UserSchema.methods.toSafeObject = function () {
  const o = this.toObject({ virtuals: true });
  delete o.password;
  return o;
};

module.exports = mongoose.model('User', UserSchema);
