const wss = new WebSocket("wss://existenz.fr.nf:3000/node/temperature");
console.log('wss : ', wss);
wss.onmessage = function (event) {
	console.log('event : ', event.data)
};
// {"temperature": 23, "humidite": 11}
// reponse temp : data.temperature

async function getBottles(){	
	const response = await fetch('https://existenz.fr.nf/cellars/1', {
		method: 'get',
	})
	const resp = JSON.parse(await response.text());

	
	hydrateCellar(resp);
}

function hydrateCellar(bottles){
	let main = document.querySelector('main');
	let  fragment = document.createDocumentFragment();
	bottles.forEach(function(bottle){
		let div = document.createElement('div');
		div.classList.add('card');
		if(bottle.b_id) {
			let title = document.createElement('h2');
			title.textContent = bottle.w_name;
			let millesim = document.createElement('h2');
			let img	= document.createElement('img');
			img.src = bottle.w_visual;
			div.appendChild(title);
			div.appendChild(img);
		}		
		fragment.appendChild(div);
	});
	main.appendChild(fragment);

}

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
	const message = createMessage(free_place);
	await sendWSMessage(message);
}

function createMessage(free_place){
	return JSON.stringify({'methodPath': '/node/controllerPython', 'method': 'startLed', 'ledPin': free_place.place.ledPin})
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
	let place_free = {};
	array.forEach(function(el, idx, elems){
	if(place_free.index === undefined && el.bottle === null) {
		place_free.index = idx;
		place_free.place = el;
	}
	});
	return place_free;
}
