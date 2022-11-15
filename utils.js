exports.NotFoundError = class extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFound';
  }
};
