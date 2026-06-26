const stationId = "IGEELO181";
const apiKey = "d86cfab380f54255acfab380f5b255a0";

const url = `https://api.weather.com/v2/pws/observations/current?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;

function format(value) {
  if (value === undefined || value === null || isNaN(value)) {
    return "N/A";
  }
  return Number(value).toFixed(1);
}

function windDirToCompass(deg) {
  if (deg === null || deg === undefined || isNaN(deg)) return "N/A";

  const dirs = [
    "N","NNE","NE","ENE",
    "E","ESE","SE","SSE",
    "S","SSW","SW","WSW",
    "W","WNW","NW","NNW"
  ];

  return dirs[Math.round(deg / 22.5) % 16];
}

let rainHistory = [];

function loadWeather() {
  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error("API response failed");
      }
      return res.json();
    })
    .then(data => {

      // ✅ SAFETY CHECK (this fixes your issue)
      if (!data.observations || data.observations.length === 0) {
