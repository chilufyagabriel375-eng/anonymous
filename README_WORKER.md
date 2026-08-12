Cloudflare Workers + Durable Objects deployment notes

This folder adds a serverless realtime backend using Cloudflare Durable Objects.

Files:
- worker/index.js  -> Worker entrypoint and durable object class 'Room'
- wrangler.toml    -> Wrangler configuration (fill account_id before deploy)

How it works:
- Clients open a WebSocket to: wss://<your-worker-host>/ws?room=<roomname>
- The Worker proxies the request to a Durable Object instance named for the room
- The Room durable object manages connected WebSocket clients, broadcasts messages, and persists a small message history

Deploy steps (summary):
1. Install Wrangler: npm install -g wrangler
2. Configure wrangler.toml: replace <YOUR_ACCOUNT_ID> with your Cloudflare account id
3. Authenticate: wrangler login
4. Publish: wrangler publish

After publishing, update client app.js to use the worker host (e.g., https://anonymous-chat-worker.YOUR_DOMAIN.workers.dev)

Security & notes:
- This implementation keeps a small recent history (200 messages) in durable object storage.
- Consider adding authentication tokens for private rooms or moderation.
- Durable Objects have quotas. Validate message size and rate-limit clients as needed.
