const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  // console.log(req.params.user)
  res.sendFile(__dirname + '/index.html');

});

io.on('connection', (socket) => {
  console.log('a user connected');
  console.log(socket.handshake)

  socket.join(socket.handshake.auth.sender_value);

  socket.on('chat message', ({msg, sender, receiver})=>{
    console.log('chat message sent')
    console.log(msg, sender, receiver)
    io.to(socket.handshake.auth.sender_value).to(receiver).emit('chat message', {msg, sender, receiver});

  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('delete', ({msg, sender, receiver})=>{
    console.log('message deleted')
    console.log(msg, sender, receiver)
    io.to(sender).to(receiver).emit('delete',msg);
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});