/**
Déclaration des variables
**/

var body = document.body || document.documentElement;
var spinner = document.getElementById('spinner');
var bandeau = document.getElementById('bandeau');
var productsController = new Controller('Products');
// on cible l'element #container sur lequel on ajoute un eventListener
var container = document.getElementById('container');

// Référence: http://www.html5rocks.com/en/tutorials/speed/animations/
var scrollPos = 0;
var ticking = false;
var cart;
var xhr = function(params, success, error) {
		//params : object
		// method, url, data...
		//o5 = "Yip" || "Yop"      // t || t renvoie "Yip"
		var method = params.method || "GET"; 
		var data = params.data || null;
		var url = params.url;
		if(method === 'GET' && data !== null)
			url = url + data;           
		var req = new XMLHttpRequest();
		req.onreadystatechange = function () {
			if (req.readyState === 4) {
				if (req.status >= 200 && req.status < 304) {     
				// Si on n'a pas de parametre type on part du principe qu'on veut une reponse json
				if(params.type === undefined) {
					if(req.responseType !== 'json') {  
					// cas IE qui ne renvoie pas de json                      
					var resp = JSON.parse(req.responseText);
				} else {
					var resp = req.response;                    
				}
				} else if (params.type === 'text') {
					var resp = req.responseText;
				} else {
						// blob, arraybuffer etc
						var resp = req.response;
					}                    
					success(resp);
				} else if (req.status === 0) { 
					error(req.status +' [Network failed]')              
					
				} else { error(req.statusText) }
			}
		}
		//req.onerror = function() { error( 'err') }
		req.ontimeout = function () {
			console.error("The request for " + url + " timed out.");
		};
		req.open(method, url, true);
		//req.timeout = 3000; // 3s
		req.setRequestHeader('X-Requested-With', 'xmlhttprequest'); 
		req.responseType = params.type || 'json';   
		req.send(data);
};
if(document.location.pathname === '/'){
	history.pushState({callback:'ajaxLoad'}, 'Loading pages with Ajax', '/');

}

// Nombre total d'articles dans le panier
if (document.getElementById('articlesInCart')) {
	var articlesInCart = document.getElementById('articlesInCart');
	var totalInCart =   document.getElementById('totalInCart');                
}
/**
 * Get siblings of an element
 * @param  {Element} elem
 * @return {Object}
 */
function getSiblings(elem) {
	var siblings = [];
	if(elem === undefined) {
		return false;
	}
	if(elem.parentNode.firstElementChild) {
		 var sibling = elem.parentNode.firstElementChild;
	}
	else {
		var sibling = elem.parentNode.firstChild;
	}
	
	var skipMe = elem;
	for ( ; sibling; sibling = sibling.nextSibling ) 
	   if ( sibling.nodeType == 1 && sibling != elem )
		  siblings.push( sibling );
	return siblings;
}
function trim(string){
  return  string.trim();
}
function hasClass(element, cls) {
	if(!element) return;
	return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}
function addClass(element, cls) {
	if(!element) return;
	 if(!hasClass(element, cls)) {
		element.className = element.className.trim() +' '+cls;
	}
}
function removeClass(element, cls) {
	if(hasClass(element, cls)) {
		var classes = element.className;
		classes=classes.replace(cls,'');
		
		element.className = classes;
	}

}
function toogleClass(element, cls){
	if(hasClass(element, cls)){
	   
	   var classes = element.className;
		classes=classes.replace(cls,'');
	   
		element.className = classes;
	} else {
		addClass(element, cls);
	}
}



// Recherche de tous les liens avec attributs data-item
if(document.getElementById('main')) {
	var main = document.getElementById('main');
	var el = main.querySelector('[data-menu]');  
		var link = el.getAttribute('data-menu');
		var a = document.querySelectorAll('.menu_item');
		for (var i = 0; i<a.length; i++) {
			if(a[i].hasAttribute('data-item') && a[i].getAttribute('data-item') == link){
				addClass(a[i], 'active');
			} else {
				removeClass(a[i], 'active');
			}
		}
	
}
// Construction du panier
// envoie dans le constructeur les données du localStorage

var Panier = function (storage, span) {
	// chiffre.toFixed(2) pour un retour avec chiffres après la virgule;
	if (storage !== null) {
		this.basket = storage;       
		this.total = storage.c_total;
		
		this.itemsInCart = storage.q_total;
		if(storage.q_total >0)
			// Le panier n'est pas vide, on affiche la flèche 
		removeClass(document.getElementById('cart-arrow'), 'hide');   
		this.updateBasket(this.itemsInCart, this.total);
		
	} else {
		localStorage.setItem('panier', '{"items":{},"c_total":0,"q_total":0}');       
		this.total = 0.00;
		this.itemsInCart = 0;
	}
};
// ajouter une methode à l'objet panier, depuis son prototype 
Panier.prototype.addItem = function (idItem, arguments) {
	// il faut instancier une nouvelle ligne de commande
	// id : id du produit
	// arguments : tableau (img, qty, desc, prix)
	// si id existe, il faut incrémenter la propriété qty
	// sinon on créé une nvelle ligne de commande
	if (this.basket[idItem]) {
		this.basket[idItem]['qty']++;
		this.basket[idItem]['totalItem'] += this.basket[idItem].prix;
		 // penser à maj le total ttc
		 // ajouter un total d'article dans le panier
		this.total += this.basket[idItem].prix;
		this.itemsInCart ++;
		articlesInCart.innerHTML = this.itemsInCart;
		
	} else {

		this.basket[idItem] = arguments;
		this.basket[idItem]['qty'] = 1;
		this.basket[idItem]['totalItem'] = this.basket[idItem].prix;
		// penser à maj le total ttc
		this.total += this.basket[idItem].prix;
		this.itemsInCart ++;
		articlesInCart.innerHTML = this.itemsInCart;
	}
	if (document.getElementById(idItem)) {
		var ligne = document.getElementById(idItem);
		var input = ligne.querySelector('input.inputMiddle');
		input.value = this.basket[idItem]['qty'];
		this.getTotal();
	}
	// au finish, il faut mettre à jour localStorage
	this.updateStorage('panier', this.basket)
	if(!document.getElementById(idItem)) 
		alert('Ajouté au panier')
}
Panier.prototype.deleteItem = function (idItem) {
	this.basket.q_total -= this.basket.items[idItem].qty;       
	this.basket.c_total -= this.basket.items[idItem].p_total;
	this.total -= this.basket.items[idItem].p_total;
	this.itemsInCart -= this.basket.items[idItem].qty;
	delete this.basket.items[idItem];
	this.updateBasket( this.basket.q_total,  this.basket.c_total);             
	this.updateStorage('panier', this.basket);
	var storage = localStorage.getItem('panier');
	setCart(storage);
	if (document.getElementById(idItem)) {       
		var tbody = document.querySelector('tbody'); 
		var ligne = document.getElementById(idItem);
		tbody.removeChild(ligne);
		if(tbody.children.length === 0) {
			container.innerHTML = '<h1>Votre panier est vide </h1>';
		}
		else {
			this.getTotal();
		}         
	}
}
Panier.prototype.removeItem = function (idItem) {
	this.basket.q_total --;        
	this.basket.c_total -= this.basket.items[idItem].p_price;
	this.total -= this.basket.items[idItem].p_price;
	this.itemsInCart --;        
	delete this.basket.items[idItem];
	this.updateBasket( this.basket.q_total,  this.basket.c_total);             
	this.updateStorage('panier', this.basket);
	var storage = localStorage.getItem('panier');
	setCart(storage);
	
	if (document.getElementById(idItem)) {       
		var tbody = document.querySelector('tbody'); 
		var ligne = document.getElementById(idItem);
		tbody.removeChild(ligne);
		if(tbody.children.length === 0) {
			container.innerHTML = '<h1>Votre panier est vide </h1>';
		}
		else {
			this.getTotal();
		}   
		
	}

}
Panier.prototype.updateItems = function(total){
	if(total === 0) {
	  articlesInCart.innerHTML = ''; 
	  addClass(document.getElementById('cart-arrow'), 'hide');
	} else {
			removeClass(document.getElementById('cart-arrow'), 'hide');
			articlesInCart.innerHTML = total;
			// penser à supprimer le tableau
	}
}

Panier.prototype.decreaseItem = function (idItem) {
   
	if (this.basket.items[idItem].qty <= 1) {
		this.removeItem(idItem);

	} else {
		this.basket.items[idItem].qty --;
		this.basket.items[idItem].p_total -= this.basket.items[idItem].p_price;
		// penser à maj le total
		this.basket.q_total --;
		this.basket.c_total -= this.basket.items[idItem].p_price;
		this.total -= this.basket.items[idItem].p_price;
		this.itemsInCart --;
		this.updateBasket( this.basket.q_total,  this.basket.c_total);             
		this.updateStorage('panier', this.basket);
		var storage = localStorage.getItem('panier');
		this.getTotal();
		setCart(storage);       
	}   
}
Panier.prototype.increaseItem = function (idItem) {
	this.basket.items[idItem].qty ++;
	this.basket.items[idItem].p_total += this.basket.items[idItem].p_price;
	// penser à maj le total
	this.basket.q_total ++;
	this.basket.c_total += this.basket.items[idItem].p_price;
	this.total += this.basket.items[idItem].p_price;
	this.itemsInCart ++;
	this.updateBasket( this.basket.q_total,  this.basket.c_total);             
	this.updateStorage('panier', this.basket);
	var storage = localStorage.getItem('panier');
	this.getTotal();
	setCart(storage);         
}
Panier.prototype.basket = {};
Panier.prototype.itemsInCart = 0;
Panier.prototype.updateStorage = function (key, data) {
	var stringified = JSON.stringify(data);
	localStorage.setItem(key, stringified);
	this.basket = data;
}
Panier.prototype.updateBasket = function(q_total, c_total){
	var price = parseFloat(c_total).toFixed(2).replace('.', ','); 
	if(articlesInCart) {
		if(q_total === 0) {
	  articlesInCart.innerHTML = '';
	  totalInCart.innerHTML = '';
	 
	}
	else if(q_total === 1) {
			//articlesInCart.innerHTML = q_total+' article';
			articlesInCart.innerHTML = q_total;
			//totalInCart.innerHTML = price+'€';


	} else {
			//articlesInCart.innerHTML = q_total+' articles';
			//totalInCart.innerHTML = price+'€';
			articlesInCart.innerHTML = q_total;

	}

	}    
}

Panier.prototype.remove = function(key) {
	localStorage.removeItem(key);
}

Panier.prototype.getTotal = function () {
	if(document.getElementById('inputTotalCart')) {

		var input = document.getElementById('inputTotalCart'); 
		var span =  document.getElementById('spanTotalCart');   
	   // chiffre.toFixed(2) //pour un retour avec chiffres après la virgule
		var price = this.total.toFixed(2).replace('.', ','); 
		if(span)       
			span.innerHTML = price;
		input.value = price;
	} else {
		var price = this.total.toFixed(2).replace('.', ',');
		return price; 
	}
}
/**
 * Les fonctions appellées lors d'un eventListener * 
 */

/*
	Récupérer les marques en fonction d'un Univers
	construire des options et les injecter dans le select model
 */
function getBrandByUnivers(elem){	
	var url = elem.getAttribute('data-xhr') + '?universe='+elem.value;
	var target = elem.getAttribute('data-target');
	var value = false;
	if(elem.hasAttribute('data-value')){
		value = elem.getAttribute('data-value')
	}
	xhr({url: url}, function(resp){
		if(!resp.error){
			var fragment = document.createDocumentFragment();
			var select  = document.getElementById(target); // select cible
			// si data-key 
			
			var key = select.hasAttribute('data-key') ? select.getAttribute('data-key') : 'id';
			// récupérer le 1er enfant de la liste qui sert de placeholder
			var childNode = select.firstElementChild;
			// vider le select 
			while (select.firstChild) {select.removeChild(select.firstChild);}
			//select.innerHTML = '';
			fragment.appendChild(childNode);					
			var brands = resp.brands;
			brands.forEach(function(brand) {
			    var option = document.createElement('option');
			    option.textContent =brand.brand_lib;
			    if(value !== false)
			    	option.value = brand[value];
			    else
			    	option.value = brand[key];
			    fragment.appendChild(option);
			});
			select.appendChild(fragment);
			select.disabled = null;						
		} else {
			
		}
			 
	}, function(e) {
		return console.log('Update : Network request failed');            
	}); 
}


/**
 * On récupère les models associés à un univers et une marque
 * 2 retours possible : sous forme de liste ou paragraphes
 * @param  {[type]} elem [description]
 * @return {[type]}      [description]
 */
function getModelByBu(elem){
	var value = false;
	var container_id = elem.getAttribute('data-target');
	var container  = document.getElementById(container_id); // cible
	var key = container.hasAttribute('data-key') ? container.getAttribute('data-key') : 'id';
	var fragment = document.createDocumentFragment();
	// data-range optionnel par la suite prévoir de construire url automatiquement
	var range_id = elem.hasAttribute('data-range') ? elem.getAttribute('data-range') : null;
	
	if(container.hasAttribute('data-output') && container.getAttribute('data-output') == 'select') {
		var url = elem.getAttribute('data-xhr') + '?bu_id='+elem.value;		
		xhr({url: url}, function(resp){
			if(!resp.error) {			
				// récupérer le 1er enfant de la liste qui sert de placeholder
				var childNode = container.firstElementChild;
				fragment.appendChild(childNode);
				// vider le select 
				while (container.firstChild) {container.removeChild(container.firstChild);}
				var models = resp.models;
				if(models.length >= 1) {				
					models.forEach(function(model, index) {					
					    var option = document.createElement('option');
					    option.textContent = model.model_lib;
					    if(value !== false)
				    		option.value = model[value];
				    	else
				    		option.value = model[key];
				    	fragment.appendChild(option);			    	
					});
					container.appendChild(fragment);
					container.disabled = null;	
				} else {
					// on remet l'enfant childNode dans le select
					container.appendChild(childNode);				
				}					
			} 			 
		}, function(e) { return console.log('Update : Network request failed');   
		});

	} else {
		var url = elem.getAttribute('data-xhr') + '?bu_id='+elem.value + '&range_id=' + range_id;		
		
		xhr({url: url}, function(resp){
		if(!resp.error){
			var fragment = document.createDocumentFragment();			
			var master = container.getAttribute('data-master');
			// récupérer le 1er enfant de la liste qui sert de placeholder
			var childNode = container.firstElementChild;			
			while (container.firstChild) {container.removeChild(container.firstChild);}
			var models = resp.models;
			if(models.length >= 1) {				
				models.forEach(function(model, index) {
					var p = document.createElement('p');
				    var input = document.createElement('input');
				    input.id = 'models['+ master + ']['+ index +']';
				    input.name = 'models['+ master + ']['+ index +']';
				    var label = document.createElement('label');
				    label.textContent = model.model_lib;
				    label.setAttribute('for', 'models['+ master + ']['+ index +']');
				    input.type = 'checkbox';
				    //option.textContent =
				    if(value !== false)
				    	input.value = model[value];
				    else
				    	input.value = model[key];
				    p.appendChild(label);
				    p.appendChild(input);
				    fragment.appendChild(p);
				});
			} else {
				var div = document.createElement('div');
				div.textContent = "Tous les modèles de cette marque sont déjà associés à cette gamme";
				fragment.appendChild(div);
			}		
			container.appendChild(fragment);							
		} 
			 
	}, function(e) {
		return console.log('Update : Network request failed');            
	});
	}
	
	
	
	
	
}

function ajaxLoad(url) {
	
	var httpRequest = getHttpRequest();
		httpRequest.onreadystatechange = function () {
			if (httpRequest.readyState === 4) {
				if (httpRequest.status === 200) {
					var resp = httpRequest.responseText;
					 // ici, si url = panier .....
					container.innerHTML = resp; 
					   
						   
						
				} else {
					alert('La connexion au serveur n\'a pas abouti')
				}                     
			}       
		}
	httpRequest.open('GET', url, true);
	httpRequest.setRequestHeader('X-Requested-With', 'xmlhttprequest');        
	//httpRequest.responseType = 'json';       
	httpRequest.send();

}
/**
 Chargement d'une page produits par catégorie
 http://lafleur2017.com/boutique/com-compositions-florales
**/
function productsLoad(url) {
	var httpRequest = getHttpRequest();       
	httpRequest.onreadystatechange = function () {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {                    
					var resp = httpRequest.response;
					var data = resp.data;
					var baseTpl = resp.baseTpl;
					var cardTpl = resp.cardTpl;
					var title =  resp.titre;
					// Si pas de data, donc pas d'article correspondant à la catégorie choisie, on ne fait rien
					if(data.length === 0) {
					   container.innerHTML = Mustache.render(baseTpl,{id : resp.id, titre: title}, {
						cards : cardTpl
					});
					}                                              
					
					for(var i in data) {
						var price =  data[i].prix.replace('.', ',');
						data[i].prix = price;
					}                                         
					container.innerHTML = Mustache.render(baseTpl,{id : resp.id, cards : data, titre: title}, {
						cards : cardTpl
					});                
			   
			} else {
				alert('La connexion au serveur n\'a pas abouti')
			}
			if (document.getElementById('cart')) {
				setToCart();
			}   
		}            
	}
	httpRequest.open('GET', url, true);
	httpRequest.setRequestHeader('X-Requested-With', 'xmlhttprequest'); 
	httpRequest.responseType = 'json';       
	httpRequest.send();
}
/**
 Chargement d'une fiche produit
 http://lafleur2017.com/articles/c08-dipladenia
**/
function productSheetLoad(url) {
	var httpRequest = getHttpRequest();       
	httpRequest.onreadystatechange = function () {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {                    
					var resp = httpRequest.response;                    
					var tpl = resp.tpl;
					var product = resp.product;  
					var reviews = resp.reviews;
					var inputs =   resp.inputs;          
					container.innerHTML = Mustache.render(tpl,{product:product, reviews: reviews, inputs:inputs});                             
			} else {
				alert('La connexion au serveur n\'a pas abouti')
			}
			if (document.getElementById('cart')) {
				setToCart();
			}   
		}            
	}
	httpRequest.open('GET', url, true);
	httpRequest.setRequestHeader('X-Requested-With', 'xmlhttprequest'); 
	httpRequest.responseType = 'json';       
	httpRequest.send();

}

var updateModelOption = function(el) {
	let value = 1;
	let model_id = el.getAttribute('data-model');
	let field = el.getAttribute('data-field');
	// Si on a la class status-ok on envoie 0
	if(el.classList.contains('status-ok')){
		value = 2;
	}
	var data = new FormData();
	data.append('model_id', model_id);
	data.append('field', field);
	data.append('f_value', value);
	xhr({url: 'https://dev.kutvek.com/admin.models.updateOption', data: data, method: 'POST'}, function(resp){
		if(!resp.error){
			// Si on avait 0
			if(value == 1) {
				el.classList.add('status-ok');
				el.classList.remove('status-progess');
			} else {
				el.classList.remove('status-ok');
				el.classList.remove('status-progess');
			}				
		} else {			
			el.classList.remove('status-progess');
			return console.log(resp.msg);
		}
			 
	}, function(e) {
		elem.classList.remove('status-progess');
		return console.log('Update : Network request failed');            
	});


}

function ajaxCart(url) {
	var httpRequest = getHttpRequest();
	httpRequest.onreadystatechange = function () {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var panier = JSON.parse(localStorage.getItem('panier'));
							  
				if(panier.q_total > 0) {
					//On construit un tableau pour le passe à mustache
				   
					//var resp = httpRequest.response;
					var tpl = httpRequest.response.tpl;
					var data = [];
					var i = 0;                       
					cart.total = panier.c_total;
			  
					for (var prop in panier.items) {
						
						data[i] = panier.items[prop];
						data[i]['id'] = prop;
						data[i]['price'] = parseFloat(panier.items[prop].p_price).toFixed(2).replace('.',',');
						i++;        
					}                    
					container.innerHTML = Mustache.render(tpl,{articles : data}); 
				   cart.getTotal();
				   
				} else {
					container.innerHTML ="<p class=\"h3\">Votre panier est vide</p>"; 
				}            
					
			} else {
				alert('La connexion au serveur n\'a pas abouti')
			}                     
		}       
	}
	httpRequest.open('GET', url, true);
	httpRequest.setRequestHeader('X-Requested-With', 'xmlhttprequest'); 
	httpRequest.responseType = 'json';       
	httpRequest.send();
}

function onChange(event) {
	var elem = event.target;        
	if(elem.classList.contains('onchange'))
	{
		event.preventDefault();
		if(elem.classList.contains('range')) {
			// on rajoute un attribut data-range sur la div qui recevra les modeles
			var master = document.getElementById(elem.getAttribute('data-master'));
			master.setAttribute('data-range', elem.value);

		} else {
			var action = elem.getAttribute('data-func');             
			window[action](elem); 
		}
		
		
	}
	if(elem.id == 'finish') {
		var value = elem.value;
		var option_line = document.querySelector('div.option-finish');
		if(value == 'gloss'){
		
		if(!hasClass(option_line, 'hide')) {
			addClass(option_line, 'hide');
			var span = document.getElementById('total-price');
			var total  = parseInt(span.innerHTML, 10) - 10;
			span.textContent = total;
		}
		

		}
		if(value == 'matte') {
			removeClass(option_line, 'hide');
			var span = document.getElementById('total-price');
			var total  = parseInt(span.innerHTML, 10) + 10;
			span.textContent = total;


		}
		console.log(elem.value);
	}
	
}

function onClickLink(event) {
	// Si on a pas affaire à un lien 
	var elem = event.target;  
	var fetched = '';
	if(elem.classList.contains('onclick') || elem.parentNode.classList.contains('onclick'))
	{
		

		var el = elem.classList.contains('onclick') ? elem : elem.parentNode;		
		if(el.classList.contains('lock')){
			event.preventDefault();
			// Au click sur les liens avec class lock dans un fieldset : on met la class unlock
			// on enleve disabled sur le fieldset
			el.classList.remove('lock');
			el.classList.add('unlock');
			el.parentNode.querySelector('fieldset').disabled =null;
			return;
		}
		if(el.classList.contains('unlock')){
			event.preventDefault();
			// Au click sur les liens avec class lock dans un fieldset : on met la class unlock
			// on enleve disabled sur le fieldset
			el.classList.remove('unlock');
			el.classList.add('lock');
			el.parentNode.querySelector('fieldset').disabled = true;
			return;	
		}
		if(el.hasAttribute('data-box')) {
			event.preventDefault();
			var checkboxes = document.getElementById(el.getAttribute('data-box')).querySelectorAll('input[type="checkbox"]');
			checkboxes.forEach(function(checkbox){
				checkbox.checked = true;
			});
		}
		if(el.hasAttribute('data-check-all')) {
			var checkId = el.getAttribute('data-check-all');
			var checkboxes = document.querySelectorAll('input[data-check="' + checkId + '"]');
			checkboxes.forEach(function(checkbox){
				checkbox.checked = el.checked == true ? true : false;
			});			
		}
		// Permet de dupliquer le choix de couleurs a lier à des kits en prenant les couleurs cochees 
		// de la premiere ligne (1er kit)	
		if(el.hasAttribute('data-copy')) {
			event.preventDefault();
			// on selectionne toutes les checkbox cochées dans le premier bloc
			var form = document.getElementById('addKitColor');
			var allCheckboxes = form.querySelectorAll('input.color-choice[type="checkbox"]');
			var firstBloc = form.querySelector('div.bloc');
			var checkboxes = firstBloc.querySelectorAll('input[type="checkbox"]:checked');
			// ok, on boucle dessus
			console.log(checkboxes);
			checkboxes.forEach(function(checkbox){
				// on selectionne sa valeur
				var value = checkbox.value;
				// on boucle sur toutes les checkbox du form
				allCheckboxes.forEach(function(allCheckbox){
					if(allCheckbox.value === checkbox.value && allCheckbox.checked == false)
						allCheckbox.checked = true;
				});
			});
		}	
	}
	// Modification des options d'un model
	if(elem.classList.contains('option-status'))
	{
		event.preventDefault();		
		elem.classList.add('status-progess');
		//console.log(elem.getAttribute('data-value'));
		window['updateModelOption'](elem); 
		return;
	}
	if(hasClass(elem, 'jsShow')) {
		event.preventDefault();
		var form = document.getElementById(elem.getAttribute('data-show'));
		toogleClass(form,'jsHide');
	}
	if(elem.classList.contains('popup_bg'))
	{
		
		document.body.style.overflow = '';
		addClass(elem, 'popup_hide'); 
	}
	if(elem.hasAttribute('data-popup'))
	{
		event.preventDefault();
		var popin = document.querySelector(elem.getAttribute('data-target'));        
		var href = elem.href;
		// on va récupérer la commande 
		//var formData = new FormData();
		//formData.append('id',elem.getAttribute('data-id'));
		//formData.append('status', status);
		var httpRequest = getHttpRequest();
		httpRequest.onreadystatechange = function () {
			if (httpRequest.readyState === 4) {
				if (httpRequest.status === 200) {
					// ajout du contenu textuel dans le container
					popin.querySelector('.popup_content').innerHTML = httpRequest.responseText;
					popin.classList.remove('popup_hide');

				} else {
					alert('La connexion au serveur n\'a pas abouti erreur : '+ httpRequest.status);
				}                     
			}       
		}
		httpRequest.open('GET', href, true);
		httpRequest.setRequestHeader('X-Requested-With', 'xmlhttprequest'); 
		httpRequest.responseType = 'text';       
		//httpRequest.send(formData);    
		httpRequest.send();        
		

		
	}
	if((elem.hasAttribute('for') && (elem.hasAttribute('for') == 'huey' )) || elem.id == 'huey') {
	   
		console.log('perso0');
		var radio = elem.id == 'huey' ? elem : elem.parentNode.querySelector("input[type='radio'");
		console.log(radio.checked);
		var option_line = document.querySelector('div.option-price');
		addClass(option_line, 'hide');
		var span = document.getElementById('total-price');
		addClass(document.getElementById('option1'), 'hide');
		var total  = parseInt(span.innerHTML, 10) - 10;
		span.textContent = total;
	}
	if((elem.hasAttribute('for') && (elem.hasAttribute('for') == 'dewey' )) || elem.id == 'dewey') {
		console.log('perso1');
		 var radio = elem.id == 'dewey' ? elem : elem.parentNode.querySelector("input[type='radio'");
		 console.log(radio.checked);
		  var option_line = document.querySelector('div.option-price');
		removeClass(option_line, 'hide');
		removeClass(document.getElementById('option1'), 'hide');
		 var span = document.getElementById('total-price');
		var total  = parseInt(span.innerHTML, 10) + 10;
		span.textContent = total;
	}
	if(hasClass(elem , 'select-list') || hasClass(elem.parentNode , 'select-list')){
		// au clic sur la div de selection degamme
		var div_id = hasClass(elem , 'select-list') ? elem.id : elem.parentNode.id;       
	   // on fait apparaitre la liste
	   var ul = document.querySelector("ul[data-div='"+div_id+"']");
	   removeClass(ul, 'nopx');


	}

	if(elem.hasAttribute('data-gamme') || elem.parentNode.hasAttribute('data-gamme') ) {        
		var li = elem.hasAttribute('data-gamme') ? elem : elem.parentNode;
		var ul = li.parentNode;
		var div = document.getElementById(ul.getAttribute('data-div'));
		var input = div.querySelector("input[type='hidden']");
		if(li.hasAttribute('data-content') && li.getAttribute('data-content') == 'img') {
			var gamme = li.getAttribute('data-gamme');
			 div.querySelector('span.text').innerHTML = gamme; 
			 input.value=gamme;
		} else {
			 var gamme = li.getAttribute('data-gamme');
			 div.querySelector('span.text').textContent = gamme; 
			 input.value = gamme;
		}      
		addClass(ul, 'nopx');
	}

	if(hasClass(elem, 'cmd-status')) 
	{
		event.preventDefault();
		var href = elem.href;
		//console.log(href);
		console.log(elem.getAttribute('data-id'));
		if(hasClass(elem, 'order-treated'))
			var status = 0;
		else
			var status = 1;   
		//console.log(status);          
		var formData = new FormData();
		formData.append('id',elem.getAttribute('data-id'));
		formData.append('status', status);
		var httpRequest = getHttpRequest();
		httpRequest.onreadystatechange = function () {
			if (httpRequest.readyState === 4) {
				if (httpRequest.status === 200) {
					toogleClass(elem, 'order-treated');                         
				} else {
					alert('La connexion au serveur n\'a pas abouti erreur : '+ httpRequest.status);
				}                     
			}       
		}
		httpRequest.open('POST', href, true);
		httpRequest.setRequestHeader('X-Requested-With', 'xmlhttprequest'); 
		httpRequest.responseType = 'json';       
		httpRequest.send(formData);
	}
	if(elem.classList.contains('is-online'))
	{
		event.preventDefault();
		var href = elem.href;
		//console.log(href);
	   // console.log(elem.getAttribute('data-id'));
		if(elem.classList.contains('online'))
			var status = 0;
		else
			var status = 1;   
		//console.log(status);          
		var formData = new FormData();
		formData.append('id',elem.getAttribute('data-id'));
		formData.append('status', status);
		var httpRequest = getHttpRequest();
		httpRequest.onreadystatechange = function () {
			if (httpRequest.readyState === 4) {
				if (httpRequest.status === 200) {
					elem.classList.toggle('online');                         
				} else {
					alert('La connexion au serveur n\'a pas abouti erreur : '+ httpRequest.status);
				}                     
			}       
		}
		httpRequest.open('POST', href, true);
		httpRequest.setRequestHeader('X-Requested-With', 'xmlhttprequest'); 
		httpRequest.responseType = 'json';       
		httpRequest.send(formData);
	}
	if(hasClass(elem, 'payment-status')) 
	{
		event.preventDefault();
		var href = elem.href;       
		var cmd_id = elem.getAttribute('data-id');
		if(hasClass(elem, 'order-paid'))
			var status = 0;
		else
			var status = 1;                 
		var formData = new FormData();
		formData.append('id',cmd_id);
		formData.append('status', status);
		var httpRequest = getHttpRequest();
		httpRequest.onreadystatechange = function () {
			if (httpRequest.readyState === 4) {
				if (httpRequest.status === 200) {
					toogleClass(elem, 'order-paid');
					// On cache la ligne de commande
					var tr = document.getElementById('cmd-'+cmd_id);
					tr.querySelector('.order-detail').click();
					tr.style.display = "none";
					// On simule le click sur voir detail

				} else {
					alert('La connexion au serveur n\'a pas abouti erreur : '+ httpRequest.status);
				}                     
			}       
		}
		httpRequest.open('POST', href, true);
		httpRequest.setRequestHeader('X-Requested-With', 'xmlhttprequest'); 
		httpRequest.responseType = 'json';       
		httpRequest.send(formData);
	}

	if(hasClass(elem, 'see-items')) {
		/**
		 *  Au clic sur le lien on veut voir les items d'une commande
		 *  ces items sont dans un tr qui a pour data-order-id l'id de la commande
		 *  cet id on le recupère via le data-attribut du lien cliqué
		 */
		event.preventDefault();
		var link_order_id = elem.getAttribute('data-order-id');
		var tr_id = 'details-'+ link_order_id;
		var tr_to_show = document.getElementById(tr_id);
		toogleClass(tr_to_show, 'hide');
	} 
	if(hasClass(elem, 'order-detail')){
		/**
		 *  Au clic sur le lien on veut voir les items d'une commande
		 *  ces items sont dans un tr qui a pour data-order-id l'id de la commande
		 *  cet id on le recupère via le data-attribut du lien cliqué
		 *  On veut dans un second temps rendre invisibles les autres lignes de commandes 
		 */
		event.preventDefault();
		var link_order_id = elem.getAttribute('data-order-id');
		var tr_id = 'details-'+ link_order_id;
		var tr_to_show = document.getElementById(tr_id);
	   
		// besoin du tr parent. 
		var tr_p = document.getElementById('cmd-'+link_order_id);
		// on récupère les frere du tr parent 
		var siblings = getSiblings(tr_p);
		if(hasClass(elem, 'is_open')) {
			siblings.forEach(function(sibling){
			if(hasClass(sibling, 'order_header')) {
				removeClass(sibling, 'hide');
			}
			
			});

		} else {
			siblings.forEach(function(sibling){
			addClass(sibling, 'hide');
			});


		}
		
		toogleClass(tr_to_show, 'hide');
		toogleClass(tr_to_show, 'to-print');
		toogleClass(elem, 'is_open');

		//console.log(siblings);
	}
	if(hasClass(elem, 'item-detail')){
		/**
		 *  Au clic sur le lien on veut voir les items d'une commande
		 *  ces items sont dans un tr qui a pour data-order-id l'id de la commande
		 *  cet id on le recupère via le data-attribut du lien cliqué
		 */
		event.preventDefault();
		var link_order_id = elem.getAttribute('data-item-id');
		var tr_id = 'item-details-'+ link_order_id;
		var tr_to_show = document.getElementById(tr_id);
		toogleClass(tr_to_show, 'hide');
	}

	if(hasClass(elem, 'no_click')) {        
		event.stopPropagation();
		event.preventDefault();
	} 
	if (hasClass(elem, 'ajax_panel')) {
		event.stopPropagation();
		event.preventDefault();
		var href = elem.getAttribute('href');
		var show = elem.getAttribute('data-show');
		var hide = elem.getAttribute('data-hide');
		if(elem.hasAttribute('data-fetched')) {
			fetched = elem.getAttribute('data-fetched');            
		}
		if(elem.hasAttribute('data-append')) {
			var appendTo = document.getElementById(elem.getAttribute('data-append'));
		}
		// Si on a déjà fait une requête 
		if(fetched == 'fetched') {
			// on a rajouté une classe show / hide
			if(hasClass(elem, 'show')) {
				removeClass(elem, 'show');
				elem.innerHTML = show;
				appendTo.style.display = "none";

			} else {

				addClass(elem, 'show');
				elem.innerHTML = hide;
				appendTo.style.display = "initial";
			}
		} else {
			var httpRequest = getHttpRequest();
			httpRequest.onreadystatechange = function () {
			if (httpRequest.readyState === 4) {
				if (httpRequest.status === 200) {
					var resp = httpRequest.response;
					appendTo.innerHTML = resp.tpl;
					if(fetched !== 'fetched') {
						elem.setAttribute('data-fetched', 'fetched');
						addClass(elem, 'show');
						elem.innerHTML = hide;
					}                    
				} else {
					alert('La connexion au serveur n\'a pas abouti')
				} 
			}            
		}       
		httpRequest.open('GET', href, true);
		httpRequest.setRequestHeader('X-Requested-With', 'xmlhttprequest'); 
		httpRequest.responseType = 'json';       
		httpRequest.send();
		}       
	} 
	if(hasClass(elem, 'ajax_nav') || hasClass(elem.parentNode, 'ajax_nav')){
		event.stopPropagation();
		event.preventDefault();
		var link = elem.nodeName.toLowerCase() == 'a' ? elem : elem.parentNode;
		var href = link.getAttribute('href');
		history.pushState({callback:'ajaxLoad'}, 'Loading pages with Ajax', href); 
		ajaxLoad(href);
		
	}if(hasClass(elem, 'product_sheet') || hasClass(elem.parentNode, 'product_sheet')){
		//event.stopPropagation();
		event.preventDefault();

		var link = elem.nodeName.toLowerCase() == 'a' ? elem : elem.parentNode;
		var href = link.getAttribute('href');
		history.pushState({callback:'productSheetLoad'}, 'Loading productsheet  with Ajax', href);      
		productSheetLoad(href);
	

	}if(hasClass(elem, 'ajax_cart') || hasClass(elem.parentNode, 'ajax_cart')){
		
		if(articlesInCart.innerHTML.length < 1  || articlesInCart.innerHTML.length === undefined ) {
			alert('Aucun article dans votre panier');

		} else {
		var link = elem.nodeName.toLowerCase() == 'a' ? elem : elem.parentNode;
		var href = link.getAttribute('href');
		history.pushState({callback:'ajaxCart'}, 'Loading cart with Ajax', href); 
		ajaxCart(href);
		}
		event.preventDefault();

	}if(hasClass(elem, 'input_control')) {
		event.preventDefault();
		var parent = hasClass(elem.parentNode, 'cta_c');
		var input = document.getElementById(elem.getAttribute('data-input'));
		var id = elem.getAttribute('data-id');
		var action = elem.getAttribute('data-control');  
		switch(action) {
			case 'decrease':
				input.value = parseInt(input.value, 10)-1;
				if(parent)
					cart.decreaseItem(id);
			break;
			case 'increase': 
				input.value = parseInt(input.value, 10)+1;
				if(parent)
					cart.increaseItem(id);
			break;
			case 'delete':
				var result = confirm('Voulez-vous supprimer cet article de votre panier?'); 
				if(result)
				cart.deleteItem(id);
			break;
		}       
		return;
	}if(hasClass(elem.parentNode, 'input_control')) {
		event.preventDefault();
		var link = elem.parentNode;
		var parent = link.parentNode;
		var input = document.getElementById(link.getAttribute('data-input'));
		var action = link.getAttribute('data-control');        
		var id = link.getAttribute('data-id');
		switch(action) {
			case 'decrease':
				input.value = parseInt(input.value, 10)-1;
				if(parent)
					cart.decreaseItem(id);
			break;
			case 'increase': 
				input.value = parseInt(input.value, 10)+1;
				if(parent)
					cart.increaseItem(id);
			break;
			case 'delete':
				var result = confirm('Voulez-vous supprimer cet article de votre panier?'); 
				if(result)
				cart.deleteItem(id);
			break;
		}           
		return;
	}if(hasClass(elem.parentNode.parentNode, 'tabs') || hasClass(elem.parentNode, 'tabs')) {
		var link = elem.nodeName.toLowerCase() == 'a' ? elem : elem.parentNode;
		display_tab(link,event);
	} if(hasClass(elem, 'reviews') || hasClass(elem.parentNode, 'reviews')) {        
		var link = elem.nodeName.toLowerCase() == 'a' ? elem : elem.parentNode;  
		var hash = link.getAttribute('data-href');
		var a = document.querySelector('a[href="#' + hash + '"]');
		display_tab(a,event);
		var elmnt = document.getElementById(hash);
		scrollToE(elmnt.offsetTop, 900);        
		event.preventDefault();
	} if(elem.classList.contains('show_panel') || elem.parentNode.classList.contains('show_panel')) {
		var btn = elem.classList.contains('show_panel') ? elem : elem.parentNode;
		console.log(btn);
		var panel_id = btn.getAttribute('data-panel');
		var panel = document.getElementById(panel_id);
		panel.classList.toggle('collapsed');

		
	}  
}
window.onpopstate = function(event) {    
	if(event.state !== null) {
		var expr = event.state.callback;
		switch (expr) {
			case 'ajaxLoad':            
			ajaxLoad(document.location.pathname);
			break;
			case 'productsLoad':            
			productsLoad(document.location.pathname);
			break;
			case 'ajaxCart':           
			ajaxCart(document.location.pathname);            
			break;
			case 'productSheetLoad':
			productSheetLoad(document.location.pathname);
			break; 
		}         
	} 
}
function onHover(event) {
	var elem = event.target;   
	//document.getElementById('cart_list').style.position = "static";
	//document.getElementById('cart_list').style.cssText = "position:static; visibility: visible; opacity:1"; 
}

/*
 * 
 * EventListener sur les liens du menu catégories
 * 
 */
productsController.getProductsByCategory = function(e){    
	var elem = e.target;
	// On cible ce sur quoi on click   
	// Si c'est un lien a avec une classe ajax_links 
	if(elem.nodeName.toLowerCase() == 'a' && hasClass(elem, 'ajax_links')){
		e.preventDefault();
		// Idée, voir à stocker le template dans le localstorage avec une date expire        
		var href = elem.getAttribute('href');
		// On fait une requête ajax
		//toogleClass(spinner, 'hide');
		history.pushState({callback:'productsLoad'}, 'Load product page with Ajax', href); 
		productsLoad(href);
	} 
};
function enhanceField(){  
	var fields = container.querySelectorAll('.field-input');
	var l = fields.length;
	 // recherche du parent avec la class .field
	for (var i = 0; i < l; i++) {
		
		(function (field) {
			
			if(hasClass(field.parentNode, 'field')){
				var parent = field.parentNode;
						
			} 
			if(hasClass(field.parentNode.parentNode, 'field')) {
				var parent = field.parentNode.parentNode;
			}
		// si on trouve un placeholder ou que l'input n'est pas vide, le label
		// se met au dessus
		if ( field.getAttribute('placeholder') || field.value !=='' ){
			//ajout de la classe has-label au parent
			parent.className = parent.className + ' has-label';
		}
		// si le champ est un input un textarea .... on applique le focus
		
		
		})(fields[i]);
	}
	if(document.querySelector('textarea') !== null) {
		(function() {
	var d = document,
		c = d.getElementsByClassName('textarea')[0],
		t = d.getElementsByTagName('textarea')[0],
		f = d.createTextNode('');
	
	c.appendChild(f);
	
	function updateSize() {
	   f.nodeValue = t.value + '\n\n';
	}
	
	t.onkeypress = t.onkeyup = t.onchange = updateSize;
	
	updateSize();
  })();
	}
	
}
function onFocusField(event){   
	var field = event.target;
	
	// ne s'applique pas sur les liens
	
	if(field.nodeName == 'INPUT' || field.nodeName == 'TEXTAREA' ) {        
  
	if(hasClass(field.parentNode, 'field')){
		var parent = field.parentNode;                        
	} 
	if(hasClass(field.parentNode.parentNode, 'field')) {
		var parent = field.parentNode.parentNode;
	}
	// si l'elem est de type field-select
	if(hasClass(field,'field-select')){       
		 var list = parent.querySelector('.opts-list');
		 // calcul du nombre de li puis de leur hauteur
		var h = 0;        
		var items = list.childNodes;
		var l = items.length;       
		for (var i = 0; i < l; i++) {
			h += items[i].offsetHeight;
		}
		// Ajout de la hauteur sur le ul
		toogleClass(list, 'opx');
		list.style.height =  h + 'px';
		addClass(parent,'auto');
	}
	// Le parent :  div.field
	// si le parent n'a pas encore la class has-label
	if(!hasClass(parent,'has-label')){
		addClass(parent,'has-label is-focused');
	} else
		addClass(parent,'is-focused');
	}
	var siblings =  getSiblings(parent);
	var l = siblings.length;
	 for (var i = 0; i < l; i++) {        
		(function (field) {            
			if(hasClass(field ,'is-focused')){
				removeClass(field, 'is-focused');
			}        
		})(siblings[i]);
	}

}
function onOptsList(event){
	var el = event.target;
	if(hasClass(el, 'list-value')){
		
		var hidden = document.getElementById(el.getAttribute('data-target'));
		hidden.value = el.getAttribute('tabindex');
		var ul = el.parentNode;
		var parent = el.parentNode.parentNode;
		var wrapper = hidden.parentNode;
		var input = wrapper.querySelector('.field-select');
		input.value = el.getAttribute('data-value');        
		if(!hasClass(parent,'has-label')){
		addClass(parent,'has-label is-focused');
		} else {
			 addClass(parent,'is-focused');
		}
		removeClass(parent,'auto');
		ul.style.height = '0px';       
		toogleClass(ul, 'opx');

	}
}
function onBlurField(event){    
	var field = event.target;
	 if(hasClass(field, 'field-select') ){
		var parent = field.parentNode.parentNode;       
		var ul = parent.querySelector('.opts-list');        
		removeClass(parent,'auto');
		ul.style.height = '0px';
		addClass(ul,'opx'); 
		return;      
	}
	
	if(!hasClass(field.parentNode, 'field') || !hasClass(field.parentNode.parentNode, 'field'))
		return;
	// On ne cible que les champs de formulaire
   if(field.nodeName == 'INPUT' || field.nodeName == 'TEXTAREA' ) {   
	// Le parent :  div.field
	 if(hasClass(field.parentNode, 'field')){
		var parent = field.parentNode;                        
	} 
	if(hasClass(field.parentNode.parentNode, 'field')) {
		var parent = field.parentNode.parentNode;
	}   
	if ( field.getAttribute('placeholder') || field.value !== '' || field.type === 'date'){
		   toogleClass(parent, 'is-focused');
	}else {
		toogleClass(parent, 'has-label');
		toogleClass(parent, 'is-focused');
	}
	 
	}
}

function setCart(stored){
	// On transmet à l'application (métier : php ici) l'éventuel panier dans localstorage
	var formData = new FormData();
	formData.append('storage',stored);
	var url = '/panier/init';
		var httpRequest = getHttpRequest();
		httpRequest.onreadystatechange = function () {
			if (httpRequest.readyState === 4) {
				if (httpRequest.status === 200) {   
										   
				} else {
					alert('La connexion au serveur n\'a pas abouti erreur : '+ httpRequest.status);
				}                     
			}       
		}
	httpRequest.open('POST', url, true);
	httpRequest.setRequestHeader('X-Requested-With', 'xmlhttprequest'); 
   // httpRequest.responseType = 'json';       
	httpRequest.send(formData);
	
}
function purchaseOrder(event) {
	event.preventDefault();
	var elem = event.target;
	var name = elem.name;    
}

function toSubmit(event) {   
	var elem = event.target;   
	
	
	if(hasClass(elem, 'no_submit')) {
		event.preventDefault();
		return;       
	} if(hasClass(elem, 'add_to_cart')) {        
		var href =  elem.action;
		var method = elem.method;
		var formData = new FormData(elem);
		var httpRequest = getHttpRequest();
		httpRequest.onreadystatechange = function () {
			if (httpRequest.readyState === 4) {
				if (httpRequest.status === 200) {                   
						cart.updateStorage('panier', httpRequest.response );
						cart.updateBasket(httpRequest.response.q_total, httpRequest.response.c_total);
						alert('Article ajouté dans votre panier');                        
				} else {
					alert('La connexion au serveur n\'a pas abouti erreur : '+ httpRequest.status);
				}                     
			}       
		}
	httpRequest.open(method, href, true);
	httpRequest.setRequestHeader('X-Requested-With', 'xmlhttprequest'); 
	httpRequest.responseType = 'json';       
	httpRequest.send(formData);
	event.preventDefault();
	}
	if(hasClass(elem, 'add_price')) {
		var href =  elem.action;
		var method = elem.method;
		var formData = new FormData(elem);        
		var httpRequest = getHttpRequest();
		httpRequest.onreadystatechange = function () {
			if (httpRequest.readyState === 4) {
				if (httpRequest.status === 200) {                        
						alert('Prix enregistré !');                        
				} else {
					alert('La connexion au serveur n\'a pas abouti erreur : '+ httpRequest.status);
				}                     
			}       
		}
	httpRequest.open(method, href, true);
	httpRequest.setRequestHeader('X-Requested-With', 'xmlhttprequest'); 
	httpRequest.responseType = 'json';       
	httpRequest.send(formData);
	event.preventDefault();       
	}
	if(hasClass(elem, 'send_to_prod')) { 

		console.log('sended to prod');
		// envoi de la ligne de commande via ajax
		var href =  elem.action;
		var method = elem.method;
		var formData = new FormData(elem);
		var httpRequest = getHttpRequest();
		httpRequest.onreadystatechange = function () {
			if (httpRequest.readyState === 4) {
				if (httpRequest.status === 200) {
					var resp = httpRequest.response;                     
					if(resp.msg) {
						alert(resp.msg);
						var tr_id = 'send_to_prod_line_' + resp.id_item;
						var tr = document.getElementById(tr_id);
						addClass(tr, 'hide');
					}    
											   
				} else {
					alert('La connexion au serveur n\'a pas abouti erreur : '+ httpRequest.status);
				}                     
			}       
		}
		httpRequest.open(method, href, true);
		httpRequest.setRequestHeader('X-Requested-With', 'xmlhttprequest'); 
		httpRequest.responseType = 'json';       
		httpRequest.send(formData);
		event.preventDefault();
	}


	if(hasClass(elem, 'pull-cmd')) {
		console.log('pull order from e-commerce');
		// envoi de la ligne de commande via ajax
		/*var href =  elem.action;
		var method = elem.method;
		var formData = new FormData(elem);
		var httpRequest = getHttpRequest();
		httpRequest.onreadystatechange = function () {
			if (httpRequest.readyState === 4) {
				if (httpRequest.status === 200) {
					var resp = httpRequest.response;                     
					if(resp.msg) {
						alert(resp.msg);
						var tr_id = 'send_to_prod_line_' + resp.id_item;
						var tr = document.getElementById(tr_id);
						addClass(tr, 'hide');
					}    
											   
				} else {
					alert('La connexion au serveur n\'a pas abouti erreur : '+ httpRequest.status);
				}                     
			}       
		}
		httpRequest.open(method, href, true);
		httpRequest.setRequestHeader('X-Requested-With', 'xmlhttprequest'); 
		httpRequest.responseType = 'json';       
		httpRequest.send(formData);*/
		event.preventDefault();


	}
}

function toUp(pos) {
	var upTo = document.getElementById("toUp");
  if(pos < 900 && !hasClass(upTo, 'up_show')) {
	removeClass(upTo, 'up_hide')
	addClass(upTo, 'up_show');
	
  }
  if(pos > 900 && !hasClass(upTo, 'up_hide')) {
	if(hasClass(upTo, 'up_show'))
		removeClass(upTo, 'up_show')
	addClass(upTo, 'up_hide');
	
  }
}

/**
 * INPUT FILE 
 */

// ajout de la classe JS à HTML
//document.querySelector("html").classList.add('js');
 
// initialisation des variables
var fileInput  = document.querySelector( ".input-file" ),  
    button     = document.querySelector( ".input-file-trigger" ),
    the_return = document.querySelector(".file-return");
 
// action lorsque la "barre d'espace" ou "Entrée" est pressée
if(fileInput !== null) {


button.addEventListener( "keydown", function( event ) {
    if ( event.keyCode == 13 || event.keyCode == 32 ) {
        fileInput.focus();
    }
});
 
// action lorsque le label est cliqué
button.addEventListener( "click", function( event ) {
   fileInput.focus();
   return false;
});
 
// affiche un retour visuel dès que input:file change
fileInput.addEventListener( "change", function( event ) {  
	console.log(this.value);
    the_return.innerHTML = this.value;  
});
}
/** 
	Déclaration des écouteurs 
	! focus marche aussi sur les liens !! 
**/
// Pas de submit pour les formulaire avec la classe no_submit
document.addEventListener('submit', toSubmit, false);
// Liens désactivés avec la classe no_click
document.addEventListener('click',onClickLink, false);
document.addEventListener('change',onChange, false);
if (document.getElementById('front_cart')) {
	var f_cart = document.getElementById('front_cart'); 
	f_cart.addEventListener('mouseover',onHover, false);
}
container.addEventListener('focusout', onBlurField, false);
container.addEventListener('focus', onFocusField, true);
//container.addEventListener('click', getAction, false);
container.addEventListener('click', productsController.getProductsByCategory, false);
container.addEventListener('click', onOptsList, false);
// lien vers panier

document.addEventListener("DOMContentLoaded", enhanceField);
document.addEventListener("DOMContentLoaded", function(event) {
	console.log("DOM entièrement chargé et analysé");
	// si inextistant renvoie null
	var storage_f = localStorage.getItem('panier');
	var storage_c = JSON.parse(storage_f);
	
	// penser à instancier le nombre d'articles si on a un storage
	
	if(storage_c ) {
		cart = new Panier(storage_c);
		var storage_f = localStorage.getItem('panier');

		setCart(storage_f);
	} else {
		cart = new Panier(null);
	}
	
});

// Afficher la div qui permet un retour en haut du documemnt
window.addEventListener('scroll',function(e){   
  scrollPos =container.getBoundingClientRect().bottom;  
  if (!ticking) {
	window.requestAnimationFrame(function() {
	if(document.getElementById('toUp')) {
		toUp(scrollPos);
	  ticking = false;
	}
	  
	});
  }
  ticking = true;
}, true);

// Par Oznog, trucsweb.com
// http://trucsweb.com/tutoriels/javascript/defilement_doux
/*document.addEventListener('DOMContentLoaded', function() {
  var aLiens = document.querySelectorAll('a[href*="#"]');
  for(var i=0, len = aLiens.length; i<len; i++) {
	aLiens[i].onclick = function () {
	  if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
		var target = this.getAttribute("href").slice(1);
		//
		if (target.length) {

		  scrollTo(document.getElementById(target).offsetTop, 800);
		  return false;
		}
	  }
	};
  }
},true);*/
//Exemple de : Forestrf
// http://jsfiddle.net/forestrf/tPQSv/2/
function scrollTo(element, duration) {
  var e = document.documentElement;
  if(e.scrollTop===0){
	var t = e.scrollTop;
	++e.scrollTop;
	e = t+1===e.scrollTop--?e:document.body;
  }
  scrollToC(e, e.scrollTop, element, duration);
}

function scrollToC(element, from, to, duration) {
  if (duration < 0) return;
  if(typeof from === "object")from=from.offsetTop;
  if(typeof to === "object")to=to.offsetTop;
  scrollToX(element, from, to, 0, 1/duration, 20, easeOutCuaic);
}

function scrollToX(element, x1, x2, t, v, step, operacion) {
  if (t < 0 || t > 1 || v <= 0) return;
  element.scrollTop = x1 - (x1-x2)*operacion(t);
  t += v * step;
  setTimeout(function() {
	scrollToX(element, x1, x2, t, v, step, operacion);
  }, step);
}

function easeOutCuaic(t){
  t--;
  return t*t*t+1;
}