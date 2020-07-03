// Set the root location of server
ROOT = window.location.origin;

var map;
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
            zoom: 13,
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

var prevDirectionsDisplay = null;

function show_route(route_name, index_direction, index_origin_stop, index_destination_stop) {
    var origin_stop = stop_id_map.get(route_map.get(route_name)[index_direction][index_origin_stop]);
    var destination_stop = stop_id_map.get(route_map.get(route_name)[index_direction][index_destination_stop]);

    if (prevDirectionsDisplay != null) {
        prevDirectionsDisplay.setMap(null);
    }

    directionsDisplay = new google.maps.DirectionsRenderer;
    directionsService = new google.maps.DirectionsService;

    directionsDisplay.setMap(map);

    directionsService.route({
        origin: new google.maps.LatLng(origin_stop.pos_latitude, origin_stop.pos_longitude),
        destination: new google.maps.LatLng(destination_stop.pos_latitude, destination_stop.pos_longitude),
        travelMode: google.maps.TravelMode['TRANSIT'],
        transitOptions: {
            modes: ['BUS']
        },
        provideRouteAlternatives: true
    }, function(response, status) {
        if (status == 'OK') {
            directionsDisplay.setDirections(response);
            prevDirectionsDisplay = directionsDisplay;
        } else {
            window.alert('Error:' + status);
        }
    });
}

function predict_time(route_name, index_direction, index_origin_stop, index_destination_stop) {
    var origin_stop = stop_id_map.get(route_map.get(route_name)[index_direction][index_origin_stop]);
    var destination_stop = stop_id_map.get(route_map.get(route_name)[index_direction][index_destination_stop]);

    var date = document.getElementById("predict-date").value;
    var time = document.getElementById("predict-time").value;

    $.getJSON(ROOT + "/predict_time/" + route_name + "/" + index_origin_stop + "/" + origin_stop.stop_id + '/' + index_destination_stop + "/" + destination_stop.stop_id
        + "/" + date + "/" + time, null, function (data) {
        var prediction_time = data.prediction_time + " min";
        var process = origin_stop.stop_name + " -> " + destination_stop.stop_name;
        document.getElementById("search-by-route-content").innerHTML = "";
        var content = "<div class='row'><div class='item title'>Option</div><div class='item title'>Route</div><div class='item title'>Process</div><div class='item title'>Predicted Time</div><div class='item title'>Map</div></div>";
        content += "<div class='row'><div class='item'>" + 1 + "</div><div class='item'>" + route_name + "</div><div class='item'><p>" + process + "</p></div><div class='item'>" + prediction_time + "</div>";
        content += "<div class='item'><a href='javascript:void(0)'>" + "Show Route" + "</a></div>";
        content += "</div>"
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
