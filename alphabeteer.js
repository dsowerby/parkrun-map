var mymap;
var $geo;
var position;
var options = {};
var athleteData = [];
var iconColours = ['red', 'orange-dark', 'orange', 'yellow', 'blue-dark', 'cyan', 'purple', 'violet', 'pink', 'green-dark', 'green', 'green-light', 'black', 'white']
var alphabetEvents;

Array.prototype.getUnique = function() {
	var o = {}, a = []
	for (var i = 0; i < this.length; i++) o[this[i]] = 1
	for (var e in o) a.push(e)
	return a
};

navigator.geolocation.getCurrentPosition(function(data) {
	position = data;
	initAndLoad();
}, function(error) {
	initAndLoad();
});

$(document).ready(function() {
	initAjaxPrefilter();
	initMap();
	initOptions();
	centreMap();
	initAndLoad();
});

// bypass CORS or CORB
function initAjaxPrefilter() {
	jQuery.ajaxPrefilter(function(options) {
		if (options.crossDomain && jQuery.support.cors) {
			options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
		}
	});
}

function initOptions() {
	options = JSON.parse(Cookies.get('options') || '{}');
}

function initMap() {
	mymap = L.map('mapid', {
		zoomControl: false,
		maxBounds: new L.LatLngBounds( new L.LatLng(-90, -180), new L.LatLng(90, 180)),
		minZoom: 2,
	});
	L.control.zoom({
		position:'topright'
	}).addTo(mymap);
	markerGroup = L.featureGroup().addTo(mymap);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(mymap);
}

function centreMap() {
	if (position) {
		// centre the map around the user's location
		mymap.fitBounds(
			[
				[position.coords.latitude - 0.01, position.coords.longitude - 0.01],
				[position.coords.latitude + 0.01, position.coords.longitude + 0.01]
			]
		)
	} else {
		// centre on the complete bounds of all UK based parkruns
		mymap.fitBounds(
			[
				[49.095026, -7.742293],
				[60.258081000000004, 1.847338]
			]
		);
	}
}

function addMarker(index, latitude, longitude, name, iconColour, $event) {
	var eventNamePrefix = name.substring(0, 1);
	var markerIcon = L.ExtraMarkers.icon({
		markerColor: iconColour,
		icon: 'fa-number',
		number: eventNamePrefix
	});
	var marker = L.marker([latitude, longitude], { icon: markerIcon});
	var markerContent;
	if (typeof($event) !== 'undefined') {
		var elementId = $event.attr('n');
		var region = $event.attr('r');
		if (region != '') {
			var elementRegionUrl = $geo.find('r[id=' + region + ']').closest("r[u!='']").attr('u');
		}
		markerContent = '<strong><a target="_blank" href="' + elementRegionUrl + '/' + elementId + '/">'+ name + '</a></strong><br /><a target="_blank" href="' + elementRegionUrl + '/' + elementId + '/course/">Course page</a><br /><a target="_blank" href="https://www.google.com/maps/dir/?api=1&destination='+latitude+',' + longitude + '">Directions</a>';
	} else if (typeof(name) !== 'undefined') {
		markerContent = name;
	}
	if (options.vegan) {
		if (typeof(markerContent) !== 'undefined') {
			markerContent += '<br />';
		}
		markerContent += '<a target="_blank" href="https://www.happycow.net/searchmap?lat='+latitude+'&lng='+longitude+'&vegan=true">Local vegan food</a>';
	}
	marker.bindPopup(markerContent);
	marker.addTo(markerGroup);
}

function displayEvents(hash) {
	if (typeof(hash) !== 'undefined') {
		hash = hash.substring(1);
		var indexOf = hash.indexOf(',');
		if (indexOf > -1) {
			var closestLongLat = hash.substring(indexOf+1).split(',');
			closestLatitude = closestLongLat[0];
			closestLongitude = closestLongLat[1];
		}
	} else if (typeof(position) !== 'undefined') {
		closestLatitude = position.coords.latitude;
		closestLongitude = position.coords.longitude;
	} else {
		closestLatitude = 0;
		closestLongitude = 0;
	}

	var eventIds = [];
	var eventDistances = [];
	var closestEventDistances = [];

	$geo.find('e[lo!=""][la!=""]').each(function() {
		var $event = $(this);
		var longitude = parseFloat($event.attr('lo'));
		var latitude = parseFloat($event.attr('la'));
		var distance = getDistanceFromLatLonInKm(latitude, longitude, closestLatitude, closestLongitude);
		eventDistances.push({'id': $event.attr('id'), 'distance': distance });
	});

	closestEventDistances = eventDistances.sort(function(a, b){return a.distance-b.distance});
	delete eventDistances;
	for (var i=0; i< closestEventDistances.length; i++) {
		eventIds.push(closestEventDistances[i].id);
	}
	delete closestEventDistances;

	if (typeof(options.athleteId === 'string')) {
		if (typeof(athleteData[options.athleteId]) === 'undefined') {
			$.ajax({
				url: 'https://www.parkrun.org.uk:443/results/athleteeventresultshistory/?athleteNumber=' + options.athleteId + '&eventNumber=0',
				async: false,
			}).done(function(data) {
				athleteData[options.athleteId] = $(data);
			});	
		}
	}

	var allCompletedEvents = athleteData[options.athleteId].find("tbody a[href$='/results']");
	alphabetEvents = {};
	for (var i=allCompletedEvents.length; i>0; i--) {
		var eventName = allCompletedEvents[i-1].innerHTML;
		var eventLetter = eventName.substring(0, 1).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
		if (typeof(alphabetEvents[eventLetter]) === 'undefined') {
			alphabetEvents[eventLetter] = eventName;
		}
	}

	var displayedEvents = 0;
	eventIds.forEach(function(eventId) {
		$event = $geo.find("e[id='"+eventId+"']");

		var eventName = $event.attr('m');
		var eventIndex = eventName.substring(0,1).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

		if (alphabetEvents[eventIndex] == eventName) {
			addMarker(++displayedEvents, $event.attr('la'), $event.attr('lo'), eventName, 'purple', $event);
		} else if (typeof(alphabetEvents[eventIndex]) === 'undefined' && typeof(position) !== 'undefined') {
			alphabetEvents[eventIndex] = eventName;
			addMarker(++displayedEvents, $event.attr('la'), $event.attr('lo'), eventName, 'orange', $event);
		}
	});

	var markerIcon = L.icon({
		iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
		shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],
		shadowSize: [41, 41]
	});
	var marker = L.marker([closestLatitude, closestLongitude], { icon: markerIcon});
	marker.addTo(markerGroup);

	mymap.fitBounds(markerGroup.getBounds());
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2-lat1);  // deg2rad below
	var dLon = deg2rad(lon2-lon1); 
	var a = 
		Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
		Math.sin(dLon/2) * Math.sin(dLon/2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c; // Distance in km
	return d;
}

function deg2rad(deg) {
	return deg * (Math.PI/180)
}

function load() {
	$(document).ready(function() {
		markerGroup.clearLayers();
		var hash = decodeURIComponent(window.location.hash);
		displayEvents(hash);
	});
}

function init() {
	$(window).bind( 'hashchange', function(event) {
		load();
	});	
	$.ajax({
		url: 'https://www.parkrun.org.uk/wp-content/themes/parkrun/xml/geo.xml',
		async: false,
	}).done(function(data) {
		$geo = $(data);
	});
}

function initAndLoad() {
	init();
	load();
}
