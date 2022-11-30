const User = require('../models/user');
const Post = require('../models/post');
const Board = require('../models/board');

exports.ALERT_COLORS = {
  primary: {
    background: '#cfe2ff',
    text: '#084298',
    border: '#b6d4fe',
  },
  secondary: {
    background: '#353535',
    text: 'white',
    border: 'gray',
  },
  success: {
    background: '#d1e7dd',
    text: '#0f5132',
    border: '#badbcc',
  },
  danger: {
    background: '#f8d7da',
    text: '#842029',
    border: '#f5c2c7',
  },
  warning: {
    background: '#fff3cd',
    text: '#664d03',
    border: '#ffecb5',
  },
  info: {
    background: '#cff4fc',
    text: '#055160',
    border: '#b6effb',
  },
};

exports.paramNameMap = {
  username: 'user',
  boardname: 'board',
  postid: 'post',
};

exports.queryMap = {
  username: (name) => User.findByName(name),
  boardname: (name) => Board.findByName(name),
  postid: (id) => Post.findByShortId(id),
};
