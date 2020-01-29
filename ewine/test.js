const WebSocket = require('ws');

let socket = new WebSocket("ws://192.168.1.27:5678/broadcast/write");

socket.onmessage = function (event) {
	console.log('test')
	console.log(event.data)
}
