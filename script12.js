const stationId = "IGEELO181";
const apiKey = "d86cfab380f54255acfab380f5b255a0";

const url = `https://api.weather.com/v2/pws/observations/current?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;

function format(value) {
  if (value === undefined || value === null || isNaN(value)) {
    return "N/A";
  }
  return parseFloat(value).toFixed(1);
}

function windDirToCompass(deg) {
  if (deg === undefined || deg === null || isNaN(deg)) return "N/A";
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
}

// ✅ load saved data (safe fallback)
let extremes = JSON.parse(localStorage.getItem("extremes") || "{}");
let rainHistory = JSON.parse(localStorage.getItem("rainHistory") || "[]");

function saveData() {
  localStorage.setItem("extremes", JSON.stringify(extremes));
  localStorage.setItem("rainHistory", JSON.stringify(rainHistory));
}

function loadWeather() {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("API error");
      return res.json();
    })
    .then(data => {

      // ✅ CRITICAL FIX
      if (!data || !data.observations || data.observations.length === 0) {
        throw new Error("No observation data");
      }

