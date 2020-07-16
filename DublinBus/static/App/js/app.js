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

// Set the definition of Stop class
function Stop(stop_id, stop_name, pos_latitude, pos_longitude)
{
    this.stop_id = stop_id;
    this.stop_name = stop_name;
    this.pos_latitude = pos_latitude;
    this.pos_longitude = pos_longitude;
}

function init() {
    init_date_and_time();
    init_routes();
}

function init_date() {
    var time = new Date();
    var day = ("0" + time.getDate()).slice(-2);
    var month = ("0" + (time.getMonth() + 1)).slice(-2);
    var today = time.getFullYear() + "-" + (month) + "-" + (day);
    document.getElementById("predict-date").value = today;
    document.getElementById("predict-date-google").value = today;
}

function init_time() {
    var date = new Date();
    var hour = ("0" + date.getHours()).slice(-2);
    var minute = ("0" + date.getMinutes()).slice(-2);
    var time = hour + ":" + minute;
    document.getElementById("predict-time").value = time;
    document.getElementById("predict-time-google").value = time;
}

function init_date_and_time() {
    init_date();
    init_time();
}

// Initialize routes data
function init_routes() {
    $.getJSON(ROOT + "/get_route_stop_relation", null, function (data) {
        for (var route in data) {
            var directions = new Array();
            for (var direction in data[route]) {
                var stop_list = new Array();
                data[route][direction].forEach(function (stop) {
                    stop_list.push(stop["stop_id"]);
                });
                directions.push(stop_list);
            }
            route_map.set(route, directions);
        }
        init_stops();
        })
        .done(function () {
            console.log("Get Routes Success");
        })
        .fail(function () {
            console.log("Get Routes Error");
        })
        .always(function () {
            console.log("Get Routes Complete");
        })
}

// Initialize stops data
function init_stops() {
    $.getJSON(ROOT + "/get_stops", null, function (data) {
            if ('stops' in data) {
                var options_stops = "";
                var stops = data.stops;
                stops.forEach(function (stop) {
                    var stop_node = new Stop(stop.stop_id, stop.stop_name, stop.stop_lat, stop.stop_lon);
                    // Set the stop_id_map
                    stop_id_map.set(stop.stop_id, stop_node);
                    // Set the stop_name_map
                    if (!stop_name_map.has(stop.stop_name)) {
                        var stop_list = new Array();
                        stop_list.push(stop_node);
                        stop_name_map.set(stop.stop_name, stop_list);
                    } else {
                        var stop_list = stop_name_map.get(stop.stop_name);
                        stop_list.push(stop_node);
                        stop_name_map.set(stop.stop_name, stop_list);
                    }
                });
                //for (var [key, value] of stop_name_map) {
                //    console.log(key + ' vs ' + value.length);
                //}
                init_search_by_route();
            }
        })
        .done(function () {
            console.log("Get Stops Success");
        })
        .fail(function () {
            console.log("Get Stops Error");
        })
        .always(function () {
            console.log("Get Stops Complete");
        })
}

// Initialize function of search-by-route
function init_search_by_route() {
    init_route_dropdown();
    select_route();
}

// Initialize route drop down
function init_route_dropdown() {
    var route_name_list = [];
    var options_routes = "";

    // Get the routes
    for (var [key, value] of route_map) {
        route_name_list.push(key);
    }

    // Sort the route_name_list
    route_name_list.sort(function(a, b){
        return a.localeCompare(b);
    });
    // Set the Routes drop-down by route_name_list
    route_name_list.forEach(function (route_name) {
        options_routes += "<option value=\"" + route_name + "\">" + route_name + "</option>";
    });
    document.getElementById("route-dropdown").innerHTML = options_routes;
}

function init_direction_dropdown() {
    var options_directions = "";
    var direction_list = new Array();
    var route_name = document.getElementById("route-dropdown").value;
    for (var d = 0; d < route_map.get(route_name).length; d++) {
        direction_list.push(d);
    }
    // Set the direction drop-down by direction_list
    if (route_map.get(route_name).length != 0) {
        direction_list.forEach(function (direction) {
            options_directions += "<option value=\"" + direction + "\">" + direction + "</option>";
        });
    } else {
        options_directions += "<option value=\"none\">none</option>";
    }
    document.getElementById("direction-dropdown").innerHTML = options_directions;
}

function init_origin_stop_dropdown() {
    var options_stops = "";
    var stop_name_list = new Array();
    var route_name = document.getElementById("route-dropdown").value;
    var index_direction = document.getElementById("direction-dropdown").value;
    if (index_direction != "none" && route_map.get(route_name)[index_direction].length > 1) {
        // Set the stops drop-down by stop_name_list
        for (var e = 0; e < route_map.get(route_name)[index_direction].length - 1; e++) {
            var stop_id = route_map.get(route_name)[index_direction][e];
            var stop_name = stop_id_map.get(stop_id).stop_name;
            options_stops += "<option value=\"" + e + "\">" + stop_name + "</option>";
        }
    } else {
        options_stops += "<option value=\"none\">" + "none" + "</option>";
    }
    document.getElementById("origin-stop-dropdown").innerHTML = options_stops;
}

function init_destination_stop_dropdown() {
    var options_stops = "";
    var stop_name_list = new Array();
    var route_name = document.getElementById("route-dropdown").value;
    var index_direction = document.getElementById("direction-dropdown").value;
    var index_origin_stop = document.getElementById("origin-stop-dropdown").value;
    if (index_origin_stop != "none") {
        for (var e = Number(index_origin_stop) + 1; e < route_map.get(route_name)[index_direction].length; e++) {
            var stop_id = route_map.get(route_name)[index_direction][e];
            var stop_name = stop_id_map.get(stop_id).stop_name;
            options_stops += "<option value=\"" + e + "\">" + stop_name + "</option>";
        }
    } else {
        options_stops += "<option value=\"none\">" + "none" + "</option>";
    }
    document.getElementById("destination-stop-dropdown").innerHTML = options_stops;
}

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

function select_origin_stop() {
    init_destination_stop_dropdown();
}

function select_direction() {
    init_origin_stop_dropdown();
    select_origin_stop();
}

function select_route() {
    init_direction_dropdown();
    select_direction();
}

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

function show_route(route_name, index_direction, index_origin_stop, index_destination_stop) {
    map.setZoom(11);
    clear_route();

    for (var index = index_origin_stop; index <= index_destination_stop; index++) {
        var stop = stop_id_map.get(route_map.get(route_name)[index_direction][index]);
        marker = new google.maps.Marker({
            position: {
                lat: Number(stop.pos_latitude),
                lng: Number(stop.pos_longitude)
            },
            map: map,
            title: stop.stop_name + ", Stop ID: " + stop.stop_id,
            stop_id: stop.stop_id
        });
        markerList.push(marker);
    }
}

function predict_time(route_name, index_direction, index_origin_stop, index_destination_stop) {
    var origin_stop = stop_id_map.get(route_map.get(route_name)[index_direction][index_origin_stop]);
    var destination_stop = stop_id_map.get(route_map.get(route_name)[index_direction][index_destination_stop]);

    var date = document.getElementById("predict-date").value;
    var time = document.getElementById("predict-time").value;

    $.getJSON(ROOT + "/predict_time/" + route_name + "/" + index_origin_stop + "/" + origin_stop.stop_id + '/' + index_destination_stop + "/" + destination_stop.stop_id
        + "/" + date + "/" + time, null, function (data) {
        var prediction_time = data.prediction_time + " min";
        document.getElementById("search-by-route-content").innerHTML = "";
        var content = "<div style=\"font-size:20px\">Predicted Time: " + predict_time + "</div>";
        document.getElementById("search-by-route-content").innerHTML = content;
    })
    .done(function () {
        console.log("Predict Time Success");
    })
    .fail(function () {
        console.log("Predict Time Error");
    })
    .always(function () {
        console.log("Predict Time Complete");
    })
}

function search_by_route() {
    var content = "<div class='title'>Please wait for the prediction result.</div>"
    document.getElementById("search-by-route-content").innerHTML = content;

    var route_name = document.getElementById("route-dropdown").value;
    var index_direction = document.getElementById("direction-dropdown").value;
    var index_origin_stop = document.getElementById("origin-stop-dropdown").value;
    var index_destination_stop = document.getElementById("destination-stop-dropdown").value;

    if (index_destination_stop != "none") {
        show_route(route_name, index_direction, index_origin_stop, index_destination_stop);
        predict_time(route_name, index_direction, index_origin_stop, index_destination_stop);
    } else {
        alert("Sorry, the input is invalid. Please input again.");
    }
}

// Search by address
var name_origin_address;
var name_destination_address;
var coord_origin_address;
var coord_destination_address;

function search_by_address() {
    name_origin_address = get_origin_address();
    name_destination_address = get_destination_address();

    coord_origin_address = null;
    coord_destination_address = null;

    clear_route();
    get_coordinate();
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
    var panel = document.getElementById('search-by-address-content');
    panel.innerHTML = '';
    directions.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            renderer.setDirections(response);
            renderer.setMap(map);
            renderer.setPanel(panel);
        } else {
            renderer.setMap(null);
            renderer.setPanel(null);
            panel.innerHTML = "No Results.";
        }
    });
}

