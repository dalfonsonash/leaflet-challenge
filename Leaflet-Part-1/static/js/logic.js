// Set up the map
var map = L.map('map').setView([0, 0], 2);

// Create the tile layer with the map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 18
}).addTo(map);

// API endpoint
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform the GET request
d3.json(earthquakeUrl).then(function (data) {
  createFeatures(data.features);
});

// Function to create features and add them to the map
function createFeatures(earthquakeData) {
  L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      // Determine the size of the marker based on magnitude
      var magnitude = feature.properties.mag;
      var markerOptions = {
        radius: magnitude * 4,
        fillColor: getColor(feature.geometry.coordinates[2]), // Pass the depth value for color
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
      return L.circleMarker(latlng, markerOptions);
    },
    onEachFeature: function (feature, layer) {
      // Add a popup with additional information
      layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>Magnitude: " + feature.properties.mag + "<br>Depth: " + feature.geometry.coordinates[2] + "</p>");
    }
  }).addTo(map);

  // Create a legend
  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    var depths = [-10, 10, 30, 50, 70, 90];
    var labels = [];

    div.innerHTML += '<h4>Depth</h4>';

    for (var i = 0; i < depths.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(map);
}

// Function to determine the color based on depth
function getColor(depth) {
  return depth > 90 ? "#FF0000" :
    depth > 70 ? "#FF8C00" :
    depth > 50 ? "#FFA500" :
    depth > 30 ? "#FFD700" :
    depth > 10 ? "#FFFF00" :
    "#ADFF2F";
}
