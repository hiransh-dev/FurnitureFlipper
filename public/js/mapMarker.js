const map_all = L.map("map_all");

map_all.setView([51.505, -0.09], 5);

fetch("/furniture/furnituremaps")
  .then((response) => response.json())
  .then((data) => {
    for (let j = 0; j < data.length; j++) {
      marker = L.marker([data[j].lat, data[j].lng])
        .addTo(map_all)
        .bindPopup(
          data[j].title +
            "<br><a href=/furniture/" +
            data[j]._id +
            ">Check it out</a>"
        );
      console.log(data[j].title);
    }
  })
  .catch((error) => console.error(error));

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map_all);
