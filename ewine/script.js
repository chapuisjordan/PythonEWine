<<<<<<< Updated upstream
var WebSocketServer = require("ws").Server;
var ws = new WebSocketServer( { port: 8100 } );

console.log("Server started...");
console.log("ws : ", ws)
ws.on('connection', function (ws) {
  console.log("Browser connected online...")
   
  ws.on("message", function (str) {
     var ob = JSON.parse(str);
     switch(ob.type) {
     case 'text':
         console.log("Received: " + ob.content)
         ws.send('{ "type":"text", "content":"Server ready."}')
         break;
     case 'image':
         console.log("Received: " + ob.content)         
         console.log("Here is an apricot...")
         var path ="apricot.jpg";   
         var data = '{ "type":"image", "path":"' + path + '"}';
         ws.send(data); 
         break;
      }   
    })
=======
// const temperature = document.getElementsByClassName("temperature");
// const humidite = document.getElementsByClassName("humidite");
// const WebSocket = require('ws')

// temperature[0].appendChild("test")
// humidite.appendChild("testDeux")
let socket = new WebSocket("ws://192.168.1.27:5678/broadcast/write");
>>>>>>> Stashed changes

    ws.on("close", function() {
        console.log("Browser gone.")
    })
});
