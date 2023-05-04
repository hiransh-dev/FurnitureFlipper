const map_current = L.map("map_current");

map_current.setView([51.505, -0.09], 5);

const lat = [];
const lng = [];
const title = [];
const link = [];
let j = 0;

const get_all_img_blocks = document.querySelectorAll(".imgblock");
get_all_img_blocks.forEach(() => {
  lat.push(document.getElementById("latitude" + j).value);
  lng.push(document.getElementById("longitude" + j).value);
  title.push(document.getElementById("title" + j).textContent);
  link.push(document.getElementById("linkTo" + j).href);
  marker = L.marker([lat[j], lng[j]])
    .addTo(map_current)
    .bindPopup(title[j] + "<br><a href=" + link[j] + ">Check it out</a>");
  // console.log(lat[j]);
  // console.log(lng[j]);
  j++;
});

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map_current);
