// worker/index.js
// Cloudflare Worker with Durable Object 'Room' to handle WebSocket chat rooms.
export class Room {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.clients = new Map(); // id -> WebSocket
    this.history = [];
    // load persisted history
    state.blockConcurrencyWhile(async () => {
      const stored = await state.storage.get('history');
      if (stored) this.history = stored;
    });
  }

  async fetch(request) {
    // Accept only websocket upgrades
    if (request.headers.get('upgrade') !== 'websocket') {
      return new Response('expected websocket', { status: 400 });
    }

    // Create a WebSocket pair and pass the server end to handler
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    await this.handleSession(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  async handleSession(webSocket) {
    webSocket.accept();
    const clientId = crypto.randomUUID();
    this.clients.set(clientId, webSocket);

    // Send recent history to the new client
    if (this.history && this.history.length) {
      try {
        webSocket.send(JSON.stringify({ type: 'history', items: this.history }));
      } catch (e) {}
    }

    webSocket.addEventListener('message', async (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (!data || !data.type) return;

        if (data.type === 'message') {
          const msg = {
            id: data.id || crypto.randomUUID(),
            userId: data.userId,
            userNick: data.userNick,
            text: data.text,
            ts: Date.now()
          };
          this.history.push(msg);
          if (this.history.length > 200) this.history.shift();
          // persist history asynchronously
          this.state.storage.put('history', this.history).catch(() => {});
          // broadcast message payload
          this.broadcast(JSON.stringify({ type: 'message', payload: msg }));
        } else if (data.type === 'typing') {
          this.broadcast(JSON.stringify({ type: 'typing', payload: { userId: data.userId, userNick: data.userNick } }));
        } else if (data.type === 'join') {
          this.broadcast(JSON.stringify({ type: 'presence', payload: { userId: data.userId, userNick: data.userNick, action: 'join' } }));
        }
      } catch (err) {
        // ignore malformed
      }
    });

    webSocket.addEventListener('close', () => {
      this.clients.delete(clientId);
      // Optionally broadcast leave; omitted for brevity
    });

    webSocket.addEventListener('error', () => {
      this.clients.delete(clientId);
    });
  }

  broadcast(msg) {
    for (const [id, ws] of this.clients.entries()) {
      try {
        ws.send(msg);
      } catch (e) {
        this.clients.delete(id);
      }
    }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/ws') {
      // Route to durable object named by room
      const room = url.searchParams.get('room') || 'general';
      const id = env.ROOMS.idFromName(room);
      const obj = env.ROOMS.get(id);
      // Forward the websocket request to the durable object (it will upgrade)
      return obj.fetch(request);
    }

    return new Response('OK', { status: 200 });
  }
};
