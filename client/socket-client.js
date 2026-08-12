// Minimal client socket helper used by the frontend. The frontend should include this script after the main UI.
(function(){
  const wsUrl = (location.protocol === 'https:' ? 'wss' : 'ws') + '://' + location.host;
  const socket = io(wsUrl, { transports: ['websocket'] });
  window.__anon_socket = socket;

  function joinRoom(room, nickname) {
    socket.emit('join', { room, nickname });
  }

  function sendMessage(room, text) {
    socket.emit('message', { room, content: text });
  }

  function onMessage(fn) { socket.on('message', fn); }
  function onHistory(fn) { socket.on('history', fn); }
  function onTyping(fn) { socket.on('typing', fn); }
  function onSystem(fn) { socket.on('system', fn); }

  // expose
  window.ANON = { joinRoom, sendMessage, onMessage, onHistory, onTyping, onSystem, socket };
})();
