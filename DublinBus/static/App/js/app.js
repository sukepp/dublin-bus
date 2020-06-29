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
    // The location of dublin
    var dublin = {
        lat: 53.35,
        lng: -6.26
    };
    // The map, centered at dublin
    map = new google.maps.Map(
        document.getElementById('map_location'), {
            zoom: 13,
            center: dublin,
            mapTypeId: 'roadmap'
        });
}

// Load the Visualization API and the corechart package.
google.charts.load('current', {
    'packages': ['corechart']
});

// The definition of Stop class
function Stop(stop_id, stop_name, pos_latitude, pos_longitude)
{
    this.stop_id = stop_id;
    this.stop_name = stop_name;
    this.pos_latitude = pos_latitude;
    this.pos_longitude = pos_longitude;
}

// Initialize static data including stops and route information
function init_stops_and_routes() {
    init_stops();
    init_routes();
}

// Initialize stops data
function init_stops() {
    $.getJSON(ROOT + "/get_stops", null, function (data) {
            if ('stops' in data) {
                var options_stops = "";
                var stops = data.stops;
                var stop_name_list = new Array();
                stops.forEach(function (stop) {
                    var stop_node = new Stop(stop.stop_id, stop.stop_name, stop.pos_latitude, stop.pos_longitude);
                    // Set the stop_id_map
                    stop_id_map.set(stop.stop_id, stop_node);
                    // Set the stop_name_map
                    if (!stop_name_map.has(stop.stop_name)) {
                        var stop_list = new Array();
                        stop_list.push(stop_node);
                        stop_name_map.set(stop.stop_name, stop_list);
                        // Insert the stop_name_list
                        stop_name_list.push(stop.stop_name);
                    } else {
                        var stop_list = stop_name_map.get(stop.stop_name);
                        stop_list.push(stop_node);
                        stop_name_map.set(stop.stop_name, stop_list);
                    }
                });
                // Sort the stop_name_list
                stop_name_list.sort(function(a, b){
                    return a.localeCompare(b);
                });
                // Set the stops drop-down by stop_name_list
                stop_name_list.forEach(function (stop_name) {
                    options_stops += "<option value=\"" + stop_name + "\">" + stop_name + "</option>";
                    //console.log(options_stops);
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
                 console.log(route);
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

function check_validity(route_name, origin_stop_id, destination_stop_id) {
    var index_origin_stop;
    var index_destination_stop;
    var index_direction;
    var valid = false;
    //console.log("param", origin_stop_id, destination_stop_id);
    for (var d = 0; d < route_map.get(route_name).length; d++) {
        index_origin_stop = -1;
        index_destination_stop = -1;
        direction = d;
        //console.log("direction");
        for (var e = 0; e < route_map.get(route_name)[d].length; e++) {
            //console.log(route_map.get(route_name)[d][e]);
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
        direction: index_direction,
        origin_stop: index_origin_stop,
        destination_stop: index_destination_stop
    }
}

function show_route() {
}

function predict_time() {

}

function search_by_route() {
    var route_name = document.getElementById("route-dropdown").value;
    var origin_stop_name = document.getElementById("origin-stop-dropdown").value;
    var destination_stop_name = document.getElementById("destination-stop-dropdown").value;
    var origin_stop_id_list = stop_name_map.get(origin_stop_name);
    var destination_stop_id_list = stop_name_map.get(destination_stop_name);

    var info_validity;
    //console.log("origin: ", origin_stop_id_list, ", dest: ", destination_stop_id_list);
    for (var i = 0; i < origin_stop_id_list.length; i++) {
        for (var j = 0; j < destination_stop_id_list.length; j++) {
            //console.log("origin: ", origin_stop_id_list[i], ", dest: ", destination_stop_id_list[j]);
            info_validity = check_validity(route_name, origin_stop_id_list[i].stop_id, destination_stop_id_list[j].stop_id);
            if (info_validity.is_valid == true) {
                console.log("info_valid");
                break;
            }
        }
        if (info_validity.is_valid == true) {
            break;
        }
    }

    if (info_validity.is_valid == true) {
        show_route();
        predict_time();
    } else {
        alert("Invalid Input");
    }
}
