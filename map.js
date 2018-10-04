var completedEvents = [];
var mymap;
var markerGroup;
var $geo;
var options;

$(document).ready(function() {
	initOptions();
	initMap();
	initBurger();
	centerOnUK();
	initAndLoad();
});

function initOptions() {
	options = JSON.parse(Cookies.get('options') || '{}');
}

function initBurger() {
	var hamburger = {
		navToggle: document.querySelector('.nav-toggle'),
		nav: document.querySelector('.nav'),

		doToggle: function(e) {
			e.preventDefault();
			this.navToggle.classList.toggle('expanded');
			this.nav.classList.toggle('expanded');
		}
	};

	hamburger.navToggle.addEventListener('click', function(e) { hamburger.doToggle(e); });
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
	markerGroup = L.layerGroup().addTo(mymap);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mymap);
}

function centerOnUK() {
	// center on the complete bounds of all UK based parkruns
	mymap.fitBounds([
		[49.095026, -7.742293],
		[60.258081000000004, 1.847338]
	]);
}

function displayEvents(filterFunctions) {
	markerGroup.clearLayers();
	var longitudeMin = longitudeMax = latitudeMin = latitudeMax = undefined;
	var displayedEvents = 0;

	$geo.find('e').each(function() {
		var $event = $(this);
		var name = $event.attr('m');
		var region = $event.attr('r');
		if (region != '') {
			var elementRegionUrl = $geo.find('r[id=' + region + ']').closest("r[u!='']").attr('u');
		}
		var checkbox = $('[data-region-id-' + region + ']');
		var regionSelected = checkbox.prop('checked') && completedEvents.indexOf(name) == -1;

		var displayEvent = false;
		if (regionSelected) {
		displayEvent = true;
			for (var i = 0; i < filterFunctions.length; i++) {
				if (displayEvent) {
					var include = filterFunctions[i]($event);
					displayEvent = displayEvent && include;
				}
			}
		}

		if (displayEvent) {
			var elementId = $event.attr('n');
			var longitude = parseFloat($event.attr('lo'));
			var latitude = parseFloat($event.attr('la'));
			if (!isNaN(longitude) && !isNaN(latitude)) {
				if (longitude < longitudeMin || typeof(longitudeMin) == 'undefined') { longitudeMin = longitude; }
				if (latitude < latitudeMin || typeof(latitudeMin) == 'undefined') { latitudeMin = latitude; }
				if (longitude > longitudeMax || typeof(longitudeMax) == 'undefined') { longitudeMax = longitude; }
				if (latitude > latitudeMax || typeof(latitudeMax) == 'undefined') { latitudeMax = latitude; }

				var marker = L.marker([latitude, longitude]);
				if (typeof(elementRegionUrl) !== undefined) {
					var markerContent = '<strong>'+ name + '</strong><br /><a target="_blank" href="' + elementRegionUrl + '/' + elementId + '">Course page</a><br /><a target="_blank" href="https://www.google.com/maps/dir/?api=1&destination='+latitude+',' + longitude + '">Directions</a>';
					if (options.vegan) {
						markerContent += '<br /><a target="_blank" href="https://www.happycow.net/searchmap?lat='+latitude+'&lng='+longitude+'&vegan=true">Local vegan food</a>';
					}
					marker.bindPopup(markerContent);
				} else {
					marker.bindPopup(name);
				}
				marker.addTo(markerGroup);
				displayedEvents++;
			}
		}
	});

	if (displayedEvents > 0) {
		latitudeMin = latitudeMin - 0.1;
		longitudeMin = longitudeMin - 0.1;
		latitudeMax = latitudeMax + 0.1;
		longitudeMax = longitudeMax + 0.1;

		mymap.fitBounds([
			[latitudeMin, longitudeMin],
			[latitudeMax, longitudeMax]
		]);
	}
}

$(window).bind( 'hashchange', function(event) {
	load();
});

function load() {
	$(document).ready(function() {
		var hash = decodeURIComponent(window.location.hash);
		var filters = [];
		hash.split('#').filter(function(e){return e}).forEach(function(hash) {
			if (hash.startsWith('startsWith-')) {
				var prefix = hash.substring(11);
				filters.push(function($event) {
					var name = $event.attr('m');
					return name.toLowerCase().startsWith(prefix.toLowerCase());
				});
			} else if (hash.startsWith('contains-')) {
				var needle = hash.substring(9);
				filters.push(function($event) {
					var name = $event.attr('m');
					return name.toLowerCase().indexOf(needle.toLowerCase()) > -1;
				});
			} else if (hash.startsWith('matches-')) {
				var r = hash.substring(8);
				var regex = new RegExp(r, 'i');
				filters.push(function($event) {
					var name = $event.attr('m');
					return regex.test(name.toLowerCase());
				});
			} else if (hash.startsWith('region-')) {
				var region = hash.substring(7);
				var regionId = $geo.find("r[n='"+region+"']").attr('id');
				filters.push(function($event) {
					return regionId === $event.attr('r');
				});
			} else if (hash === 'none') {
				filters.push(function() {
					return false;
				});
			} else if (hash === 'all') {
				filters.push(function() {
					return true;
				});
			}
		});
		if (filters.length == 0) {
			filters.push(function() {
				return false;
			})
		}
		displayEvents(filters);
	});
}

function init() {
	$.ajax({
		url: 'geo.xml',
		async: false,
	}).done(function(data) {
		$geo = $(data);
		var $countries = $('<div class="countries"><h4>Countries</h4></div>')
		$('.nav .controls').append($countries);
		$geo.find("r[id=1] > r").each(function() {
			var $element = $(this);
			var id = $element.attr('id');
			var name = $element.attr('n');
			// checked
			var $checkbox = $("<input type='checkbox' />");
			if (name == 'UK') {
				$checkbox.attr('checked','');
			}
			$checkbox.attr('data-region-id-' + id, '');
			$geo.find('r[id='+id+'] r').each(function() {
				$region = $(this);
				$checkbox.attr('data-region-id-' + $region.attr('id'), '');
			});
			$countries.append($checkbox).append($('<span />').text(name)).append($('<br />'));
			$checkbox.change(function() {
				load();
			})
		});
	});
	$('#letter-prefix').keypress(function (e) {
		if (e.which == 13) {
			var prefix = $('#letter-prefix').val();
			var prefix = Array.from(new Set(prefix.toLowerCase().replace(/[^a-z]/ig, '').split(''))).join('')
			window.location.hash = '#matches-^[' + prefix + ']';
		}
	});
	$('#search').keypress(function (e) {
		if (e.which == 13) {
			var search = $('#search').val();
			window.location.hash = '#matches-.*' + search + '.*';
		}
	});
}

function initAndLoad() {
	init();
	load();
}
