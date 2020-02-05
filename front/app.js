var express = require('express');
var app = express();
var path = require('path');
var io = require('socket.io');
app.use(express.static(__dirname + '/public'));
// respond with "hello world" when a GET request is made to the homepage
app.get('/temperature', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

// définir le port d'écoute
app.listen(8080);
// const WebSock = require('ws');
// const ws = new WebSock("ws://existenz.fr.nf:3000/node");
// ws.on('message', function incoming(data) {
//   console.log(data);
// });