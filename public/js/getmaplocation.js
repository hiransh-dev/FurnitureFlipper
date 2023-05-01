const map = L.map("map");
// Initializes map

lat = document.getElementById("latitude").value;
lng = document.getElementById("longitude").value;

map.setView([lat, lng], 13);
marker = L.marker([lat, lng]).addTo(map);
// marker = L.marker([51.505, -0.09]).addTo(map);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);
