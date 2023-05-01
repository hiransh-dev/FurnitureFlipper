const map = L.map("map");
// Initializes map

map.setView([51.505, -0.09], 13);
// Sets initial coordinates and zoom level

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// Sets map data source and associates with map

let marker, circle, zoomed;

navigator.geolocation.watchPosition(success, error);

function success(pos) {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  const accuracy = pos.coords.accuracy;

  if (marker) {
    map.removeLayer(marker);
    map.removeLayer(circle);
  }
  // Removes any existing marker and circule (new ones about to be set)

  marker = L.marker([lat, lng]).addTo(map);
  circle = L.circle([lat, lng], { radius: accuracy }).addTo(map);
  // Adds marker to the map and a circle for accuracy

  if (!zoomed) {
    zoomed = map.fitBounds(circle.getBounds());
  }
  // Set zoom to boundaries of accuracy circle

  map.setView([lat, lng]);
  // Set map focus to current user position

  document.getElementById("latitude").value = lat;
  document.getElementById("longitude").value = lng;
}

function error(err) {
  if (err.code === 1) {
    alert("Please allow geolocation access");
  } else {
    alert("Cannot get current location");
  }
}

// module.exports = { lat, lng };
