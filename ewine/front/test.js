const WebSocket = require('ws');

/*let socket = new WebSocket("ws://192.168.1.28:5678/broadcast/temperature/read");

socket.onmessage = function (event) {
	console.log('test')
	console.log(event.data)
}*/

const pTemperature = document.getElementByClassName("temperature");
pTemperature[0].innerHtml = "rerere"