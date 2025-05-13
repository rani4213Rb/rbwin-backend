let io = null;

function initSocket(server) {
  const socketIo = require('socket.io')(server, {
    cors: {
      origin: "*",
    },
  });
  io = socketIo;
}

function getIo() {
  return io;
}

module.exports = { initSocket, getIo };
