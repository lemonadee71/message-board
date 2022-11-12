exports.stringify = (o, delimiter = ' ') =>
  Object.entries(o)
    .map(([key, value]) => {
      if (value === '' || (typeof value === 'boolean' && value)) return key;
      if (!value) return '';
      return `${key}=${value}`;
    })
    .join(delimiter);
