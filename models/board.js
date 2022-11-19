const escapeHtml = require('escape-html');
const mongoose = require('mongoose');
const { NotFoundError } = require('../utils');
const Post = require('./post');
const { Timestamp } = require('./utils');

const Schema = mongoose.Schema;

const BoardSchema = new Schema({
  _id: {
    type: String,
    maxLength: 30,
    alias: 'boardname',
  },
  display_name: {
    type: String,
    maxLength: 50,
    default: function () {
      return this.boardname;
    },
  },
  description: { type: String, get: escapeHtml },
  passcode: {
    type: String,
    default: () => Math.random().toString(36).slice(2, 8),
  },
  // if set to true, all posts will be hidden for non-members
  private: { type: Boolean, default: true },
  creator: { type: String, ref: 'User', required: true },
  date_created: Timestamp,
});

BoardSchema.pre('save', async function () {
  // I'd like this to be after save but can't find a reliable way to do so atm
  // so let's assume that there will be no errors after saving so it can proceed
  if (this.isModified('private')) {
    if (this.private) {
      await Post.updateMany(
        { board: this.boardname },
        { $set: { private: true } }
      );
    }
  }
});

BoardSchema.virtual('url').get(function () {
  return `/b/${this.boardname}`;
});

BoardSchema.methods.toSafeObject = function () {
  return this.toObject({ getters: true, virtuals: true });
};

BoardSchema.methods.join = function (user, passcode) {
  if (passcode === this.passcode) {
    user.boards.push(this.boardname);
    return user.save();
  }

  throw new Error('Wrong passcode');
};

BoardSchema.statics.findByName = function (boardname) {
  return this.findById(boardname).orFail(new NotFoundError('Board not found'));
};

module.exports = mongoose.model('Board', BoardSchema);
