const escapeHtml = require('escape-html');
const mongoose = require('mongoose');
const slugify = require('slugify');
const { NotFoundError } = require('../utils');
const { Timestamp } = require('./utils');

const createSlug = function (value) {
  const slug = slugify(value, {
    lower: true,
    trim: true,
    remove: /[*+~.()'"!:@]/g,
  });
  // limit to 10 words
  return slug.split('-').slice(0, 10).join('-');
};

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  shortid: {
    type: String,
    default: () => Math.random().toString(36).slice(2, 8),
  },
  slug: {
    type: String,
    default: function () {
      return createSlug(this.title);
    },
    set: createSlug,
  },
  author: { type: String, ref: 'User', required: true },
  board: { type: String, ref: 'Board', required: true },
  title: {
    type: String,
    required: true,
    maxLength: 150,
    set: function (str) {
      this.slug = str;
      return str;
    },
  },
  body: { type: String, trim: true, get: escapeHtml },
  // the board needs private set to false to toggle this
  // only creator and moderators can toggle it freely
  private: { type: Boolean, default: true },
  date_created: Timestamp,
});

PostSchema.virtual('shorturl').get(function () {
  return `/p/${this.shortid}`;
});

PostSchema.virtual('url').get(function () {
  return `/p/${this.shortid}/${this.slug}`;
});

PostSchema.methods.toSafeObject = function () {
  return this.toObject({ getters: true, virtuals: true });
};

PostSchema.statics.findByShortId = function (shortid) {
  return this.findOne({ shortid }).orFail(new NotFoundError('Post not found'));
};

PostSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug }).orFail(new NotFoundError('Post not found'));
};

PostSchema.statics.findByAuthor = function (username) {
  return this.find({ author: username });
};

PostSchema.statics.findByBoard = function (boardname) {
  return this.find({ board: boardname });
};

module.exports = mongoose.model('Post', PostSchema);
