const temperature = document.getElementsByClassName("temperature");
// const humidite = document.getElementsByClassName("humidite");


// temperature[0].appendChild("test")
// humidite.appendChild("testDeux")
let socket = new WebSocket("wss://192.168.1.126:5678/broadcast/temperature/read");

exampleSocket.onmessage = function (event) {
    console.log(event.data);
}

window.onload = function(){
    // your JS here
    console.log(temperature[0])
    temperature[0].append();
}