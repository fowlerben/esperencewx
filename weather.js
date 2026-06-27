const stationId = "YOUR_WEATHERLINK_STATION_ID";
const apiKey = "YOUR_WEATHERLINK_API_KEY";

// ✅ WeatherLink endpoint
const url = `https://api.weatherlink.com/v2/current/${stationId}?api-key=${apiKey}`;

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

// --- SAVE ---
function saveData() {
  localStorage.setItem("extremes", JSON.stringify(extremes));
  localStorage.setItem("rainHistory", JSON.stringify(rainHistory));
}

// --- RESET DAILY ---
function resetIfNewDay() {
  const today = new Date().getDate();
  if (extremes.day !== today) {
    extremes = { day: today };
  }
}

// --- UPDATE EXTREMES ---
function updateExtremes(data) {
  resetIfNewDay();

  function update(key, value, type = "max") {
    if (isNaN(value)) return;
    if (extremes[key] === undefined) extremes[key] = value;

    if (type === "max") extremes[key] = Math.max(extremes[key], value);
    if (type === "min") extremes[key] = Math.min(extremes[key], value);
  }

  update("tempMax", data.temp, "max");
  update("tempMin", data.temp, "min");

  update("dpMax", data.dew_point, "max");
  update("dpMin", data.dew_point, "min");

  update("humMax", data.humidity, "max");
  update("humMin", data.humidity, "min");

  update("windMax", data.wind_speed);
  update("gustMax", data.wind_gust);

  update("pressureMax", data.barometric_pressure, "max");
  update("pressureMin", data.barometric_pressure, "min");

  update("solarMax", data.solar_radiation);
  update("uvMax", data.uv_index);
}

// --- RAIN ---
function updateRain(data) {
  const now = Date.now();
  const total = Number(data.rainfall_daily) || 0;

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
    .then(json => {

      if (!json || !json.sensors) {
        throw new Error("No station data");
      }

      // ✅ WeatherLink structure
      const sensor = json.sensors[0].data[0];

      const data = {
        temp: sensor.temp,
        humidity: sensor.hum,
        dew_point: sensor.dew_point,
        wind_speed: sensor.wind_speed,
        wind_dir: sensor.wind_dir,
        wind_gust: sensor.wind_gust,
        barometric_pressure: sensor.bar,
        rainfall_daily: sensor.rainfall_daily,
        solar_radiation: sensor.solar_rad,
        uv_index: sensor.uv
      };

      updateExtremes(data);
      updateRain(data);
      saveData();

      let windDisplay = "N/A";
      if (!isNaN(data.wind_dir)) {
        windDisplay =
          `${parseFloat(data.wind_dir).toFixed(1)}° (${windDirToCompass(data.wind_dir)})`;
      }

      const rain15 = format(calcRain(15 * 60 * 1000));
      const rain1h = format(calcRain(60 * 60 * 1000));
      const rain24 = format(calcRain(24 * 60 * 60 * 1000));

      document.getElementById("weather").innerHTML = `
        <div class="grid">

          <div class="card">
            <div class="title">Temperature</div>
            <div class="value">${format(data.temp)}°</div>
            <div class="small">Max ${format(extremes.tempMax)} / Min ${format(extremes.tempMin)}</div>
          </div>

          <div class="card">
            <div class="title">Humidity</div>
            <div class="value">${format(data.humidity)}%</div>
          </div>

          <div class="card">
            <div class="title">Dew Point</div>
            <div class="value">${format(data.dew_point)}°</div>
          </div>

          <div class="card">
            <div class="title">Wind</div>
            <div class="value">${format(data.wind_speed)} km/h</div>
            <div class="small">${windDisplay}</div>
          </div>

          <div class="card">
            <div class="title">Pressure</div>
            <div class="value">${format(data.barometric_pressure)} hPa</div>
          </div>

          <div class="card">
            <div class="title">Rainfall Today</div>
            <div class="value">${format(data.rainfall_daily)} mm</div>
            <div class="small">15m: ${rain15} | 1h: ${rain1h} | 24h: ${rain24}</div>
          </div>

          <div class="card">
            <div class="title">Solar Radiation</div>
            <div class="value">${format(data.solar_radiation)} W/m²</div>
          </div>

          <div class="card">
            <div class="title">UV Index</div>
            <div class="value">${format(data.uv_index)}</div>
          </div>

        </div>
      `;
    })
    .catch(() => {
      document.getElementById("weather").innerText =
        "Error loading WeatherLink data";
    });
}

loadWeather();
setInterval(loadWeather, 15000);
``
