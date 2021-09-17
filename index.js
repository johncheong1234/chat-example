const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const axios = require('axios')
app.use(express.urlencoded({
  extended: true
}))



app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

async function getData(url, stringData) {
  let resp = await axios({
    method: 'get',
    url: url,
    data: stringData,
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    maxContentLength: 100000000,
    maxBodyLength: 1000000000
  }).catch(err => {
    throw err;
  })
  console.log("postData: response:", resp.data);
  return resp;
}

app.post('/chat', async(req, res) => {
  const username = req.body.username

  await getData('http://44.197.34.158:8082/api/users',JSON.stringify({username: username})).then(function(response){
    if(response.data.length>0){
      res.render(__dirname + '/index.html', {username: username});
    }else{
      res.redirect('/login');
    }

  }
  ) 
  
});

app.get('/login',(req,res)=>{
  res.sendFile(__dirname+'/login.html')
})

io.on('connection', (socket) => {
  console.log('a user connected');
  console.log(socket.handshake)

  socket.join(socket.handshake.auth.username);

  socket.on('chat message', ({msg, sender, receiver})=>{
    console.log('chat message sent')
    console.log(msg, sender, receiver)
    io.to(socket.handshake.auth.username).to(receiver).emit('chat message', {msg, sender, receiver});

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