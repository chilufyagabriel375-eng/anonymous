// Socket client to enable real-time messaging via Socket.IO
// This file augments the existing frontend in index.html and replaces the previous BroadcastChannel usage.
(function(){
  if (typeof io === 'undefined') return; // socket.io client not loaded
  const socket = io();

  // Reuse globals defined in index.html
  const messagesArea = document.getElementById('messagesArea');
  const msgInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const typingIndicator = document.getElementById('typingIndicator');
  const joinRoomBtn = document.getElementById('joinRoomBtn');
  const roomInput = document.getElementById('roomInput');
  const copyInviteBtn = document.getElementById('copyInviteBtn');

  // Use same identifiers from page
  const userId = window.userId || ('anon-' + Math.random().toString(36).substring(2,10));
  let currentNick = window.currentNick || localStorage.getItem('anonymous_nickname') || 'Ghost' + Math.floor(Math.random()*100);
  let currentRoom = location.hash.slice(1) || 'general';

  // render helper
  function renderMessage(msg, own=false){
    const div = document.createElement('div');
    div.className = 'message-bubble' + (own ? ' own' : '');
    const meta = document.createElement('div');
    meta.className = 'message-meta';
    meta.innerHTML = `<span>${escapeHtml(msg.nick || 'Anon')}</span><span>${new Date(msg.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>`;
    const content = document.createElement('div');
    content.className = 'bubble-content';
    content.innerText = msg.text;
    div.appendChild(meta);
    div.appendChild(content);
    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  // Simple escape to avoid inserting HTML from server
  function escapeHtml(str){
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function joinRoom(room){
    currentRoom = room || 'general';
    socket.emit('join', { room: currentRoom, userId, nick: currentNick });
    document.getElementById('currentRoomDisplay').textContent = '#' + currentRoom;
    document.getElementById('roomInput').value = currentRoom;
  }

  socket.on('connect', ()=>{
    joinRoom(currentRoom);
  });

  socket.on('history', (msgs)=>{
    messagesArea.innerHTML = '';
    if && msgs && msgs.length === 0) {
      // no-op
    }
    msgs = msgs || [];
    msgs.forEach(m => renderMessage(m, m.userId === userId));
  });

  socket.on('message', (msg)=>{
    renderMessage(msg, msg.userId === userId);
    try { if (sendSound && msg.userId !== userId) sendSound.play(); } catch(e){}
  });

  socket.on('typing', ({ userId: tUser, nick, typing })=>{
    if (!typing) {
      typingIndicator.textContent = '';
      return;
    }
    typingIndicator.textContent = `${nick || 'Someone'} is typing...`;
    setTimeout(()=>{ if (typingIndicator.textContent.startsWith(nick)) typingIndicator.textContent = ''; }, 2000);
  });

  // send message
  sendBtn.addEventListener('click', ()=>{
    const text = msgInput.value && msgInput.value.trim();
    if (!text) return;
    const payload = { room: currentRoom, userId, nick: currentNick, text };
    socket.emit('message', payload);
    // optimistic render
    renderMessage({ ...payload, time: Date.now() }, true);
    msgInput.value = '';
    try { if (sendSound) sendSound.play(); } catch(e){}
  });

  msgInput.addEventListener('input', ()=>{
    socket.emit('typing', { room: currentRoom, userId, nick: currentNick, typing: msgInput.value.length > 0 });
  });

  msgInput.addEventListener('keypress', (e)=>{ if (e.key === 'Enter') sendBtn.click(); });

  // room join button
  joinRoomBtn.addEventListener('click', ()=>{
    const newRoom = (roomInput.value || 'general').trim();
    if (!newRoom) return;
    joinRoom(newRoom);
    location.hash = newRoom;
  });

  window.addEventListener('hashchange', ()=>{
    const newRoom = location.hash.slice(1) || 'general';
    joinRoom(newRoom);
  });

  // invite copy
  if (copyInviteBtn) copyInviteBtn.addEventListener('click', ()=>{
    const url = location.origin + location.pathname + '#' + currentRoom;
    navigator.clipboard.writeText(url).then(()=>{
      copyInviteBtn.textContent = 'Copied!';
      setTimeout(()=> copyInviteBtn.innerHTML = '<i class="fas fa-link"></i> Copy invite link', 1500);
    }).catch(()=>{});
  });

  // Private chat hooks (basic)
  const copyPrivateCodeBtn = document.getElementById('copyPrivateCodeBtn');
  const privateChatCode = document.getElementById('privateChatCode');
  const createNewBtn = document.getElementById('createNewBtn');
  const joinPrivateBtn = document.getElementById('joinPrivateBtn');
  const joinPrivateInput = document.getElementById('joinPrivateCodeInput');

  function generatePrivateCode(){
    return Math.random().toString(36).slice(2,9);
  }
  let currentPrivateCode = generatePrivateCode();
  if (privateChatCode) privateChatCode.textContent = currentPrivateCode;
  if (copyPrivateCodeBtn) copyPrivateCodeBtn.addEventListener('click', ()=>{
    navigator.clipboard.writeText(currentPrivateCode).then(()=>{
      copyPrivateCodeBtn.textContent = 'Copied!';
      setTimeout(()=> copyPrivateCodeBtn.textContent = 'Copy Code', 1200);
    });
  });
  if (createNewBtn) createNewBtn.addEventListener('click', ()=>{
    currentPrivateCode = generatePrivateCode();
    if (privateChatCode) privateChatCode.textContent = currentPrivateCode;
  });
  if (joinPrivateBtn) joinPrivateBtn.addEventListener('click', ()=>{
    const code = (joinPrivateInput.value || '').trim();
    if (!code) return alert('Paste a valid code');
    // For now, private rooms map to 'private-' + code
    const roomName = 'private-' + code;
    location.hash = roomName;
    joinRoom(roomName);
    // show private chat view
    document.getElementById('privateSetupView').style.display = 'none';
    document.getElementById('privateChatView').style.display = 'flex';
  });

})();
