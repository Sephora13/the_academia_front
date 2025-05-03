// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', socket => {
  console.log('🔌 Client connecté:', socket.id);

  socket.on('join-room', roomId => {
    socket.join(roomId);
  });

  socket.on('signal', ({ roomId, data }) => {
    // Broadcast to all other clients in the room
    socket.to(roomId).emit('signal', data);
  });
});

server.listen(3000, () => console.log('🚀 Signal server running on :3000'));
