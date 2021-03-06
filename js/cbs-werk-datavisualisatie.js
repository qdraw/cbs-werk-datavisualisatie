
// L.mapbox.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ';
// Replace 'mapbox.streets' with your map id.
// http://a{s}.acetate.geoiq.com/tiles/acetate-base/{z}/{x}/{y}.png
var mapboxTiles = L.tileLayer('' , {
	minZoom: 2,
	maxZoom: 19,
	subdomains: '0123',
	opacity: 0.3,
	attribution: '<a class="sourcelink" href="sources.html" target="_blank">Bronvermelding</a>'
});


var map = L.map('map',{ zoomControl:false })
	.addLayer(mapboxTiles)
	.setView([55, 0], 4);

var popup = new L.Popup({ autoPan: false });

// Be nice and credit our data source, Census Reporter.
// map.attributionControl.addAttribution('Data from ' +
//   '<a href="http://censusreporter.org/data/map/?table=B06011&geo_ids=040%7C01000US#">' +
//   'Census Reporter</a>');

// By the way, thanks: https://www.mapbox.com/mapbox.js/example/v1.0.0/choropleth-joined-data-multiple-variables/ for letting me copy paste this example



// Choropleth colors from http://colorbrewer2.org/
// You can choose your own range (or different number of colors)
// and the code will compensate.
// Didn't use anyway ;)


var hues = [
	'#64738C', // green green
	'#889EBB',
	'#B6D2DE',
	'#D4EAF2',
	'#EBC2D0', // light rood
	'#D994AB',
	'#E679A3',
	'#C0537A',

	'#e4e8e7', // selected color
	'#CCCCCC' // NaN
	];


// Positive Hues for filter feature
var goodHues = [
	'#64738C', // green green
	'#889EBB',
	'#B6D2DE',
	'#D4EAF2'] // light green

// Negative Hues for filter feature
var badHues = [
	'#EBC2D0', // light rood
	'#D994AB',
	'#E679A3',
	'#C0537A'] // red red



// NaN escaper feature in data set, if you use NaN the app will crash
var NaNescaper  = -9;


// The names of variables that we'll show in the UI for
// styling. These need to match exactly.

// Those names are used in the ./data/data.json

var variables = [
	'gini',
	'freedom',
	'gemiddeld-ink',
	'jobs-avail',
	'werkloosheid',
	'discrimi',
	'corruption'
	];

// UI-names for variables, use the same order
var variablesUI = [
	'Gelijkheid in inkomen en welvaart',
	'Vrijheid en gelijke rechten',
	'Een hoog inkomen',
	'Veel werkgelegenheid',
	'Een lage werkloosheid',
	'Geen discriminatie',
	"Een eerlijke overheid"
	];

// Using High to low or reverse
var variablesIsHighToLow = {
	"gini": false,
	'freedom': false,
	'gemiddeld-ink': true,
	'jobs-avail': true,
	'werkloosheid': false,
	'discrimi': true,
	'corruption': true
	};

// The scale of the variable
var variablesScale = {
	"gini": "De rijke inwoners hebben [VALUE]x meer koopkracht dan gemiddelde inwoners",
	'freedom': "[VALUE]/100 onderdrukking vrijheid en inspraak",
	'gemiddeld-ink': "&euro;[VALUE] gemiddeld aan inkomen",
	'jobs-avail': "[VALUE]/4 kans op een baan",
	'werkloosheid': "[VALUE]% van de inwoners zijn werkloos",
	'discrimi': "[VALUE]/100 anti-discriminatie",
	'corruption': "[VALUE]/100 eerlijkheid van de overheid"
	};

var variablesExplain = {
	"gini": "Hoeveel mate verschil ligt er tussen de inkomsten van de burgers binnen een land? Hoeveel verdient de groep met het minste inkomen in vergelijking tot de groep met het hoogste inkomen? Kortom: Hoe eerlijk is het totale inkomen van een land verdeeld over zijn volk? ",
	'freedom': "Vrijheid is niet overal een recht. Heb jij als burger inspraak in belangrijkste beslissingen welke door een land worden gemaakt? Of ligt al deze macht bij een select groepje? Ook het recht op een eigen mening en het uitten van je normen en waarden zijn een belangrijk aspect wat een land kan bieden.",
	'gemiddeld-ink': "Is geld voor jou het belangrijkste wat een land kan bieden? Speciaal voor de goudzoekers onder ons hebben wij hebben vastgesteld hoeveel geld je gemiddeld verdient binnen elk land. Let wel op! Dit wil natuurlijk niet zeggen dat je ook daadwerkelijk direct deze hoeveelheid gaat verdienen.",
	'jobs-avail': "Het zou jammer zijn om na zo'n lange reis zonder werk te zitten. Welk land biedt de grootste kans op werk? Waar moeten de handen uit de mouwen worden gestoken en is direct werk te vinden? Wij hebben het uitgezocht!",
	'werkloosheid': "Welke land heeft het minst te kampen met werkloosheid? Waar is de kans het grootst dat jij tijdens de crisis je baan kunt behouden? Spoilers: Vermeid Griekenland, die doen het niet zo goed op dit moment. Maar de rest van West Europa blijft goed stand houden!",
	'discrimi': "Doordat we steeds meer culturen, normen en waardes hebben op de wereld, botsen deze nogal eens met elkaar. Welk land staat juist open voor andere culturen en is openminded? Hier zie je een overzicht van de landen waar je als immigrant het snelst geaccepteerd zal worden door de burgers.",
	'corruption': "Hoe eerlijk is een land? Als je het belangrijk vind dat de regels worden nageleefd en mensen hun afspraken nakomen, dan ben je zeker tegen corruptie. Welke landen knijpen een oogje dicht wanneer jij een briefje van €100 in het borstzakje laat glippen? In welke land kom je weg met moord als je een hoog geplaatst persoon bent?"
	};








// #sidebar #menu
for (var i = 0; i < variables.length; i++) {
	document.querySelector("#sidebar #menu").innerHTML += "<li onclick='setVariable(\"" + variables[i]  + "\")' class='" + variables[i]+ "' style='background-image:url(images/" + variables[i] + ".svg)'> </li>";
}

// Display all options in 1 div #metro .content
for (var i = 0; i < variables.length; i++) {
	document.querySelector("#metro .content").innerHTML += "<li onclick='setVariable(\"" + variables[i]  + "\")' class='" + variables[i]+ "'> <img src='images/"  + variables[i] + ".svg' /><span>" + variablesUI[i] +"</span> </li>";
}



// Collect the range of each variable over the full set, so
// we know what to color the brightest or darkest.
var ranges = {};

var $select = $('<select></select>')
	.appendTo($('#variables'))
	.on('change', function() {
		setVariable($(this).val());
	});
for (var i = 0; i < variables.length; i++) {
	ranges[variables[i]] = { min: Infinity, max: -Infinity };
	// Simultaneously, build the UI for selecting different
	// ranges
	$('<option></option>')
		.text(variables[i])
		.attr('value', variables[i])
		.appendTo($select);
}

// Create a layer of state features, and when it's done
// loading, run loadData
var euLayer = L.mapbox.featureLayer()
	.loadURL('data/europe.geo.json')
	.addTo(map)
	.on('ready', loadData);

// Grab the spreadsheet of data as JSON. If you have CSV
// data, you should convert it to JSON with
// http://shancarter.github.io/mr-data-converter/
function loadData() {
	$.getJSON('data/data.json')
		.done(function(data) {
			joinData(data, euLayer);
		});
}

function joinData(data, layer) {
	// First, get the Europian state GeoJSON data for reference.

	var euGeoJSON = euLayer.getGeoJSON(),
		byState = {};

	// Rearrange it so that instead of being a big array,
	// it's an object that is indexed by the state name,
	// that we'll use to join on.
	for (var i = 0; i < euGeoJSON.features.length; i++) {
		
		byState[euGeoJSON.features[i].properties.name] =
			euGeoJSON.features[i];
	}


	for (i = 0; i < data.length; i++) {

	 // Match the GeoJSON data (byState) with the tabular data
		// (data), replacing the GeoJSON feature properties
		// with the full data.
		try {
			byState[data[i].name].properties = data[i];
		}
		catch(e){}

		for (var j = 0; j < variables.length; j++) {
			// Simultaneously build the table of min and max
			// values for each attribute.

			var n = variables[j];

			// The minimum
			ranges[n].min = Math.min(data[i][n], ranges[n].min);
			ranges[n].max = Math.max(data[i][n], ranges[n].max);


			// Min / Max Name for example 'NL'
			if (data[i][n] != NaNescaper) {
				if (data[i][n] === ranges[n].min) {
					ranges[n].minname = data[i].name;
			   };
			};
			if (data[i][n] === ranges[n].max) {
				ranges[n].maxname = data[i].name;
			};


		}

		// using in reverse or first gear?
		if (variablesIsHighToLow[name]) {
			// max is best
			bestCountry (variables[0])

		}
		else {
			// min is best
			bestCountry (variables[variables.length-1])

		}


	}


	// Create a new GeoJSON array of features and set it
	// as the new usLayer content.
	var newFeatures = [];
	for (i in byState) {
		newFeatures.push(byState[i]);
	}
	euLayer.setGeoJSON(newFeatures);




 

	// Kick off by filtering on an attribute.
	setVariable(variables[0]);
}




function legenda (name) {

	document.querySelector("#sidebar #legenda").innerHTML = "   <h2> Legenda </h2>   <span style='float:left'>Beter</span>        <span style='float:left; text-align:right'>Slechter</span>";
	for (var i = 0; i < hues.length-2; i++) {
		// console.log(hues[i])
		$( "#sidebar #legenda" ).append( "  <div style='background-color:" + hues[i] +"'></div>" );
	};

	// if (variablesIsHighToLow[name]) {
	// }
	// else {
	// }
}


// Excuse the short function name: this is not setting a JavaScript
// variable, but rather the variable by which the map is colored.
// The input is a string 'name', which specifies which column
// of the imported JSON file is used to color the map.
function setVariable(name) {
	var scale = ranges[name];
	euLayer.eachLayer(function(layer) {
		// Decide the color for each state by finding its
		// place between min & max, and choosing a particular
		// color as index.
		// This is like the arduino map feature
		var division = Math.floor(
			(hues.length - 3) *
			((layer.feature.properties[name] - scale.min) /
			(scale.max - scale.min)));


		if (variablesIsHighToLow[name]) {

			// higher is beter

			var divisionNeg = division * -1;
			division = (hues.length - 3) + divisionNeg;

			if (layer.feature.properties[name] === scale.max) {
				var division = hues.length - 2;
			};
		}
		else {
			// lower is beter

			if (layer.feature.properties[name] === scale.min) {
					var division = hues.length - 2;
			};            

		}

		// Give the NaN a grey colour
		if (layer.feature.properties[name] === NaNescaper) {
			var division = hues.length - 1;
		};


		// See full path options at
		// http://leafletjs.com/reference.html#path
		layer.setStyle({
			fillColor: hues[division],
			fillOpacity: 0.8,
			color: '#666',
			weight: 0.5
		});

		// YEAH, eventListeners
		layer.addEventListener("mouseover", function(e){ var those = this; mousemove(e,those,name) }, false);
		layer.addEventListener("mouseout", function(e){ var those = this; mouseout(e,those) }, false);
		layer.addEventListener("click", function(e){ var those = this; filterCountry(e,those,name) }, false);

	});
	
	hideMetro()
	legenda (name)
	bestCountry (name)
	setActiveMenu (name)
	displayCurrentType (name)
	hidePreloader()
}


function hidePreloader () {
	document.querySelector(".preloader").style.zIndex = "-1";
}

function bestCountry (name) {
	// Show in the div the best country


	if (variablesIsHighToLow[name]) {
		// max is best
		// document.querySelector("#sidebar #content").innerHTML = "<h2>" +  + "</h2>" + "<div class='image' style='background-image:url(images/" + ranges[name].maxname + ".jpg)'></div> " +  "ranges == " +  + "De Gini-coëfficiënt is berekend als een ratio van gebieden in de Lorenz-curve-grafiek. De Lorenz-curve tekent de proportie van het totale inkomen van een populatie (y-as) ten opzichte van de cumulatieve inkomsten van de onderste x% van de bevolking.";

		var legendascoreExport = filterSearch ("best",name);
		legendascoreExport = filterReplace (legendascoreExport,ranges[name].max,countrynames[ranges[name].maxname])

		document.querySelector("#sidebar #content").innerHTML = "<h2>" + countrynames[ranges[name].maxname] + "</h2>" + "<div class='image' style='background-image:url(images/" + ranges[name].maxname + ".jpg)'></div> " +  legendascoreExport;


		euLayer.eachLayer(function(layer) {
			if (layer.feature.properties.name === ranges[name].maxname) {
				// console.log(ranges[name].maxname)

				layer.setStyle({
					weight: 4,
					color: '#666'
				});
			
			};
		});


	}
	else {
		// min is best
		var legendascoreExport = filterSearch ("best",name);
		legendascoreExport = filterReplace (legendascoreExport,ranges[name].min,countrynames[ranges[name].minname])

		document.querySelector("#sidebar #content").innerHTML = "<h2>" + countrynames[ranges[name].minname] + "</h2>" + "<div class='image' style='background-image:url(images/" + ranges[name].minname + ".jpg)'></div> " +  legendascoreExport;

		euLayer.eachLayer(function(layer) {
			if (layer.feature.properties.name === ranges[name].minname) {

				layer.setStyle({
					weight: 4,
					color: '#666'
				});
				// console.log(ranges[name].minname)
			};
		});
	}

}


var isMetroOn = true;

function hideMetro () {
	if (isMetroOn == true) {
		isMetroOn = false;

		$( "#sidebar #content").css("display", "none" );
		$( "#sidebar #header").css("display", "none" );


		$( "#sidebar").css("backgroundColor", "rgba(0,0,0,0)" );


	}
	else if (isMetroOn == false) {
		$( "#metro" ).fadeOut( 1000, function() {  
			$( "#metro").css("display", "none" );
		});

		$( "#sidebar #content" ).fadeIn( 1000, function() {  
		});

		$( "#sidebar #header" ).fadeIn( 1000, function() {  
		});		

		$( "#sidebar").css("backgroundColor", "white" );


	}
}

setTimeout(function () {
	introMode();
},500)


var isIntroOn = true;
function introMode() {

	if (isIntroOn) {
		$( "#variablesButton").css("display", "none" );
		$("#intro .content").append("<a class='button' onclick='isIntroOn = false; introMode()'>Ga verder</a>")
	}
	else {
		$( "#variablesButton").css("display", "block" );
		

		$( "#intro .head" ).fadeOut( 1000, function() {  
			$( "#intro .head").css("display", "none" );
		});

		$( "#intro .content" ).fadeOut( 1000, function() {  
			$( "#intro .content").css("display", "none" );
		});


		$( "#intro" ).fadeOut( 1500, function() {  
			$( "#intro").css("display", "none" );
			$( "#intro #bg-video" ).remove();
		});
		
	}

}




// Display the current type (for example gino)
function displayCurrentType (name) {

	var name_pos = variables.indexOf(name); 
	document.querySelector("#header").innerHTML = "<h1>" + variablesUI[name_pos] + "</h1>" + "<br />" + variablesExplain[name];

}



// In the #sidebar #menu interface
function setActiveMenu (name) {

	$('#sidebar #menu').children('li').each(function () {
		$( this ).css( "backgroundColor", "white" );
		// alert(this.value); // "this" is the current element in the loop
	});

	$( "#sidebar #menu " + " ." + name).css("backgroundColor", "#64738C" ); //blue
}



// Caled by the eventlistener mouseout
function resetHighlight(e,those) {

		var layer = e.target;

		layer.setStyle({
			weight: 0.5,
			color: '#666',
			dashArray: '',
			fillOpacity: 0.7
		});

}


function filterSearch (searchfor,name) {
	
	var legendascoreExport;

	Object.keys(legendascore).forEach(function(key) {
		if (legendascore[key]["legendascore"] === searchfor) {
			legendascoreExport = legendascore[key][name];

		};
	});
	return legendascoreExport;    
}

String.prototype.replaceAll = function (find, replace) {
	var str = this;
	return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

function filterReplace (legendascoreExport,value,fullcountryname) {

	var legendascoreExport = legendascoreExport.replaceAll('[LAND]', fullcountryname);
	var legendascoreExport = legendascoreExport.replaceAll('[VALUE]', value);

	return legendascoreExport;
}

function filterCountryInfo (e,those,name) {

	var value = e.target.feature.properties[name];
	value = Math.round(value);

	if (e.target.feature.properties[name] == NaNescaper) {
		value = "geen data"
	};

	// document.querySelector("#sidebar #content").innerHTML = e.target.feature.properties["nl_name"] + " " + value ;

	var countryname = e.target.feature.properties["name"];



	var legendascoreExport;

	// And again the higer is better            
	if (variablesIsHighToLow[name]) {
		if (ranges[name].max/2 < e.target.feature.properties[name]) {
			var legendascoreExport = filterSearch ("good",name);
		}
		else if (ranges[name].max/2 > e.target.feature.properties[name]) {
			var legendascoreExport = filterSearch ("bad",name);
		}
		else {
			var legendascoreExport = filterSearch ("eq",name);
		}

		if (ranges[name].maxname === countryname) {
			var legendascoreExport = filterSearch ("best",name);
		};

		if (ranges[name].minname === countryname) {
			var legendascoreExport = filterSearch ("worst",name);
		};
	
	}

	// Lower is better            
	else {
		if (ranges[name].max/2 > e.target.feature.properties[name]) {
			var legendascoreExport = filterSearch ("good",name);
		}
		else if (ranges[name].max/2 < e.target.feature.properties[name]) {
			var legendascoreExport = filterSearch ("bad",name);
		}
		else {
			var legendascoreExport = filterSearch ("eq",name);
		}

		if (ranges[name].maxname === countryname) {
			var legendascoreExport = filterSearch ("worst",name);
		};

		if (ranges[name].minname === countryname) {
			var legendascoreExport = filterSearch ("best",name);
		};

	}    

	legendascoreExport = filterReplace (legendascoreExport,value,countrynames[countryname])


	document.querySelector("#sidebar #content").innerHTML = "<h2>" + countrynames[countryname] + "</h2>" + "<div class='image' style='background-image:url(images/" + countryname + ".jpg)'></div> " +  legendascoreExport

}



function filterCountry(e,those,name) {

	filterCountryInfo(e,those,name)


	var thisCountryScore = e.target.feature.properties[name];

	// Create an array of all scores of this type
	var scoreList = [];
	euLayer.eachLayer(function(layer) {
		scoreList.push(layer.feature.properties[name]);
	});


	// Call for this scale in ranges
	var scale = ranges[name];

	// Yeah here we go again http://eelslap.com/
	function map(value, low1, high1, low2, high2) {
		return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
	}

	// Loop though all layers in the leaflet map
	// filter for countries who are better, the same or worse
	euLayer.eachLayer(function(layer) {

		var borderwidth = 0.5;

		if (layer.feature.properties[name] < thisCountryScore) {
			// Countries who perform better! :D :D :D

			// And again the higer is better            
			if (variablesIsHighToLow[name]) {
				// console.log("High")
				var outMin = badHues.length;
				var outMax = 0;

				var division = Math.floor(
					map( layer.feature.properties[name],  scale.max+1,  scale.min-1,  outMax, outMin  )
					);

				var color = badHues[division]

		   }

			// Lower is better            
			else {
				var outMin = 0;
				var outMax = goodHues.length;

				var division = Math.floor(
					map( layer.feature.properties[name],  scale.max+1,  scale.min-1,  outMax, outMin  )
					);

				var color = goodHues[division]
			}


		}
		// Countries have the same value
		else if  (layer.feature.properties[name] === thisCountryScore) {
			// Some green
			var color = "#D4EAF2";

			// The selected country
			if (layer.feature.properties["name"] === e.target.feature.properties["name"]) {
				 var color = "#e4e8e7"; // blue
				 borderwidth = 5;
			};
		}
		// Countries who are worse :( :( :( :( :(
		else {

			// And again the higer is better            
			
			if (variablesIsHighToLow[name]) {
				// console.log("High")

				var outMin = goodHues.length;
				var outMax = 0

				var division = Math.floor(
					map( layer.feature.properties[name],  scale.max+1,  scale.min-1,  outMax, outMin  )
					);

				var color = goodHues[division]
			}
			// Lower is better            
			else {
				var outMin = goodHues.length;
				var outMax = 0;

				var division = Math.floor(
					map( layer.feature.properties[name],  scale.min-1,  scale.max+1,  outMin, outMax  )
					);

				var color = badHues[division]

			}
				


		}

		// And finaly arange all the colours from all countries
		layer.setStyle({
			fillColor: color,
			fillOpacity: 0.8,
			color: '#666',
			weight: borderwidth
		});

	});
}



// The popup feature

var closeTooltip;

function mousemove(e,those,name) {
	// https://www.mapbox.com/mapbox.js/example/v1.0.0/choropleth/

	var layer = e.target;



	// layer.setStyle({
	//     weight: 4,
	//     color: '#FF6000',
	//     dashArray: '',
	//     fillOpacity: 0.7
	// });




	var newpos = {
		lat: (e.latlng.lat+1),        
		lng: (e.latlng.lng),        
	}

	popup.setLatLng(newpos);


	var content = e.target.feature.properties[name];
	content = Math.round(content);


	if (e.target.feature.properties[name] == NaNescaper) {
		content = "geen data"
	};

	content = content.toLocaleString()
	// https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript

	 content = "<b>" +countrynames[e.target.feature.properties["name"]] + "</b> <br />" +  filterReplace (variablesScale[name],content,countrynames[e.target.feature.properties["name"]])



	// filterReplace (legendascoreExport,value,fullcountryname)







	// var content = countrynames[e.target.feature.properties["name"]] + "<br />";

	// for (var i = 0; i < variables.length; i++) {
	//     // console.log(variables[i]);

	//     var value = e.target.feature.properties[variables[i]];
	//     value = Math.floor(value);
	//     content += value + variablesScale[variables[i]] + "<br />";

	// };

	// timer = window.setTimeout(function() {
	// 	popup.setContent(content);

	// 	if (!popup._map) popup.openOn(map);

	// }, 200);


	
	closeTooltip = window.setTimeout(function() {
		popup.setContent(content);
		if (!popup._map) popup.openOn(map);
	}, 100);

}


function mouseout(e) {


	closeTooltip = window.setTimeout(function() {
		map.closePopup();
	}, 100);


	var layer = e.target;

	layer.setStyle({
		fillOpacity: 0.8,
		color: '#666'
	});
}



toggleHamburgerButton ();
function toggleHamburgerButton () {
	document.querySelector("#sidebar .hamburger").addEventListener("click", function(e){ var those = this; toggleHamburger(e,those) }, false);
}
var isHamburgerMenuOn = true;
function toggleHamburger (e,those) {
	if (isHamburgerMenuOn) {
		$("#sidebar").css("backgroundColor", "rgba(0,0,0,0)")
		$("#sidebar #menu").css("display", "none")
		$("#sidebar .container").css("display", "none")
		$("#sidebar #legenda").css("display", "none")

		$( "#sidebar").css("height", "50px" );

		isHamburgerMenuOn = false;
	}
	else {
		$("#sidebar").css("backgroundColor", "white")
		$("#sidebar #menu").css("display", "block")
		$("#sidebar .container").css("display", "block")
		$("#sidebar #legenda").css("display", "block")
		$( "#sidebar").css("height", "100vh" );

		isHamburgerMenuOn = true;
	}

}


function pageFail (e) {

	var para = document.createElement("div");
	para.id = "warning"
	var node = document.createTextNode(" ");
	para.appendChild(node);

	document.body.appendChild(para);
  	
  	document.getElementById("warning").innerHTML = '<h2 style="color:black;">Sorry, maar met jouw versie van Internet Explorer kan mijn site niet samenwerken. Het handigste is dat je Firefox of Chrome installeerd. </h2><p style="color:black;"> Mocht u vragen hebben neem dan contact op met Dion van Velde via: ' + '&#100;'  + '&#105;' + '&#111;' + '&#110;' + '&#64;' + '&#113;' + '&#100;' + '&#114;' + '&#97;' + '&#119;' + '&#46;' + '&#110;' + '&#108;' + '</p> <a href="https://www.google.com/chrome/browser/desktop/index.html" class="button" style="color:white">Download Google Chrome</a> <a class="button" href="https://www.mozilla.org/nl/firefox/new/" style="color:white">Download Firefox</a>'   

}//e/pageFail


// for IE10 and lower == unsuported
if(document.all && document.compatMode) {
	pageFail ("noie")
}
