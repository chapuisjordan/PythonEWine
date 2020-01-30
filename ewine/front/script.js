var express = require('express');
var app = express();
var path = require('path');
app.use(express.static(__dirname + '/public'));
// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

// définir le port d'écoute
app.listen(8080);