// app.js (updated) - tries Cloudflare WebSocket durable object first, falls back to BroadcastChannel
(function(){
  // Configuration: set WORKER_ORIGIN to your deployed Cloudflare Worker (no trailing slash),
  // e.g. 'https://anonymous-chat-worker.username.workers.dev'
  const WORKER_ORIGIN = window.__WORKER_ORIGIN__ || ''; // set this from server or inject in build

  function $(id){return document.getElementById(id)}
  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

  const messagesArea = $('messagesArea');
  const msgInput = $('messageInput');
  const sendBtn = $('sendBtn');
  const typingIndicator = $('typingIndicator');
  const usernameDisplay = $('currentUsernameDisplay');
  const usernameInput = $('usernameInput');
  const saveNameBtn = $('saveNameBtn');
  const roomInput = $('roomInput');
  const joinRoomBtn = $('joinRoomBtn');
  const copyInviteBtn = $('copyInviteBtn');
  const soundToggle = $('soundToggle');

  let userId = localStorage.getItem('anonymous_user_id') || ('anon-'+Math.random().toString(36).slice(2));
  localStorage.setItem('anonymous_user_id', userId);
  let nick = localStorage.getItem('anonymous_nickname') || ('Guest'+Math.floor(Math.random()*1000));
  usernameDisplay.textContent = nick;

  let currentRoom = location.hash.slice(1) || 'general';
  if(roomInput) roomInput.value = currentRoom;

  // realtime backends
  let ws = null;
  let bc = null; // BroadcastChannel fallback
  let wsConnected = false;

  function addLocalMessageToHistory(msg){
    try{
      const key = 'anonymous_history_'+currentRoom;
      const arr = JSON.parse(localStorage.getItem(key)||'[]');
      arr.push(msg); if(arr.length>200) arr.shift();
      localStorage.setItem(key, JSON.stringify(arr));
    }catch(e){}
  }

  function renderMessage(msg){
    const m = document.createElement('div'); m.className='message-bubble'+(msg.userId===userId?' own':'');
    const meta = document.createElement('div'); meta.className='message-meta'; meta.textContent = (msg.userNick||'Anon') + ' • ' + new Date(msg.ts).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    const bubble = document.createElement('div'); bubble.className='bubble-content'; bubble.textContent = msg.text;
    m.appendChild(meta); m.appendChild(bubble); messagesArea.appendChild(m); messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function loadHistory(){
    messagesArea.innerHTML = '';
    const key = 'anonymous_history_'+currentRoom;
    const arr = JSON.parse(localStorage.getItem(key)||'[]');
    if(arr && arr.length){ arr.forEach(renderMessage); }
    else { const el=document.createElement('div'); el.className='welcome'; el.textContent='✨ Welcome! Start the conversation.'; messagesArea.appendChild(el); }
  }

  // WebSocket connection to Cloudflare Worker
  async function connectWebSocket(){
    if(!WORKER_ORIGIN) return false;
    const url = (WORKER_ORIGIN.startsWith('http') ? WORKER_ORIGIN.replace(/^http/, 'ws') : ('wss://'+location.host)) + '/ws?room=' + encodeURIComponent(currentRoom);
    try{
      ws = new WebSocket(url);
      ws.addEventListener('open', ()=>{
        wsConnected = true; console.info('ws open');
        ws.send(JSON.stringify({type:'join', userId, userNick: nick}));
      });
      ws.addEventListener('message', (ev)=>{
        try{
          const m = JSON.parse(ev.data);
          if(m.type === 'history' && Array.isArray(m.items)){
            m.items.forEach(it=>renderMessage(it));
          } else if(m.type === 'message' && m.payload){
            renderMessage(m.payload); addLocalMessageToHistory(m.payload);
          } else if(m.type === 'typing' && m.payload){
            typingIndicator.textContent = m.payload.userNick + ' is typing...'; setTimeout(()=>typingIndicator.textContent='', 1500);
          }
        }catch(e){console.warn('invalid ws message', e)}
      });
      ws.addEventListener('close', ()=>{ wsConnected=false; console.info('ws closed'); fallbackToBroadcast(); });
      ws.addEventListener('error', ()=>{ wsConnected=false; console.warn('ws error'); fallbackToBroadcast(); });
      return true;
    }catch(e){ console.warn('ws connect failed', e); return false; }
  }

  function fallbackToBroadcast(){
    try{
      if(bc) bc.close();
      bc = new BroadcastChannel('anonymous-chat-'+currentRoom);
      bc.onmessage = (ev)=>{ const data = ev.data; if(data && data.type==='message' && data.userId !== userId){ renderMessage(data); addLocalMessageToHistory(data); } if(data && data.type==='typing'){ typingIndicator.textContent = data.nick + ' is typing...'; setTimeout(()=>typingIndicator.textContent='',1500); } };
      console.info('using BroadcastChannel as fallback');
    }catch(e){ console.warn('BroadcastChannel unavailable', e); }
  }

  function sendMessage(text){
    const msg = { type:'message', id: Date.now().toString(36)+Math.random().toString(36).slice(2), userId, userNick: nick, text, ts: Date.now() };
    // render locally
    renderMessage(msg); addLocalMessageToHistory(msg);
    // send to backend
    if(ws && wsConnected){ try{ ws.send(JSON.stringify(msg)); }catch(e){ console.warn(e); } }
    else if(bc){ try{ bc.postMessage(msg); }catch(e){} }
  }

  function sendTyping(){
    const t = { type:'typing', userId, userNick: nick };
    if(ws && wsConnected){ try{ ws.send(JSON.stringify(t)); }catch(e){} }
    else if(bc){ try{ bc.postMessage(t); }catch(e){} }
  }

  // UI handlers
  sendBtn && sendBtn.addEventListener('click', ()=>{ const v = msgInput.value.trim(); if(!v) return; sendMessage(v); msgInput.value=''; });
  msgInput && msgInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendBtn.click(); } else { sendTyping(); } });
  saveNameBtn && saveNameBtn.addEventListener('click', ()=>{ const v = usernameInput.value.trim(); if(!v) return; nick = v; localStorage.setItem('anonymous_nickname', nick); usernameDisplay.textContent = nick; usernameInput.value=''; if(ws && wsConnected) ws.send(JSON.stringify({type:'presence', action:'update', userId, userNick:nick})); });
  joinRoomBtn && joinRoomBtn.addEventListener('click', ()=>{ const r = (roomInput.value||'').trim(); if(!r) return; changeRoom(r); });
  copyInviteBtn && copyInviteBtn.addEventListener('click', async ()=>{ const url = location.origin + location.pathname + '#'+currentRoom; try{ await navigator.clipboard.writeText(url); copyInviteBtn.textContent='Copied'; setTimeout(()=>copyInviteBtn.innerHTML='<i class="fas fa-link"></i> Copy invite link',1000); }catch(e){ alert('Copy failed'); } });

  function changeRoom(r){
    // cleanup
    if(ws){ try{ ws.close(); }catch(e){} ws=null; wsConnected=false; }
    if(bc){ try{ bc.close(); }catch(e){} bc=null; }
    currentRoom = r; location.hash = r; if(roomInput) roomInput.value = r; loadHistory(); // reload history for new room
    // try ws -> fallback
    (async ()=>{
      const ok = await connectWebSocket();
      if(!ok) fallbackToBroadcast();
    })();
  }

  // initial connect: try websocket then fallback
  loadHistory();
  (async ()=>{
    const ok = await connectWebSocket();
    if(!ok) fallbackToBroadcast();
  })();

  // expose helpers for debug
  window.__chat = { sendMessage, changeRoom };

})();
