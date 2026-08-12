const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve repository root (index.html + assets)
app.use(express.static(path.join(__dirname)));

// Uploads folder
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + Math.random().toString(36).slice(2,8) + path.extname(file.originalname);
    cb(null, name);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// In-memory stores (simple, non-persistent)
const MAX_HISTORY = 200;
const rooms = {}; // { roomName: [messages...] }
const marketplace = []; // array of items

io.on('connection', (socket) => {
  console.log('socket connected:', socket.id);

  socket.on('join', ({ room, userId, nick }) => {
    if (!room) room = 'general';
    socket.join(room);
    socket.data.room = room;
    socket.data.userId = userId;
    socket.data.nick = nick;

    if (!rooms[room]) rooms[room] = [];

    // send recent history
    socket.emit('history', rooms[room]);

    // notify others
    socket.to(room).emit('user_joined', { userId, nick });
    console.log(`${nick || userId} joined ${room}`);
  });

  socket.on('message', (payload) => {
    const { room, userId, nick, text } = payload;
    if (!room) return;
    const msg = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2,6),
      userId,
      nick,
      text,
      time: Date.now()
    };
    rooms[room] = rooms[room] || [];
    rooms[room].push(msg);
    if (rooms[room].length > MAX_HISTORY) rooms[room].shift();

    io.to(room).emit('message', msg);
  });

  socket.on('typing', ({ room, userId, nick, typing }) => {
    if (!room) return;
    socket.to(room).emit('typing', { userId, nick, typing });
  });

  socket.on('disconnecting', () => {
    const room = socket.data.room;
    const nick = socket.data.nick;
    const userId = socket.data.userId;
    if (room) socket.to(room).emit('user_left', { userId, nick });
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected:', socket.id);
  });
});

// Marketplace endpoints
app.get('/api/marketplace', (req, res) => {
  res.json(marketplace);
});

app.post('/api/marketplace', upload.single('photo'), (req, res) => {
  const { title, price, description } = req.body;
  if (!req.file) return res.status(400).json({ error: 'Photo is required' });
  const item = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2,6),
    title: title || 'Untitled',
    price: Number(price) || 0,
    description: description || '',
    photoUrl: '/uploads/' + req.file.filename,
    createdAt: Date.now()
  };
  marketplace.unshift(item);
  res.json(item);
});

// Serve uploads statically
app.use('/uploads', express.static(UPLOAD_DIR));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
