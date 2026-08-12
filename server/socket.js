const socketio = require('socket.io');

module.exports = function (server, db) {
  const io = new socketio.Server(server, { cors: { origin: true, credentials: true } });

  io.on('connection', (socket) => {
    socket.on('join', ({ room, nickname }) => {
      room = room || 'general';
      socket.join(room);
      socket.room = room;
      socket.nickname = nickname || 'Anon';
      // send last messages
      const rows = db.prepare('SELECT * FROM messages WHERE room = ? ORDER BY created_at DESC LIMIT 200').all(room).reverse();
      socket.emit('history', rows);
      socket.to(room).emit('system', { text: `${socket.nickname} joined` });
    });

    socket.on('message', (data) => {
      const room = socket.room || data.room || 'general';
      const msg = {
        room,
        sender_name: socket.nickname || data.sender_name || 'Anon',
        content: data.content,
      };
      // persist
      const stmt = db.prepare('INSERT INTO messages (room, sender_name, content) VALUES (?,?,?)');
      stmt.run(msg.room, msg.sender_name, msg.content);
      io.to(room).emit('message', { ...msg, created_at: new Date().toISOString() });
    });

    socket.on('typing', (payload) => {
      const room = socket.room || payload.room || 'general';
      socket.to(room).emit('typing', { nickname: socket.nickname, typing: payload.typing });
    });

    socket.on('disconnect', () => {
      if (socket.room) socket.to(socket.room).emit('system', { text: `${socket.nickname || 'Someone'} left` });
    });
  });

  return io;
};
