// Set the root location of server
ROOT = window.location.origin;

var directions;
var renderer;

var map;
var geocoder;
var stop_id_map = new Map();
var stop_name_map = new Map();
var route_map = new Map();

// Initialize the map
// Declare constants and global variables
const chart_colors = ['#59b75c', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6'];
const backgroundColor = '#fff';
// Init setup the google map

function init_map() {
    // Set the location of dublin
    var dublin = {
        lat: 53.35,
        lng: -6.26
    };
    // Create the map centered at dublin
    map = new google.maps.Map(
        document.getElementById('map_location'), {
            zoom: 11,
            center: dublin,
            mapTypeId: 'roadmap'
        });

    // Display the public transit network of a city on the map
    var transitLayer = new google.maps.TransitLayer();
    transitLayer.setMap(map);

    // Initialize the address parser
    geocoder = new google.maps.Geocoder();

    directions = new google.maps.DirectionsService();  // Get the route requirement
    renderer = new google.maps.DirectionsRenderer();   // Show the route

    init_address();
}

// Load the Visualization API and the corechart package.
google.charts.load('current', {
    'packages': ['corechart']
});

// Init information
function init() {
    init_date_and_time();
}

// Init date
function init_date() {
    var time = new Date();
    var day = ("0" + time.getDate()).slice(-2);
    var month = ("0" + (time.getMonth() + 1)).slice(-2);
    var today = time.getFullYear() + "-" + (month) + "-" + (day);
    document.getElementById("date-from-airport").value = today;
    document.getElementById("date-to-airport").value = today;
}

// Init time
function init_time() {
    var date = new Date();
    var hour = ("0" + date.getHours()).slice(-2);
    var minute = ("0" + date.getMinutes()).slice(-2);
    var time = hour + ":" + minute;
    document.getElementById("time-from-airport").value = time;
    document.getElementById("time-to-airport").value = time;
}

// Init date and time
function init_date_and_time() {
    init_date();
    init_time();
}

// Init address
var origin_address_box;
var destination_address_box;

function init_address() {
    var from = document.getElementById('origin-address');
    var to = document.getElementById('destination-address');

    var irelandBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(50.999929,-10.854492),
        new google.maps.LatLng(55.354135,-5.339355));

    origin_address_box = new google.maps.places.SearchBox(from, {
        bounds: irelandBounds
    });
    destination_address_box = new google.maps.places.SearchBox(to, {
        bounds: irelandBounds
    });
}

// Clear route on map
var markerList = [];

function clear_route() {
    for (var i = 0; i < markerList.length; i++) {
        markerList[i].setMap(null);
    }
    markerList = []

    if (renderer != null) {
        renderer.setMap(null);
    }
}

// Search by address
var name_origin_address;
var name_destination_address;
var coord_origin_address;
var coord_destination_address;
var content_id;

function search_from_airport() {
    name_origin_address = "Dublin Airport (DUB)";
    name_destination_address = get_destination_address();

    coord_origin_address = null;
    coord_destination_address = null;

    clear_route();
    get_coordinate();
    content_id = "search-from-airport-content";
    pre_draw_route();
}

function search_to_airport() {
    name_origin_address = get_origin_address();
    name_destination_address = "Dublin Airport (DUB)";

    coord_origin_address = null;
    coord_destination_address = null;

    clear_route();
    get_coordinate();
    content_id = "search-to-airport-content";
    pre_draw_route();
}

function get_origin_address() {
  var from = document.getElementById('origin-address').value;
  //codeAddress(from);
  return from;
}

function get_destination_address() {
  var to = document.getElementById('destination-address').value;
  //codeAddress(to);
  return to;
}

function codeAddress(allAddress) {
    if (geocoder) {
        geocoder.geocode({
            'address': allAddress
        },
        function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var beachMarker = new google.maps.Marker({
                    map: map
                });
                map.setCenter(results[0].geometry.location);
                map.setZoom(15);
                beachMarker.setPosition(results[0].geometry.location);
                attachSecretMessage(beachMarker, results[0].geometry.location, results[0].formatted_address);
            } else {
                //alert("Failed to load map, status code: " + status);
            }
        });
    }
}

function attachSecretMessage(marker, piont, address) {
    var message = "<b>Coordinate: </b>" + piont.lat() + ", " + piont.lng() + "<br/><br/>" + "<b> Address: </b>" + address;
    var infowindow = new google.maps.InfoWindow({
        content: message,
        size: new google.maps.Size(50, 60)
    });
    infowindow.open(map, marker);
    if (typeof (mapClick) == "function") {
        mapClick(piont.lng(), piont.lat(), address);
    }
}

function get_coordinate() {
    if (isNaN(name_origin_address)) {
        var fn = function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    coord_origin_address = results[0].geometry.location;
                }
            } else {
                coord_origin_address = name_origin_address;
                alert("Geocoder failed due to: " + status);
            }
        }
        getGeocoder(name_origin_address, fn);
    }

    if (isNaN(name_destination_address)) {
        var fn = function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    coord_destination_address = results[0].geometry.location;
                }
            } else {
                coord_destination_address = name_destination_address;
                alert("Geocoder failed due to: " + status);
            }
        }
        getGeocoder(name_destination_address, fn);
     }
}

function getGeocoder(allAddress, fn) {
    if (geocoder) {
        geocoder.geocode({
            'address': allAddress
        }, fn);
    }
}

function pre_draw_route() {
    if (!coord_origin_address || !coord_destination_address) {
        setTimeout(pre_draw_route, 10);
        return;
    }
    draw_route();
}

// Draw route on map
function draw_route() {
    var request = {
        origin: new google.maps.LatLng(coord_origin_address.lat(), coord_origin_address.lng()),
        destination: new google.maps.LatLng(coord_destination_address.lat(), coord_destination_address.lng()),
        travelMode: google.maps.TravelMode['TRANSIT'],
        transitOptions: {
            modes: ['BUS']
        },
        provideRouteAlternatives: true,
    };
    var panel = document.getElementById(content_id);
    panel.innerHTML = '';
    directions.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            renderer.setDirections(response);
            renderer.setMap(map);
            renderer.setPanel(panel);
        } else {
            renderer.setMap(null);
            renderer.setPanel(null);
            panel.innerHTML = "<div style=\"font-size:20px\">Sorry. No Results.</div>";
        }
    });
}