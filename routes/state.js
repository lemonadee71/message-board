const messages = [
  {
    text: 'Hi there!',
    user: 'Amando',
    added: new Date(),
  },
  {
    text: 'Hello World!',
    user: 'Charles',
    added: new Date(),
  },
];

exports.getMessages = () => [...messages];
exports.addMessage = (message) =>
  messages.push({ ...message, added: new Date() });
