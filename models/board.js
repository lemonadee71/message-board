const mongoose = require('mongoose');
const { Timestamp, ObjectId } = require('./utils');

const Schema = mongoose.Schema;

const BoardSchema = new Schema({
  name: { type: String, lowercase: true, required: true, unique: true },
  display_name: {
    type: String,
    maxLength: 50,
    trim: true,
    default: function () {
      return this.name;
    },
  },
  description: String,
  // TODO: allow custom passcodes
  code: {
    type: String,
    required: true,
    default: () => Math.random().toString(36).slice(2, 8),
  },
  // if set to true, all posts will be hidden for non-members
  private: { type: Boolean, default: true },
  // moderators: [{ type: ObjectId, ref: 'User', required: true }],
  creator: { type: ObjectId, ref: 'User', required: true },
  date_created: Timestamp,
});

BoardSchema.virtual('url').get(function () {
  return `/b/${this.name}`;
});

module.exports = mongoose.model('Board', BoardSchema);
