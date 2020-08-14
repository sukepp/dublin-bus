// Set the root location of server
ROOT = window.location.origin;

var stop_id_map = new Map();
var stop_name_map = new Map();
var route_map = new Map();

function Stop(stop_id, stop_name, pos_latitude, pos_longitude)
{
    this.stop_id = stop_id;
    this.stop_name = stop_name;
    this.pos_latitude = pos_latitude;
    this.pos_longitude = pos_longitude;
}

// Init information
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
                test();
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

// Get date
function get_date() {
    var time = new Date();
    var day = ("0" + time.getDate()).slice(-2);
    var month = ("0" + (time.getMonth() + 1)).slice(-2);
    var today = time.getFullYear() + "-" + (month) + "-" + (day);
    return today;
}

// Get time
function get_time() {
    var date = new Date();
    var hour = ("0" + date.getHours()).slice(-2);
    var minute = ("0" + date.getMinutes()).slice(-2);
    var time = hour + ":" + minute;
    return time;
}

// Predict time
function test() {
    var route_name_list = [];

    // Get the routes
    for (var [key, value] of route_map) {
        route_name_list.push(key);
    }

    if (route_name_list.length != 0) {
        // Sort the route_name_list
        route_name_list.sort(function(a, b){
            return a.localeCompare(b);
        });
        // Test
        route_name_list.forEach(function (route_name) {
            //if (String(route_name) >= '7' && String(route_name) <= '9') {
            if (String(route_name) == '47') {
                // Direction 0
                if (route_map.has(route_name)) {
                    if (route_map.get(route_name).length == 1) {
                        var len = route_map.get(route_name)[0].length;
                        for (var i = 0; i < 5; i++) {
                            var index_origin = Math.floor(Math.random() * (len));
                            var index_destination = Math.floor(Math.random() * (len));
                            if (index_origin > index_destination) {
                                var tmp = index_origin;
                                index_origin = index_destination;
                                index_destination = tmp;
                            }
                            predict_time(route_name, 0, index_origin, index_destination);
                        }
                    } else {
                        var len = route_map.get(route_name)[0].length;
                        for (var i = 0; i < 3; i++) {
                            var index_origin = Math.floor(Math.random() * (len));
                            var index_destination = Math.floor(Math.random() * (len));
                            if (index_origin > index_destination) {
                                var tmp = index_origin;
                                index_origin = index_destination;
                                index_destination = tmp;
                            }
                            predict_time(route_name, 0, index_origin, index_destination);
                        }
                        // Direction 1
                        var len = route_map.get(route_name)[1].length;
                        for (var i = 0; i < 2; i++) {
                            var index_origin = Math.floor(Math.random() * (len));
                            var index_destination = Math.floor(Math.random() * (len));
                            if (index_origin > index_destination) {
                                var tmp = index_origin;
                                index_origin = index_destination;
                                index_destination = tmp;
                            }
                            predict_time(route_name, 1, index_origin, index_destination);
                        }
                    }
                }
            }
        });
    }
}


function predict_time(route_name, index_direction, index_origin_stop, index_destination_stop) {
    var origin_stop = stop_id_map.get(route_map.get(route_name)[index_direction][index_origin_stop]);
    var destination_stop = stop_id_map.get(route_map.get(route_name)[index_direction][index_destination_stop]);

    var date = get_date();
    var time = get_time();

    $.getJSON(ROOT + "/predict_time/" + route_name + "/" + index_origin_stop + "/" + origin_stop.stop_id + '/' + index_destination_stop + "/" + destination_stop.stop_id
        + "/" + date + "/" + time, null, function (data) {
        var prediction_time = data.prediction_time;
        var content = document.getElementById("test_result").innerHTML;
        content += "<div style=\"font-size:16px\">" + route_name + " " + origin_stop.stop_name + " " + destination_stop.stop_name + " "
            + Number(index_destination_stop - index_origin_stop) + " " + prediction_time + " Y</div>";
        document.getElementById("test_result").innerHTML = content;
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

