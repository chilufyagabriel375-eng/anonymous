# Anonymous Chat — Node.js backend + Socket.IO

This branch adds a minimal Node.js backend (Express + Socket.IO) to enable real-time messaging.

Quick start

1. Install dependencies

   npm install

2. Run the server

   npm start

3. Visit http://localhost:3000 in your browser. The frontend will connect to the server via Socket.IO.

Notes

- Messages and marketplace items are stored in-memory (temporary). On restart data will be lost. Implement file or DB persistence if desired.
- Marketplace uploads are stored in /uploads and served at /uploads/<filename>.
- Change the port via the PORT environment variable.
