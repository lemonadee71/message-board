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
