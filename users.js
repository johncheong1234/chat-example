const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
app.use(express.urlencoded({
    extended: true
}))
const bodyParser = require("body-parser");
app.use(bodyParser.json());

  
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "MyNewStrongP@ssw0d!",
    database: "lms"
  });


app.get('/find_all',(req,res)=>{
    con.connect(function(err) {
    // if (err) throw err;
    con.query(`SELECT * FROM users`, function (err, result, fields) {
      if (err){
          throw err
      }else{
        console.log(JSON.parse(JSON.stringify(result)))
        res.send(JSON.parse(JSON.stringify(result)))
      }
      con.end()
    });
  })
  
  
})

app.post('/find_one',(req,res)=>{
    con.connect(function(err) {
    // if (err) throw err;
    con.query(`SELECT * FROM users WHERE username = "${req.body['username']}"`, function (err, result, fields) {
        res.send(JSON.parse(JSON.stringify(result)))
    });
    con.end()
  });

  
})

server.listen(2000, () => {
    console.log('listening on *:2000');
  });