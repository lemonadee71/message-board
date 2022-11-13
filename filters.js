const format = require('date-fns/format');

exports.stringify = (o, delimiter = ' ') =>
  Object.entries(o)
    .map(([key, value]) => {
      if (value === '' || (typeof value === 'boolean' && value)) return key;
      if (!value) return '';
      // not having quotes will break for space separated values
      // but having them results in a duplicate
      return `${key}=${value}`;
    })
    .join(delimiter);

exports.createAvatar = (name) =>
  `https://ui-avatars.com/api/?background=0D8ABC&color=fff&size=100&name=${encodeURI(
    name
  )}`;

exports.formatDate = (date) => format(date, 'MMM d, y');
