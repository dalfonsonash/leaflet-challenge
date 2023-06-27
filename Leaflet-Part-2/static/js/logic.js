// Set up the map
var map = L.map('map').setView([0, 0], 2);

// Create the tile layer with the map tiles
var baseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 18
}).addTo(map);

// Create additional base maps
var satelliteMap = L.tileLayer('https://tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.opentopomap.org/">OpenTopoMap</a> contributors',
  maxZoom: 18
});

// Create the earthquake overlay
var earthquakeLayer = L.geoJSON(null, {
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
});

// Create the tectonic plates overlay
var tectonicLayer = L.geoJSON(null, {
  style: function (feature) {
    return {
      color: '#FF0000',
      weight: 2
    };
  }
});

// API endpoints
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform the GET requests
Promise.all([
  d3.json(earthquakeUrl),
  d3.json(tectonicUrl)
]).then(function (data) {
  createFeatures(data[0].features, data[1].features);
});

// Function to create features and add them to the map
function createFeatures(earthquakeData, tectonicData) {
  earthquakeLayer.addData(earthquakeData).addTo(map);
  tectonicLayer.addData(tectonicData).addTo(map);

  // Create overlays
  var overlays = {
    "Earthquakes": earthquakeLayer,
    "Tectonic Plates": tectonicLayer
  };

  // Create layer controls
  L.control.layers({ "Base Map": baseMap, "Satellite Map": satelliteMap }, overlays, { collapsed: false}).addTo(map);

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
