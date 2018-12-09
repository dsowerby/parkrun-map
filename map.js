var mymap;
var markerGroup;
var $geo;
var options;
var athleteData = [];
var filters = [];
var position;
var hamburger;
var regionFilter;
var withinFilter;

navigator.geolocation.getCurrentPosition(function(data) {
	position = data;
	initAndLoad();
}, function(error) {
	initAndLoad();
});

$(document).ready(function() {
	initAjaxPrefilter();
	initOptions();
	initMap();
	initBurger();
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

function initBurger() {
	hamburger = {
		navToggle: document.querySelector('.nav-toggle'),
		nav: document.querySelector('.nav'),

		doToggle: function(e) {
			e.preventDefault();
			this.navToggle.classList.toggle('expanded');
			this.nav.classList.toggle('expanded');
		},

		show: function() {
			this.navToggle.classList.add('expanded');
			this.nav.classList.add('expanded');
		},

		hide: function() {
			this.navToggle.classList.remove('expanded');
			this.nav.classList.remove('expanded');
		}
	};

	hamburger.navToggle.addEventListener('click', function(e) { hamburger.doToggle(e); });
}

function initMap() {
	mymap = L.map('mapid', {
		fullscreenControl: true,
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

function displayEvents(filterFunctions) {
	var displayedEvents = 0;

	$geo.find('e').each(function() {
		var $event = $(this);
		var name = $event.attr('m');
		var region = $event.attr('r');
		if (region != '') {
			var elementRegionUrl = $geo.find('r[id=' + region + ']').closest("r[u!='']").attr('u');
		}
		var checkbox = $('[data-region-id-' + region + ']');
		var regionSelected = checkbox.prop('checked');

		var displayEvent = false;
		if (regionSelected || regionFilter || withinFilter) {
			displayEvent = true;
			for (var i = 0; i < filterFunctions.length; i++) {
				if (displayEvent) {
					var include = filterFunctions[i]($event);
					displayEvent = displayEvent && include;
				}
			}
		}

		if (displayEvent) {
			var longitude = parseFloat($event.attr('lo'));
			var latitude = parseFloat($event.attr('la'));
			console.info($event.attr('n'));
			if (!isNaN(longitude) && !isNaN(latitude)) {
				addMarker(latitude, longitude, name, 'blue', $event);
				displayedEvents++;
			}
		}
	});

	if (displayedEvents > 0) {
		mymap.fitBounds(markerGroup.getBounds());
		hamburger.hide();
		console.info(displayedEvents + ' events displayed');
	} else {
		hamburger.show();
		console.info('no events displayed');
	}
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
	if (options.nationaltrust) {
		if (typeof(markerContent) !== 'undefined') {
			markerContent += '<br />';
		}
		markerContent += '<a target="_blank" href="https://www.nationaltrust.org.uk/search?lat='+latitude+'&lon='+longitude+'&type=place&view=map">National Trust venues</a>';
	}
	if (options.premierinn) {
		if (typeof(markerContent) !== 'undefined') {
			markerContent += '<br />';
		}
		markerContent += '<a target="_blank" href="https://www.premierinn.com/gb/en/search.html?&LOCATION=' + latitude + ',' + longitude + '">Local Premier Inns</a>';
	}
	marker.bindPopup(markerContent);
	marker.addTo(markerGroup);
}

function getFilter(filter) {
	if (filter.startsWith('not-')) {
		var notFilter = filter.substring(4);
		var filterFunction = getFilter(notFilter);
		return function($event) {
			return !filterFunction($event);
		};
	} else if (filter.startsWith('and-')) {
		var andFilter = filter.substring(4);
		var andFilters = [];
		andFilter.split('&&').filter(function(e){return e}).forEach(function(andFilterPart) {
			andFilters.push(getFilter(andFilterPart));
		});
		return function($event) {
			for (var i = 0; i < andFilters.length; i++) {
				if (!andFilters[i]($event)) {
					return false;
				}
			}
			return true;
		}
	} else if (filter.startsWith('or-')) {
		var orFilter = filter.substring(3);
		var orFilters = [];
		orFilter.split('||').filter(function(e){return e}).forEach(function(orFilterPart) {
			orFilters.push(getFilter(orFilterPart));
		});
		return function($event) {
			for (var i = 0; i < orFilters.length; i++) {
				if (orFilters[i]($event)) {
					return true;
				}
			}
			return false;
		}
	} else if (filter.startsWith('startsWith-')) {
		var prefix = filter.substring(11);
		return function($event) {
			var name = $event.attr('m');
			return name.toLowerCase().startsWith(prefix.toLowerCase());
		};
	} else if (filter.startsWith('contains-')) {
		var needle = filter.substring(9);
		return function($event) {
			var name = $event.attr('m');
			return name.toLowerCase().indexOf(needle.toLowerCase()) > -1;
		};
	} else if (filter.startsWith('matches-')) {
		var r = filter.substring(8);
		var regex = new RegExp(r, 'i');
		return function($event) {
			var name = $event.attr('m');
			return regex.test(name.toLowerCase());
		};
	} else if (filter.startsWith('region-')) {
		regionFilter = true;
		var region = filter.substring(7);
		// we now have the region name
		var $regionElement = $geo.find("r[n='"+region+"']");
		window.regionElement = $regionElement;
		// we have the region id
		return function($event) {
			var eventRegionId = $event.attr('r');
			return $regionElement.is('[id="'+eventRegionId+'"]') || ($regionElement.has('r[id="'+eventRegionId+'"]').length > 0);
		};
	} else if (filter.startsWith('athlete')) {
		var athleteId;
		if (filter == 'athlete') {
			athleteId = options.athleteId;
		} else {
			athleteId = filter.substring(8);
		}
		if (typeof(athleteData[athleteId]) === 'undefined') {
			$.ajax({
				url: 'https://www.parkrun.org.uk:443/results/athleteeventresultshistory/?athleteNumber=' + athleteId + '&eventNumber=0',
				async: false,
			}).done(function(data) {
				athleteData[athleteId] = $(data);
			});	
		} 
		return function($event) {
			return athleteData[athleteId].find("a[href$='/" + $event.attr('n') + "/results']").length > 0;
		};
	} else if (filter.startsWith('within-')) {
		withinFilter = true;
		var within = filter.substring(7);
		var distance, withinLatitude, withinLongitude;
		if (isNaN(within)) {
			var indexOf = within.indexOf('-');
			distance = within.substring(0, indexOf);
			var withinLongLat = within.substring(indexOf+1).split(',');
			withinLatitude = withinLongLat[0];
			withinLongitude = withinLongLat[1];
		} else {
			distance = parseInt(filter.substring(7));
			if (position === undefined) {
				distance = 0;
				withinLatitude = 0;
				withinLongitude = 0;
			} else {
				withinLatitude = position.coords.latitude;
				withinLongitude = position.coords.longitude;
			}
		}

		addMarker(withinLatitude, withinLongitude, 'Within ' + distance +'km', 'orange');
		return function($event) {
			var longitude = parseFloat($event.attr('lo'));
			var latitude = parseFloat($event.attr('la'));
			return getDistanceFromLatLonInKm(latitude, longitude, withinLatitude, withinLongitude) < distance;
		};
	} else if (filter.startsWith('closest')) {
		withinFilter = true;
		var closest = filter.substring(8);
		if (isNaN(closest)) {
			var indexOf = closest.indexOf('-');
			var closestLongLat = closest.substring(indexOf+1).split(',');
			closestLatitude = closestLongLat[0];
			closestLongitude = closestLongLat[1];
			delete closestLongLat;
			closest = closest.substring(0, indexOf);
		} else {
			if (position === undefined) {
				closest = 0;
				closestLatitude = 0;
				closestLongitude = 0;
			} else {
				if (position === undefined) {
					closest = 0;
					closestLatitude = 0;
					closestLongitude = 0;
				} else {
					closest = parseInt(filter.substring(8));
					closestLatitude = position.coords.latitude;
					closestLongitude = position.coords.longitude;
				}
			}
		}

		var events = [];
		var eventDistances = [];
		var closestEventDistances = [];

		console.info('Looking for the closest ' + closest + ' events to ' + closestLatitude + ',' + closestLongitude);
		$geo.find('e[lo!=""][la!=""]').each(function() {
			var $event = $(this);
			var longitude = parseFloat($event.attr('lo'));
			var latitude = parseFloat($event.attr('la'));
			var distance = getDistanceFromLatLonInKm(latitude, longitude, closestLatitude, closestLongitude);
			eventDistances.push({'id': $event.attr('id'), 'distance': distance });
		});

		closestEventDistances = eventDistances.sort(function(a, b){return a.distance-b.distance}).slice(0, closest);
		delete eventDistances;
		for (var i=0; i< closestEventDistances.length; i++) {
			events.push(closestEventDistances[i].id);
		}
		delete closestEventDistances;

		addMarker(closestLatitude, closestLongitude, 'Closest ' + closest + ' event ', 'green');
		return function($event) {
			return events.indexOf($event.attr('id')) > -1;
		};
	} else if (filter === 'none') {
		return function() {
			return false;
		};
	} else if (filter === 'all') {
		return function() {
			return true;
		};
	}
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
		filters = [];
		regionFilter = false;
		withinFilter = false;
		hash.split('#').filter(function(e){return e}).forEach(function(hash) {
			var filter = getFilter(hash);
			if (filter !== undefined) {
				filters.push(filter);
			}
		});
		if (filters.length > 0) {
			displayEvents(filters);
		}
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
