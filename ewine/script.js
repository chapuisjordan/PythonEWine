// const temperature = document.getElementsByClassName("temperature");
// const humidite = document.getElementsByClassName("humidite");
// const WebSocket = require('ws')

// temperature[0].appendChild("test")
// humidite.appendChild("testDeux")
let socket = new WebSocket("ws://192.168.1.27:5678/broadcast/write");

socket.onopen = function (event) {
    socket.send("Voici un texte que le serveur attend de recevoir dès que possible !"); 
};

socket.onmessage = function (event) {
   console.log("test")
   console.log(event.data);
}

//window.onload = function(){
    // your JS here
 //   console.log(temperature[0])
 //   temperature[0].append();
//}
