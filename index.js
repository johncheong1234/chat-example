const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const axios = require('axios')
const crypto = require("crypto");

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
  console.log("getData: response:", resp.data);
  return resp;
}

async function postData(url, stringData) {
  let resp = await axios({
    method: 'post',
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

async function DeleteData(url, stringData) {
  let resp = await axios({
    method: 'delete',
    url: url,
    data: stringData,
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    maxContentLength: 100000000,
    maxBodyLength: 1000000000
  }).catch(err => {
    throw err;
  })
  console.log("DeleteData: response:", resp.data);
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

  socket.on('chat message', async ({msg, sender, receiver})=>{
    console.log('chat message sent')
    console.log(msg, sender, receiver)
    crypto.randomBytes(8, async(err, buf) => {
      if (err) {
        // Prints error
        console.log(err);
        return;
      }

      const randomid = buf.toString('hex')
      io.to(socket.handshake.auth.username).to(receiver).emit('chat message', {msg, sender, receiver, randomid});
      const chat_details = {"message":msg,"sender":sender,"receiver":receiver, "randomid": randomid}
      postData("http://44.197.34.158:8083/api/messages",chat_details)
    })
    
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('delete', ({msg, sender, receiver, randomid})=>{
    console.log('message deleted')
    console.log(msg, sender, receiver, randomid)
    io.to(sender).to(receiver).emit('delete',randomid);

    getData(`http://44.197.34.158:8083/api/messages/delete${randomid}`)
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});