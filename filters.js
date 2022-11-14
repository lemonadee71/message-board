const format = require('date-fns/format');
const formatDistanceStrict = require('date-fns/formatDistanceStrict');
const showdown = require('showdown');
showdown.setFlavor('github');

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

exports.formatDistance = (date) => formatDistanceStrict(new Date(), date);

exports.mdToHTML = (str) =>
  new showdown.Converter({
    omitExtraWLInCodeBlocks: true,
    noHeaderId: true,
    ghCompatibleHeaderId: true,
    headerLevelStart: 2,
    parseImgDimensions: true,
    strikethrough: true,
    tables: true,
    ghCodeBlocks: true,
    ghMentions: true,
    tasklists: true,
    smartIndentationFix: true,
    simpleLineBreaks: true,
    openLinksInNewWindow: true,
    backslashEscapesHTMLTags: true,
    emoji: true,
  }).makeHtml(str);
