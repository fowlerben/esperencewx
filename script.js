const stationId = "IGEELO181";
const apiKey = "d86cfab380f54255acfab380f5b255a0";

const url = `https://api.weather.com/v2/pws/observations/current?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;

function format(value) {
  if (value === undefined || value === null || isNaN(value)) {
    return "N/A";
  }
  return Number(value).toFixed(1);
}

// --- Wind direction to compass ---
function windDirToCompass(deg) {
  if (deg === undefined || deg === null) return "N/A";
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
}

// --- Rain storage ---
let rainHistory = []; // {time, total}

// --- Load function ---
function loadWeather() {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const obs = data.observations[0];

      const now = Date.now();
      const rainTotalRaw = obs.metric?.precipTotal || 0;

      // --- Store rainfall history ---
      rainHistory.push({ time: now, total: rainTotalRaw });

      // Keep only last 24h
      rainHistory = rainHistory.filter(r => now - r.time < 86400000);

      // --- Helper: calculate rainfall over period ---
      function calcRain(ms) {
        const past = rainHistory.find(r => now - r.time >= ms);
        if (!past) return 0;
        return rainTotalRaw - past.total;
      }

      const rain15m = calcRain(15 * 60 * 1000);
