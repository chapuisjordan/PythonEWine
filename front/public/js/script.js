const wss = new WebSocket("wss://existenz.fr.nf:3000/node/temperature");
console.log('wss : ', wss);
wss.onmessage = function (event) {
	console.log('event : ', event.data)
};
 
let place_free = {}
async function addBottle(){
	console.log('add bottle');
	const response = await fetch('https://existenz.fr.nf/cellars/1', {
		method: 'get',
	})
	const resp = JSON.parse(await response.text());
	// console.log(JSON.parse(await response.text()));
	// les cases et leur etat
	const places  = JSON.parse(resp.bottle_box);
	// la 1ere case dispo
	let free_place = getEmptyPlace(places);
	console.log(free_place)
	// appel fonction python : led s'allume , sonar en attente
	const messageLed = createMessageLed(free_place);
	await sendWSMessage(messageLed);
	const messageSonar = createMessageSonar(free_place);
	await sendWSMessage(messageSonar);
}

function createMessageLed(free_place){
	return JSON.stringify({'methodPath': '/node/controllerPython', 'method': 'startLed', 'ledPin': free_place.place.ledPin, 'trigPin': free_place.place.sonarTrigPin, 'echoPin': free_place.place.sonarEchoPin})
}

function createMessageSonar(free_place){
	return JSON.stringify({'methodPath': '/node/controllerPython', 'method': 'startSonar', 'trigPin': free_place.place.sonaTrigPin, 'echoPin': free_place.place.sonarEchoPin })
}
async function sendWSMessage(message){
	console.log('message to send : ', message);
	const wss = new WebSocket("wss://existenz.fr.nf:3000/node/controllerPython");
	wss.addEventListener('open', function(event){
		wss.send(message);
	});
}

function getEmptyPlace(array){
	//console.log(array);
	//return array.find(element => element.bottle === null);
	//let place_free = {};
	array.forEach(function(el, idx, elems){
	if(place_free.index === undefined && el.bottle === null) {
		place_free.index = idx;
		place_free.place = el;
	}
	});
	return place_free;
}

async function validAddBottle(){
	console.log('place_free : ', place_free)
	const message = JSON.stringify({'methodPath': '/node/controllerPython', 'method':'stopLed', 'ledPin': place_free.place.ledPin})
	await sendWSMessage(message);
}

async function getBottles(){
	console.log('ok')
	const response = await fetch('https://existenz.fr.nf/bottles', {
		method: 'GET'
	})
	console.log('response : ', response)
	const result = await response.text()
	console.log(result)
}
