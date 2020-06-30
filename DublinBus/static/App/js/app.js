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

// Initialize static data including stops and route information
function init_stops_and_routes() {
    init_routes();
    init_stops();
}

// Initialize stops data
function init_stops() {
    $.getJSON(ROOT + "/get_stops", null, function (data) {
            if ('stops' in data) {
                var options_stops = "";
                var stops = data.stops;
                var stop_name_list_for_all = new Array();
                stops.forEach(function (stop) {
                    var stop_node = new Stop(stop.stop_id, stop.stop_name, stop.stop_lat, stop.stop_lon);
                    // Set the stop_id_map
                    stop_id_map.set(stop.stop_id, stop_node);
                    // Set the stop_name_map
                    if (!stop_name_map.has(stop.stop_name)) {
                        var stop_list = new Array();
                        stop_list.push(stop_node);
                        stop_name_map.set(stop.stop_name, stop_list);
                        // Insert the stop_name_list
                        stop_name_list_for_all.push(stop.stop_name);
                    } else {
                        var stop_list = stop_name_map.get(stop.stop_name);
                        stop_list.push(stop_node);
                        stop_name_map.set(stop.stop_name, stop_list);
                    }
                });
                var stop_name_list_for_route = new Array();
                var route_name = document.getElementById("route-dropdown").value;
                for (var d = 0; d < route_map.get(route_name).length; d++) {
                    for (var e = 0; e < route_map.get(route_name)[d].length; e++) {
                        var stop_id = route_map.get(route_name)[d][e];
                        stop_name_list_for_route.push(stop_id_map.get(stop_id).stop_name);
                    }
                }
                stop_name_list_for_route = Array.from(new Set(stop_name_list_for_route));
                // Sort the stop_name_list
                stop_name_list_for_route.sort(function(a, b){
                    return a.localeCompare(b);
                });
                // Set the stops drop-down by stop_name_list
                stop_name_list_for_route.forEach(function (stop_name) {
                    options_stops += "<option value=\"" + stop_name + "\">" + stop_name + "</option>";
                });
                document.getElementById("origin-stop-dropdown").innerHTML = options_stops;
                document.getElementById("destination-stop-dropdown").innerHTML = options_stops;
                //for (var [key, value] of stop_name_map) {
                //    console.log(key + ' vs ' + value.length);
                //}
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

// Initialize routes data
function init_routes() {
    $.getJSON(ROOT + "/get_route_stop_relation", null, function (data) {
             var route_name_list = new Array();
             var options_routes = "";
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
                 route_name_list.push(route);
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

function select_route() {
    var options_stops = "";
    var stop_name_list_for_route = new Array();
    var route_name = document.getElementById("route-dropdown").value;
    for (var d = 0; d < route_map.get(route_name).length; d++) {
        for (var e = 0; e < route_map.get(route_name)[d].length; e++) {
            var stop_id = route_map.get(route_name)[d][e];
            stop_name_list_for_route.push(stop_id_map.get(stop_id).stop_name);
        }
    }
    stop_name_list_for_route = Array.from(new Set(stop_name_list_for_route));
    // Sort the stop_name_list
    stop_name_list_for_route.sort(function(a, b){
        return a.localeCompare(b);
    });
    // Set the stops drop-down by stop_name_list
    stop_name_list_for_route.forEach(function (stop_name) {
        options_stops += "<option value=\"" + stop_name + "\">" + stop_name + "</option>";
    });
    document.getElementById("origin-stop-dropdown").innerHTML = options_stops;
    document.getElementById("destination-stop-dropdown").innerHTML = options_stops;
}

function check_validity(route_name, origin_stop_id, destination_stop_id) {
    var index_origin_stop = -1;
    var index_destination_stop = -1;
    var index_direction = -1;
    var valid = false;
    for (var d = 0; d < route_map.get(route_name).length; d++) {
        index_origin_stop = -1;
        index_destination_stop = -1;
        index_direction = d;
        for (var e = 0; e < route_map.get(route_name)[d].length; e++) {
            if (origin_stop_id == route_map.get(route_name)[d][e]) {
                index_origin_stop = e;
            }
            if (destination_stop_id == route_map.get(route_name)[d][e]) {
                index_destination_stop = e;
            }
        }
        if (index_origin_stop != -1 && index_destination_stop != -1 && index_origin_stop < index_destination_stop) {
            valid = true;
            break;
        }
    }

    return {
        is_valid: valid,
        route_name: route_name,
        index_direction: index_direction,
        index_origin_stop: index_origin_stop,
        index_destination_stop: index_destination_stop
    }
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
    var origin_stop_name = document.getElementById("origin-stop-dropdown").value;
    var destination_stop_name = document.getElementById("destination-stop-dropdown").value;
    var origin_stop_id_list = stop_name_map.get(origin_stop_name);
    var destination_stop_id_list = stop_name_map.get(destination_stop_name);

    var info_validity;
    for (var i = 0; i < origin_stop_id_list.length; i++) {
        for (var j = 0; j < destination_stop_id_list.length; j++) {
            info_validity = check_validity(route_name, origin_stop_id_list[i].stop_id, destination_stop_id_list[j].stop_id);
            if (info_validity.is_valid == true) {
                //console.log("Search by route: valid input.");
                break;
            }
        }
        if (info_validity.is_valid == true) {
            break;
        }
    }

    if (info_validity.is_valid == true) {
        show_route(info_validity.route_name, info_validity.index_direction, info_validity.index_origin_stop, info_validity.index_destination_stop);
        predict_time(info_validity.route_name, info_validity.index_direction, info_validity.index_origin_stop, info_validity.index_destination_stop);
    } else {
        alert("Sorry, your origin stop or destination stop does not belong to the route. Please input again.");
    }
}
