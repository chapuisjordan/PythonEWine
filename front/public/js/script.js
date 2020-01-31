const ws = new WebSocket("ws://127.0.0.1:5678/broadcast/temperature/read");
const pTemp = document.getElementsByClassName('temperature'); 
const pHumid = document.getElementsByClassName('humidite'); 
ws.onmessage = function (event) {
	console.log('event : ', event.data)
	if(event.data != "error"){
		console.log(pTemp[0]);
		const dataParse = JSON.parse(event.data);
		pTemp[0].innerHTML = "Température : " + dataParse.temperature;
		pHumid[0].innerHTML = "Humidité : " + dataParse.humidite;
	}
};