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
    init_routes();
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
                init_search_by_stop();
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

// Initialize function of search-by-stop
function init_search_by_stop() {
    init_stop_dropdown();
}

// Initialize route drop down
function init_route_dropdown() {
    var route_name_list = [];
    var options_routes = "";

    // Get the routes
    for (var [key, value] of route_map) {
        route_name_list.push(key);
    }

    if (route_name_list.length != 0) {
        // Sort the route_name_list
        route_name_list.sort(function(a, b){
            return a.localeCompare(b);
        });
        // Set the Routes drop-down by route_name_list
        route_name_list.forEach(function (route_name) {
            options_routes += "<option value=\"" + route_name + "\">" + route_name + "</option>";
        });
    } else {
        options_directions += "<option value=\"none\">none</option>";
    }

    document.getElementById("route-dropdown").innerHTML = options_routes;
}

function init_direction_dropdown() {
    var options_directions = "";
    var direction_list = new Array();
    var route_name = document.getElementById("route-dropdown").value;

    if (route_name != "none") {
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
    } else {
        options_directions += "<option value=\"none\">none</option>";
    }
    document.getElementById("direction-dropdown").innerHTML = options_directions;
}

// Initialize stop drop down
function init_stop_dropdown() {
    var stop_id_list = [];
    var options_stops = "";

    // Get the stops
    for (var [key, value] of stop_id_map) {
        stop_id_list.push(key);
    }

    if (stop_id_list.length != 0) {
        // Sort the route_name_list
        stop_id_list.sort(function(a, b){
            return a.localeCompare(b);
        });
        // Set the stops drop-down by stop_id_list
        stop_id_list.forEach(function (stop_id) {
            options_stops += "<option value=\"" + stop_id + "\">" + stop_id + "</option>";
        });
    } else {
        options_stops += "<option value=\"none\">none</option>";
    }
    document.getElementById("stop-dropdown").innerHTML = options_stops;
}

function select_route() {
    init_direction_dropdown();
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

function show_route_map(route_name, index_direction, index_origin_stop, index_destination_stop) {
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

function show_route_list(route_name, index_direction, index_origin_stop, index_destination_stop) {
    var content = "<ul>";
    for (var index = index_origin_stop; index <= index_destination_stop; index++) {
        var stop = stop_id_map.get(route_map.get(route_name)[index_direction][index]);
        content += "<li style=\"font-size:20px\">" + stop.stop_name + "</li><br>";
    }
    content += "</ul>"
    document.getElementById("search-by-route-content").innerHTML = content;
}

function search_by_route() {

    var route_name = document.getElementById("route-dropdown").value;
    var index_direction = document.getElementById("direction-dropdown").value;

    if (route_name != "none" && index_direction != "none") {
        var index_origin_stop = 0;
        var index_destination_stop = route_map.get(route_name)[index_direction].length - 1;
        show_route_map(route_name, index_direction, index_origin_stop, index_destination_stop);
        show_route_list(route_name, index_direction, index_origin_stop, index_destination_stop);
    } else {
        alert("Sorry, the input is invalid. Please input again.");
    }
}

// Search by Stop
function search_by_stop() {
    clear_route();
    var stop_id = document.getElementById("stop-dropdown").value;

    if (stop_id != "none") {
        var content = "<ul>";

        for (var [key, value] of route_map) {
            for (var index_direction = 0; index_direction < route_map.get(key).length; index_direction++) {
                for (var index_stop = 0; index_stop < route_map.get(key)[index_direction].length; index_stop++) {
                    if (stop_id == route_map.get(key)[index_direction][index_stop]) {
                        content += "<li style=\"font-size:20px\">" + "Route: " + key + "</li><br>";
                    }
                }
            }
        }
        content += "</ul>"
        document.getElementById("search-by-stop-content").innerHTML = content;
    } else {
        alert("Sorry, the input is invalid. Please input again.");
    }
}