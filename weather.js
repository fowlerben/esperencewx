const stationId = "IGEELO181";
const apiKey = "d86cfab380f54255acfab380f5b255a0";

const url = `https://api.weather.com/v2/pws/observations/current?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;

// --- Format helper ---
function format(value) {
  if (value === undefined || value === null || isNaN(value)) return "N/A";
  return parseFloat(value).toFixed(1);
}

// --- Wind compass ---
function windDirToCompass(deg) {
  if (deg === undefined || deg === null || isNaN(deg)) return "N/A";
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
}

// --- LOAD STORAGE ---
let extremes = JSON.parse(localStorage.getItem("extremes")) || {
  day: new Date().getDate()
};

let rainHistory = JSON.parse(localStorage.getItem("rainHistory")) || [];

// --- SAVE FUNCTIONS ---
function saveData() {
  localStorage.setItem("extremes", JSON.stringify(extremes));
  localStorage.setItem("rainHistory", JSON.stringify(rainHistory));
}

// --- RESET DAILY EXTREMES ---
function resetIfNewDay() {
  const today = new Date().getDate();
  if (extremes.day !== today) {
    extremes = { day: today };
  }
}

// --- UPDATE EXTREMES ---
function updateExtremes(obs) {
  resetIfNewDay();

  function update(key, value, type = "max") {
    if (isNaN(value)) return;
    if (extremes[key] === undefined) extremes[key] = value;

    if (type === "max") extremes[key] = Math.max(extremes[key], value);
    if (type === "min") extremes[key] = Math.min(extremes[key], value);
  }

  update("tempMax", obs.metric?.temp, "max");
  update("tempMin", obs.metric?.temp, "min");

  update("dpMax", obs.metric?.dewpt, "max");
  update("dpMin", obs.metric?.dewpt, "min");

  update("humMax", obs.humidity, "max");
  update("humMin", obs.humidity, "min");

  update("windMax", obs.metric?.windSpeed);
  update("gustMax", obs.metric?.windGust);

  update("pressureMax", obs.metric?.pressure, "max");
  update("pressureMin", obs.metric?.pressure, "min");

  update("solarMax", obs.solarRadiation);
  update("uvMax", obs.uv);
}

// --- RAIN CALCULATIONS ---
function updateRain(obs) {
  const now = Date.now();
  const total = Number(obs.metric?.precipTotal) || 0;

  rainHistory.push({ time: now, total });

  rainHistory = rainHistory.filter(r => now - r.time < 86400000);
}

function calcRain(ms) {
  const now = Date.now();
  const current = rainHistory[rainHistory.length - 1];

  if (!current) return 0;

  const past = rainHistory.find(r => now - r.time >= ms);
  if (!past) return 0;

  return Math.max(0, current.total - past.total);
}

// --- MAIN LOAD ---
function loadWeather() {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data || !data.observations || data.observations.length === 0) {
        throw new Error("No data");
      }

      const obs = data.observations[0];

      updateExtremes(obs);
      updateRain(obs);
      saveData();

      const temp = format(obs.metric?.temp);
      const humidity = format(obs.humidity);
      const dewPoint = format(obs.metric?.dewpt);

      const windSpeed = format(obs.metric?.windSpeed);
      const windDeg = obs.winddir;

      let windDisplay = "N/A";
      if (!isNaN(windDeg)) {
        windDisplay = `${parseFloat(windDeg).toFixed(1)}° (${windDirToCompass(windDeg)})`;
      }

      const pressure = format(obs.metric?.pressure);
      const rainToday = format(obs.metric?.precipTotal);
      const solar = format(obs.solarRadiation);
      const uv = format(obs.uv);

      const rain15 = format(calcRain(15 * 60 * 1000));
      const rain1h = format(calcRain(60 * 60 * 1000));
      const rain24 = format(calcRain(24 * 60 * 60 * 1000));

      document.getElementById("weather").innerHTML = `
        <div class="grid">

          <div class="card">
            <div class="title">Temperature</div>
            <div class="value">${temp}°</div>
            <div class="small">Max ${format(extremes.tempMax)} / Min ${format(extremes.tempMin)}</div>
          </div>

          <div class="card">
            <div class="title">Humidity</div>
            <div class="value">${humidity}%</div>
            <div class="small">Max ${format(extremes.humMax)} / Min ${format(extremes.humMin)}</div>
          </div>

          <div class="card">
            <div class="title">Dew Point</div>
            <div class="value">${dewPoint}°</div>
            <div class="small">Max ${format(extremes.dpMax)} / Min ${format(extremes.dpMin)}</div>
          </div>

          <div class="card">
            <div class="title">Wind</div>
            <div class="value">${windSpeed} km/h</div>
            <div class="small">${windDisplay}</div>
            <div class="small">Max ${format(extremes.windMax)} | Gust ${format(extremes.gustMax)}</div>
          </div>

          <div class="card">
            <div class="title">Pressure</div>
            <div class="value">${pressure} hPa</div>
            <div class="small">Max ${format(extremes.pressureMax)} / Min ${format(extremes.pressureMin)}</div>
          </div>

          <div class="card">
            <div class="title">Rainfall Today</div>
            <div class="value">${rainToday} mm</div>
            <div class="small">15m: ${rain15} | 1h: ${rain1h} | 24h: ${rain24}</div>
          </div>

          <div class="card">
            <div class="title">Solar Radiation</div>
            <div class="value">${solar} W/m²</div>
            <div class="small">Max ${format(extremes.solarMax)}</div>
          </div>

          <div class="card">
            <div class="title">UV Index</div>
            <div class="value">${uv}</div>
            <div class="small">Max ${format(extremes.uvMax)}</div>
          </div>

        </div>
      `;
    })
    .catch(() => {
      document.getElementById("weather").innerText =
        "Error loading weather data";
    });
}

loadWeather();
setInterval(loadWeather, 15000);
