# Anonymous Chat — Realtime backend

This branch adds a lightweight Node/Express + Socket.io backend with SQLite persistence and simple auth.

Run locally (development):

- Install dependencies
  cd server && npm install
- Start server
  npm start

Environment variables
- JWT_SECRET (optional) — default used for development
- PORT (optional)
- DB_PATH (optional) — defaults to server/data.sqlite

Docker
- docker-compose.yml included. Build and run with docker-compose up --build

What was added
- server/: Express app, Socket.io, SQLite (better-sqlite3)
- client/socket-client.js: small socket wrapper (front-end must include this script)
- uploads/ folder will be created when server starts; uploads are ignored by git

Notes
- Auth uses email/password with bcrypt and JWT returned in an HTTP-only cookie
- Friends, uploads and marketplace endpoints included
- Messages are persisted (last 200 per room returned by history endpoint)

Next steps (follow-ups)
- Wire the frontend UI to use ANON.joinRoom / ANON.sendMessage and remove BroadcastChannel leftovers in index.html
- Add server-side validation and rate limiting

