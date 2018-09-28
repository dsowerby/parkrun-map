var completedEvents = [];
var mymap;
var markerGroup;

$(document).ready(function() {
    initMap();
    initBurger();
    centerOnUK();
    initAndLoad();
});

function initBurger() {
    var hamburger = {
		navToggle: document.querySelector('.nav-toggle'),
		nav: document.querySelector('.nav'),

		doToggle: function(e) {
            e.preventDefault();
            console.info('toggling');
			this.navToggle.classList.toggle('expanded');
			this.nav.classList.toggle('expanded');
		}
	};

	hamburger.navToggle.addEventListener('click', function(e) { hamburger.doToggle(e); });
	// hamburger.nav.addEventListener('click', function(e) { hamburger.doToggle(e); });
}

function initMap() {
    mymap = L.map('mapid', {
        zoomControl: false
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

function displayEvents(include) {
    markerGroup.clearLayers();
    var longitudeMin = undefined;
    var longitudeMax = undefined;
    var latitudeMin = undefined;
    var latitudeMax = undefined;
    var displayedEvents = 0;
    $.ajax('geo.xml').done(function(data) {
        $(data).find('e').each(function() {
            var $element = $(this);
            var name = $element.attr('m');
            if (include(name)) {
                var elementId = $element.attr('n');
                var longitude = parseFloat($element.attr('lo'));
                var latitude = parseFloat($element.attr('la'));
                var region = $element.attr('r');
                if (region != '') {
                    var elementRegionUrl = $(data).find('r[id=' + region + ']').closest("r[u!='']").attr('u');
                }
                var checkbox = $('[data-region-id-' + region + ']');
                if (checkbox.prop('checked') && completedEvents.indexOf(name) == -1) {
                    if (longitude < longitudeMin || typeof(longitudeMin) == "undefined") { longitudeMin = longitude; }
                    if (latitude < latitudeMin || typeof(latitudeMin) == "undefined") { latitudeMin = latitude; }
                    if (longitude > longitudeMax || typeof(longitudeMax) == "undefined") { longitudeMax = longitude; }
                    if (latitude > latitudeMax || typeof(latitudeMax) == "undefined") { latitudeMax = latitude; }
                    var marker = L.marker([latitude, longitude])
                    if (typeof(elementRegionUrl) !== undefined) {
                        marker.bindPopup('<a target="_new" href="' + elementRegionUrl + '/' + elementId + '">' + name + '</a>');
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
    });
}

$(window).bind( 'hashchange', function(event) {
    load();
});

function load() {
    var hash = decodeURIComponent(window.location.hash);
    if (hash.startsWith('#startsWith-')) {
        var prefix = hash.substring(12);
        displayEvents(function(name) {
            return name.toLowerCase().startsWith(prefix.toLowerCase());
        });
    } else if (hash.startsWith('#contains-')) {
        var point = hash.substring(10);
        displayEvents(function(name) {
            return name.toLowerCase().indexOf(point.toLowerCase()) > -1;
        });
    } else if (hash === '#all') {
        displayEvents(function(name) {
            return true;
        });
    } else {
        history.pushState("", document.title, window.location.pathname + window.location.search);
        displayEvents(function() {
            return false;
        });
    }
}

function init() {
    $.ajax({
            url: 'geo.xml'
        }).done(function(data) {
        $('.nav').append("<h4>Countries</h4>");
        // var parser = new DOMParser();
        $(data).find("r[id=1] > r").each(function() {
            var $element = $(this);
            var id = $element.attr('id');
            var name = $element.attr('n');
            // checked
            var $checkbox = $("<input type='checkbox' />");
            if (name == 'UK') {
                $checkbox.attr('checked','');
            }
            $checkbox.attr('data-region-id-' + id, '');
            $(data).find('r[id='+id+'] r').each(function() {
                $region = $(this);
                $checkbox.attr('data-region-id-' + $region.attr('id'), '');
            });
            $('.nav').append($checkbox).append($('<span />').text(name)).append($('<br />'));
            $checkbox.change(function() {
                load();
            })
        });
    });
}

function initAndLoad() {
    init();
    load();
}
