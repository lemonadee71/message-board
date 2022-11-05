const mongoose = require('mongoose');
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
  description: String,
  // TODO: allow custom passcodes
  passcode: {
    type: String,
    default: () => Math.random().toString(36).slice(2, 8),
  },
  // if set to true, all posts will be hidden for non-members
  private: { type: Boolean, default: true },
  creator: { type: String, ref: 'User', required: true },
  date_created: Timestamp,
});

BoardSchema.virtual('url').get(function () {
  return `/b/${this.boardname}`;
});

module.exports = mongoose.model('Board', BoardSchema);
