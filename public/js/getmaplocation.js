const map = L.map("map");
// Initializes map

lat = document.getElementById("latitude").value;
lng = document.getElementById("longitude").value;

map.setView([lat, lng], 13);
marker = L.marker([lat, lng]).addTo(map);

// Sets initial coordinates and zoom level

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// Sets map data source and associates with map
