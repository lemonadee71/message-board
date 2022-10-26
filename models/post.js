const mongoose = require('mongoose');
const { Timestamp, ObjectId } = require('./utils');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  author: { type: ObjectId, ref: 'User', required: true },
  board: { type: ObjectId, ref: 'Board', required: true },
  body: { type: String, required: true, trim: true },
  // the board needs private set to false to toggle this
  // only creator and moderators can toggle it freely
  private: { type: Boolean, default: true },
  // tags: [{ type: ObjectId, ref: 'Tag' }],
  date_created: Timestamp,
});

PostSchema.virtual('url').get(function () {
  return `/p/${this._id}`;
});

module.exports = mongoose.model('Post', PostSchema);
