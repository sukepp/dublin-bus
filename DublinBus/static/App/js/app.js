var map;

// Initialize and add the map
// Declare constants and global variables
const chart_colors = ['#59b75c', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6'];
const backgroundColor = '#fff';
// Init setup the google map
function initMap() {
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

