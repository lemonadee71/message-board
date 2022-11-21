const escapeHtml = require('escape-html');
const mongoose = require('mongoose');
const { NotFoundError } = require('../utils');
const { Timestamp } = require('./utils');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  author: { type: String, ref: 'User', required: true },
  board: { type: String, ref: 'Board', required: true },
  title: { type: String, required: true, maxLength: 150 },
  body: { type: String, trim: true, get: escapeHtml },
  // the board needs private set to false to toggle this
  // only creator and moderators can toggle it freely
  private: { type: Boolean, default: true },
  date_created: Timestamp,
});

PostSchema.virtual('url').get(function () {
  return `/p/${this.id}`;
});

PostSchema.methods.toSafeObject = function () {
  return this.toObject({ getters: true, virtuals: true });
};

PostSchema.statics.findByObjId = function (id) {
  return this.findById(id).orFail(new NotFoundError('Post not found'));
};

PostSchema.statics.findByAuthor = function (username) {
  return this.find({ author: username });
};

module.exports = mongoose.model('Post', PostSchema);
