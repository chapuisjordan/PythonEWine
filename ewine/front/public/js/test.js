//const WebSocket = require('ws');

	const wsRead = new  WebSocket('ws://192.168.1.28:5678/broadcast/temperature/write');
	wsRead.onerror=function(e){console.log(e)}
	wsRead.onclose=function(e){console.log('closed'+e);}
	wsRead.onopen=function() {
		console.log('connected ');
	}
	wsRead.onmessage=function(ms)
	{
		console.log(ms);
	}

/*let socket = new WebSocket("ws://192.168.1.28:5678/broadcast/temperature/read");

socket.onmessage = function (event) {
	console.log('test')
	console.log(event.data)
}*/

//const pTemperature = document.getElementByClassName("temperature");
//pTemperature[0].innerHtml = "rerere";