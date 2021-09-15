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

  socket.on('chat message', (msg)=>{

    my_array = msg.split('_')

    // io.emit('chat message', my_array[0]);
    io.to(socket.handshake.auth.sender_value).to(my_array[2]).emit('chat message', my_array[0]);

  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});