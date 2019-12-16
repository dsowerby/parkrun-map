var mymap;
var markerGroup;
var $geo;
var options;
var athleteData = [];
var filters = [];
var position;
var hamburger;
// var regionFilter;
var withinFilter;
var closestFilter;
var events;
var xmas;
var nyd;

function parseName(nameevent) {
	if (typeof(nameevent) !== 'undefined') {
		return nameevent.properties.EventLongName;
	}
	return undefined;
}

function parseEventId(eventidevent) {
	if (typeof(eventidevent) !== 'undefined') {
		return eventidevent.properties.eventname;
	}
	return undefined;
}

function parseLongitude(longevent) {
	if (typeof(longevent) !== 'undefined') {
		return parseFloat(longevent.geometry.coordinates[0]);
	}
	return undefined;
}

function parseLatitude(latevent) {
	if (typeof(latevent) !== 'undefined') {
		return parseFloat(latevent.geometry.coordinates[1]);
	}
	return undefined;
}

function parseCountrycode(countrycodeevent) {
	if (typeof(countrycodeevent) !== 'undefined') {
		return countrycodeevent.properties.countrycode;
	}
	return undefined;
}

function parseEventUrl(urlevent) {
	var eventid = parseEventId(urlevent);
	var countrycode = parseCountrycode(urlevent);
	var country = countries[countrycode];
	console.info(country.url);
	return "https://" + country.url + "/" + eventid;
}

function parseSeriesId(seriesidevent) {
	return seriesidevent.properties.seriesid;
}

$(document).ready(function() {
	// initAjaxPrefilter();
	initOptions();
	initMap();
	initBurger();
	centreMap();
	initAndLoad();
});

navigator.geolocation.getCurrentPosition(function(data) {
	position = data;
	initAndLoad();
}, function(error) {
	initAndLoad();
});

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
	if (filterFunctions.length == 0) {
		return;
	}

	var displayedEvents = 0;

	var events = $events.features;
	console.info(events.length);
	console.info('initial size: ' + events.length);
	console.info('processing with ' + filterFunctions.length + ' filters');

	for (var i = 0; i < filterFunctions.length; i++) {
		var includedEvents = [];
		var filterFunction = filterFunctions[i];

		events = filterFunction(events);
		console.info('after filter ' + i + ' there are ' + events.length + ' events');
	}

	if (filterFunctions.length > 0) {
		// if (!(regionFilter || withinFilter || closestFilter)) {
		// 	// there is no region or within filter specified, so we should find out the UI selected regions
		// 	var selectedCountries = $('.countries input:checked');
		// 	if (selectedCountries.length > 0) {
		// 		var regionFilterText = 'or-';
		// 		for (var sc=1; sc<selectedCountries.length; sc++) {
		// 			regionFilterText += 'region-' + $(selectedCountries[sc]).attr('name');
		// 			if (sc <selectedCountries.length) {
		// 				regionFilterText += '||';
		// 			}
		// 		}
		// 		console.info('filter ' + filterFunction.length + ' ' + regionFilterText);
		// 		events = getFilter(regionFilterText)(events);
		// 		console.info('after filter ' + filterFunctions.length + ' there are ' + events.length + ' events');
		// 	}
		// }
		console.info('after all filters there are ' + events.length + ' events');
	}

	window.events = events;

	for (var e = 0; e < events.length; e++) {
		var event = events[e];
		var longitude = parseLongitude(event);
		var latitude = parseLatitude(event);
		var name = parseName(event);
		addMarker(latitude, longitude, name, 'blue', event);
		displayedEvents++;
	}

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
		var eventUrl = parseEventUrl($event); 
		markerContent = '<strong><a target="_blank" href="' + eventUrl + '/">'+ name + '</a></strong><br /><a target="_blank" href="' + eventUrl + '/course/">Course page</a><br /><a target="_blank" href="' + eventUrl + '/futureroster/">Future Roster</a><br /><a target="_blank" href="https://www.google.com/maps/dir/?api=1&destination='+latitude+',' + longitude + '">Directions</a>';
	} else if (typeof(name) !== 'undefined') {
		markerContent = name;
	}
	if (typeof(markerContent) !== 'undefined') {
		markerContent += '<br />';
	}
	markerContent += '<a target="_blank" href="https://www.happycow.net/searchmap?lat='+latitude+'&lng='+longitude+'&vegan=true">Local vegan food</a>';
	if (options.nationaltrust) {
		if (typeof(markerContent) !== 'undefined') {
			markerContent += '<br />';
		}
		markerContent += '<a target="_blank" href="https://www.nationaltrust.org.uk/search?lat='+latitude+'&lon='+longitude+'&type=place&view=map">National Trust venues</a>';
		markerContent += '<br />';
		markerContent += '<a target="_blank" href="https://www.nationaltrust.org.uk/search?lat='+latitude+'&lon='+longitude+'&type=place&view=map&PlaceFilter=houses-and-buildings">National Trust houses</a>';
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

function filterEvents(events, eventFilter) {
	return function(events) {
		var filteredEvents = [];
		for (var e=0; e<events.length; e++) {
			var $event = events[e];
			if (eventFilter($event)) {
				filteredEvents.push($event);
			}
		}
		return filteredEvents;
	}
}

function getFilter(filter) {
	if (filter.startsWith('seriesid')) {
		var requiredseriesid = filter.substring(9);
		return filterEvents(events, function($event) {
			var seriesid = parseSeriesId($event);
			return seriesid == requiredseriesid;
		});
	} else if (filter.startsWith('not-')) {
		var notFilter = filter.substring(4);
		var filterFunction = getFilter(notFilter);
		return function(events) {
			var includedEvents = filterFunction(events);
			return _.differenceWith(events, includedEvents, function(event1, event2) { return parseEventId(event1) == parseEventId(event2); });
		};
	} else if (filter.startsWith('and-')) {
		var andFilter = filter.substring(4);
		var andFilters = [];
		andFilter.split('&&').filter(function(e){return e}).forEach(function(andFilterPart) {
			andFilters.push(getFilter(andFilterPart));
		});
		return function(events) {
			var filteredEvents = events;
			for (var i = 0; i < andFilters.length; i++) {
				filteredEvents = andFilters[i](filteredEvents);
			}
			return filteredEvents;
		}
	} else if (filter.startsWith('or-')) {
		var orFilter = filter.substring(3);
		var orFilters = [];
		orFilter.split('||').filter(function(e){return e}).forEach(function(orFilterPart) {
			orFilters.push(getFilter(orFilterPart));
		});
		return function(events) {
			orFilterResults = [];
			for (var i = 0; i < orFilters.length; i++) {
				orFilterResults = _.union(orFilterResults, orFilters[i](events));
			}
			return orFilterResults;
		}
	} else if (filter.startsWith('startsWith-')) {
		var prefix = filter.substring(11);
		return filterEvents(events, function($event) {
			var name = parseName($event);
			return name.toLowerCase().startsWith(prefix.toLowerCase());
		});
	} else if (filter.startsWith('contains-')) {
		var needle = filter.substring(9);
		return filterEvents(events, function($event) {
			var name = parseName($event);
			return name.toLowerCase().indexOf(needle.toLowerCase()) > -1;
		});
	} else if (filter.startsWith('matches-')) {
		var r = filter.substring(8);
		var regex = new RegExp(r, 'i');
		return filterEvents(events, function($event) {
			var name = parseName($event);

			return regex.test(name.toLowerCase());
		});
	} else if (filter.startsWith('country-')) {
		var country = filter.substring(8);
		var countrycode;
		switch(country.toLowerCase()) {
			case 'australia':
				countrycode = 3;
				break;
			case 'canada':
				countrycode = 14;
				break;
			case 'denmark':
				countrycode = 23;
				break;
			case 'finland':
				countrycode = 30;
				break;
			case 'france':
				countrycode = 31;
				break;
			case 'germany':
				countrycode = 32;
				break;
			case 'ireland':
				countrycode = 42;
				break;
			case 'italy':
				countrycode = 44;
				break;
			case 'japan':
				countrycode = 46;
				break;
			case 'mylasia':
				countrycode = 57;
				break;
			case 'new-zealand':
				countrycode = 65;
				break;
			case 'norway':
				countrycode = 67;
				break;
			case 'poland':
				countrycode = 74;
				break;
			case 'russia':
				countrycode = 79;
				break;
			case 'singapore':
				countrycode = 87;
				break;
			case 'south africa':
				countrycode = 85;
				break;
			case 'sweden':
				countrycode = 88;
				break;
			case 'uk':
				countrycode = 97;
				break;
			case 'usa':
				countrycode = 98;
				break;
		}
		console.info('countrycode: ' + countrycode);
		return filterEvents(events, function(countryEvent) {
			console.info(parseCountrycode(countryEvent));
			return countrycode === parseCountrycode(countryEvent);
		});
	// } else if (filter.startsWith('region-')) {
	// 	regionFilter = true;
	// 	var region = filter.substring(7);
	// 	// we now have the region name
	// 	var $regionElement = $geo.find("r[n='"+region+"']");
	// 	// we have the region id
	// 	return filterEvents(events, function($event) {
	// 		var eventRegionId = $event.attr('r');
	// 		return $regionElement.is('[id="'+eventRegionId+'"]') || ($regionElement.has('r[id="'+eventRegionId+'"]').length > 0);
	// 	});
	} else if (filter == 'nyd') {
		if (typeof(nyd) === 'undefined') {
			$.ajax({
				url: 'https://cors-anywhere.herokuapp.com/https://www.parkrun.org/special-events/',
				async: false,
			}).done(function(data) {
				xmas = $(data).find("td:nth-child(3):not(:contains(':'))").parent().remove();
				nyd = $(data).find("td:nth-child(4):not(:contains(':'))").parent().remove();
			});	
		}
		return filterEvents(events, function($event) {
			var parkrunid = parseEventId($event);
			return (nyd.find("td>a[href='https://www.parkrun.org.uk/"+parkrunid+"/']").length > 0);
		});
	} else if (filter == 'xmas') {
		if (typeof(xmas) === 'undefined') {
			$.ajax({
				url: 'https://cors-anywhere.herokuapp.com/https://www.parkrun.org.uk/special-events/',
				async: false,
			}).done(function(data) {
				xmas = $(data).find("td:nth-child(3):not(:contains(':'))").parent().remove();
				nyd = $(data).find("td:nth-child(4):not(:contains(':'))").parent().remove();
			});	
		}
		return filterEvents(events, function($event) {
			var parkrunid = parseEventId($event);
			return (xmas.find("td>a[href='https://www.parkrun.org.uk/"+parkrunid+"/']").length > 0);
		});
	} else if (filter.startsWith('athlete')) {
		var athleteId;
		if (filter == 'athlete') {
			athleteId = options.athleteId;
		} else {
			athleteId = filter.substring(8);
		}
		if (typeof(athleteData[athleteId]) === 'undefined') {
			$.ajax({
				url: 'https://cors-anywhere.herokuapp.com/http://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=' + athleteId + '&eventNumber=0',
				async: false,
			}).done(function(data) {
				athleteData[athleteId] = $(data);
			});	
		}
		return filterEvents(events, function($event) {
			var eventId = parseEventId($event);
			return athleteData[athleteId].find("a[href$='/" + eventId + "/results']").length > 0;
		});
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
		return filterEvents(events, function($event) {
			var latitude = parseLatitude($event);
			var longitude = parseLongitude($event);
			return getDistanceFromLatLonInKm(latitude, longitude, withinLatitude, withinLongitude) < distance;
		});
	} else if (filter == 'compass') {
		return function(events) {
			var northern = {};
			var southern = {};
			var eastern = {};
			var western = {};
	
			for (var e = 0; e<events.length; e++) {
				var compassevent = events[e];
				var latitude = parseLatitude(compassevent);
				var longitude = parseLongitude(compassevent);
	
				/**
					High Lat = North
					<e n="inverness" m="Inverness" c="97" id="267" r="7" la="57.463654" lo="-4.235474"/>
	
					High Long = East
					<e n="lowestoft" m="Lowestoft" c="97" id="1289" r="11" la="52.468286" lo="1.747338"/>
	
					Low Lat = South
					<e n="brighton" m="Brighton & Hove" c="97" id="8" r="17" la="50.842140" lo="-0.172498"/>
	
					Low Long = West
					<e n="aberystwyth" m="Aberystwyth" c="97" id="423" r="12" la="52.414546" lo="-4.080401"/>
				*/
				if (isNaN(northern.latitude) || northern.latitude < latitude) {
					northern.longitude = longitude;
					northern.latitude = latitude;
					northern.id = parseEventId(compassevent);
					northern.event = compassevent;
				}
				if (isNaN(eastern.longitude) || eastern.longitude < longitude) {
					eastern.longitude = longitude;
					eastern.latitude = latitude;
					eastern.id = parseEventId(compassevent);
					eastern.event = compassevent;
				}
				if (isNaN(southern.latitude) || southern.latitude > latitude) {
					southern.longitude = longitude;
					southern.latitude = latitude;
					southern.id = parseEventId(compassevent);
					southern.event = compassevent;
				}
				if (isNaN(western.longitude) || western.longitude > longitude) {
					western.longitude = longitude;
					western.latitude = latitude;
					western.id = parseEventId(compassevent);
					western.event = compassevent;
				}
			}

			var events = [northern.event, eastern.event, southern.event, western.event];
			return _.uniq(events);
		}
	} else if (filter.startsWith('closest')) {
		closestFilter = true;
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

		return function(events) {
			// we need to map all events to their distance from the "closest" center
			// then we simply need to split array of those mappings, and return their values (the events)

			var eventDistances = [];
			for (var e = 0; e<events.length; e++) {
				$event = events[e];
				var latitude = parseLatitude($event);
				var longitude = parseLongitude($event);
				var distance = getDistanceFromLatLonInKm(latitude, longitude, closestLatitude, closestLongitude);
				eventDistances.push({'event': $event, 'distance': distance });
			}
			var closestEventDistances = eventDistances.sort(function(a, b){return a.distance-b.distance});
			var filteredEvents = [];
			if (eventDistances.length < closest) {
				closest = eventDistances.length;
			}
			addMarker(closestLatitude, closestLongitude, 'Closest ' + closest + ' event ', 'green');
			for (var i=0; i<closest; i++) {
				filteredEvents.push(eventDistances[i].event);
			}
			return filteredEvents;
		}
	} else if (filter == 'random') {
		return function(events) {
			var randomEvent = _.random(events.length - 1);
			return [ events[randomEvent] ];
		}
	} else if (filter === 'none') {
		return filterEvents(events, function($event) {
			return [];
		});
	} else if (filter === 'all') {
		return function(events) {
			return events;
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
		closestFilter = false;
		var h = 0;
		hash.split('#').filter(function(e){return e}).forEach(function(hash) {
			console.info('filter ' + h + ' ' + hash);
			var filter = getFilter(hash);
			if (filter !== undefined) {
				filters.push(filter);
			}
			h++;
		});
		displayEvents(filters);
	});
}

function init() {
	$(window).bind( 'hashchange', function(event) {
		load();
	});	
	$.ajax({
		url: './events.json',
		async: false,
	}).done(function(data) {
		$events = data.events;
		countries = data.countries;
		// var $countries = $('<div class="countries"><h4>Countries</h4></div>')
		// $('.nav .controls').append($countries);
		// console.info($events[0].countries);
		// console.info($events[0]['countries']);
		// $events.find("r[id=1] > r").each(function() {
		// 	var $element = $(this);
		// 	var id = $element.attr('id');
		// 	var name = $element.attr('n');
		// 	// checked
		// 	var $checkbox = $("<input type='checkbox' />");
		// 	$checkbox.attr('name', name);
		// 	if (name == 'UK') {
		// 		$checkbox.attr('checked','');
		// 	}
		// 	$checkbox.attr('data-region-id-' + id, '');
		// 	countries;
		// 	$geo.find('r[id='+id+'] r').each(function() {
		// 		$region = $(this);
		// 		$checkbox.attr('data-region-id-' + $region.attr('id'), '');
		// 	});
		// 	$countries.append($checkbox).append($('<span />').text(name)).append($('<br />'));
		// 	$checkbox.change(function() {
		// 		load();
		// 	})
		// });
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