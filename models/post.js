const mongoose = require('mongoose');
const { Timestamp } = require('./utils');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  author: { type: String, ref: 'User', required: true },
  board: { type: String, ref: 'Board', required: true },
  subject: { type: String, required: true, maxLength: 150 },
  body: { type: String, required: true, trim: true },
  // the board needs private set to false to toggle this
  // only creator and moderators can toggle it freely
  private: { type: Boolean, default: true },
  date_created: Timestamp,
});

PostSchema.virtual('url').get(function () {
  return `/p/${this._id}`;
});

module.exports = mongoose.model('Post', PostSchema);
