const escapeHtml = require('escape-html');
const mongoose = require('mongoose');
const { Timestamp, ObjectId } = require('./utils');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  author: { type: String, ref: 'User', required: true },
  board: { type: String, ref: 'Board', required: true },
  post: { type: ObjectId, ref: 'Post', required: true },
  body: { type: String, trim: true, get: escapeHtml },
  date_created: Timestamp,
});

CommentSchema.methods.toSafeObject = function () {
  return this.toObject({ getters: true, virtuals: true });
};

CommentSchema.statics.findByAuthor = function (username) {
  return this.find({ author: username });
};

CommentSchema.statics.findByPost = function (postid) {
  return this.find({ post: postid }).sort({ date_created: 'asc' });
};

module.exports = mongoose.model('Comment', CommentSchema);
