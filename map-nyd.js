var mymap;
var markerGroup;
var $geo;
var $specialEvents;

$(document).ready(function() {
	initOptions();
	initMap();
	centreMap();
	initAndLoad();
});

function initOptions() {
	options = JSON.parse(Cookies.get('options') || '{}');
}

function initMap() {
	mymap = L.map('mapid', {
		fullscreenControl: true,
		fullscreenControlOptions: {
		  position: 'topright'
		},
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
	mymap.on('contextmenu', function (eventData) { window.location.hash ='#closest-5-'+eventData.latlng.lat + ',' + eventData.latlng.lng; });
}

function centreMap() {
	// centre on the complete bounds of all UK based parkruns
	mymap.fitBounds(
		[
			[49.095026, -7.742293],
			[60.258081000000004, 1.847338]
		]
	);
}

function displayEvents(filterFunctions) {
	$.ajax({
		url: 'https://cors-anywhere.herokuapp.com/https://www.parkrun.org.uk/special-events/',
		async: false,
	}).done(function(data) {
		var displayedEvents = 0;
		$specialEvents = $(data);
		$specialEvents.find("td:nth-child(4):not(:contains(':'))").parent().remove();
		var events = $geo.find('e');

		for (var e = 0; e < events.length; e++) {
			var $event = $(events[e]);
			var longitude = parseFloat($event.attr('lo'));
			var latitude = parseFloat($event.attr('la'));
			var parkrunid = $event.attr('n');
			var name = $event.attr('m');
			if (!isNaN(longitude) && !isNaN(latitude)) {
				if ($specialEvents.find("td>a[href='http://www.parkrun.org.uk/"+parkrunid+"/']").length > 0) {
					addMarker(latitude, longitude, name, 'green', $event);
					displayedEvents++;
				}
			}
		}

		if (displayedEvents > 0) {
			mymap.fitBounds(markerGroup.getBounds());
		}	
	});
}

function addMarker(latitude, longitude, name, iconColour, $event) {
	var markerIcon = L.icon({
		iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-'+iconColour+'.png',
		shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],
		shadowSize: [41, 41]
	});
	var marker = L.marker([latitude, longitude], { icon: markerIcon});
	var markerContent;
	if (typeof($event) !== 'undefined') {
		var elementId = $event.attr('n');
		var region = $event.attr('r');
		if (region != '') {
			var elementRegionUrl = $geo.find('r[id=' + region + ']').closest("r[u!='']").attr('u');
		}
		markerContent = '<strong><a target="_blank" href="' + elementRegionUrl + '/' + elementId + '/">'+ name + '</a></strong><br /><a target="_blank" href="' + elementRegionUrl + '/' + elementId + '/course/">Course page</a><br /><a target="_blank" href="' + elementRegionUrl + '/' + elementId + '/futureroster/">Future Roster</a><br /><a target="_blank" href="https://www.google.com/maps/dir/?api=1&destination='+latitude+',' + longitude + '">Directions</a>';
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

function filterEvents(events, eventFilter) {
	return function(events) {
		var filteredEvents = [];
		for (var e=0; e<events.length; e++) {
			var $event = $(events[e]);
			if (eventFilter($event)) {
				filteredEvents.push($event);
			}
		}
		return filteredEvents;
	}
}

function load() {
	$(document).ready(function() {
		markerGroup.clearLayers();
		var hash = decodeURIComponent(window.location.hash);
		filters = [];
		hash.split('#').filter(function(e){return e}).forEach(function(hash) {
			var filter = getFilter(hash);
			if (filter !== undefined) {
				filters.push(filter);
			}
		});
		displayEvents(filters);
	});
}

function init() {
	$.ajax({
		url: './geo.xml',
		async: false,
	}).done(function(data) {
		$geo = $(data);
	});
}

function initAndLoad() {
	init();
	load();
}
