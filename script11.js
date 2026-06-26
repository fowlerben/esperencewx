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

// ✅ LOAD FROM LOCAL STORAGE
let extremes = {
  tempMax: null,
  tempMin: null,
  dpMax: null,
  dpMin: null,
  humMax: null,
  humMin: null,
  windMax: null,
  gustMax: null,
  pressureMax: null,
  pressureMin: null,
  solarMax: null,
  uvMax: null,
  day: new Date().getDate()
};

const saved = localStorage.getItem("extremes");
if (saved) {
  try {
    extremes = JSON.parse(saved);
  } catch {}
}

function saveExtremes() {
  localStorage.setItem("extremes", JSON.stringify(extremes));
}

function updateExtremes(obs) {
  const today = new Date().getDate();

  // Reset at midnight
  if (extremes.day !== today) {
    extremes = {
      tempMax: null,
      tempMin: null,
      dpMax: null,
      dpMin: null,
      humMax: null,
      humMin: null,
      windMax: null,
      gustMax: null,
      pressureMax: null,
      pressureMin: null,
      solarMax: null,
      uvMax: null,
      day: today
    };
  }

  const temp = obs.metric?.temp;
  const dp = obs.metric?.dewpt;
  const hum = obs.humidity;
  const wind = obs.metric?.windSpeed;
  const gust = obs.metric?.windGust;
  const pressure = obs.metric?.pressure;
  const solar = obs.solarRadiation;
  const uv = obs.uv;

  if (!isNaN(temp)) {
    extremes.tempMax = extremes.tempMax === null ? temp : Math.max(extremes.tempMax, temp);
    extremes.tempMin = extremes.tempMin === null ? temp : Math.min(extremes.tempMin, temp);
  }

  if (!isNaN(dp)) {
    extremes.dpMax = extremes.dpMax === null ? dp : Math.max(extremes.dpMax, dp);
    extremes.dpMin = extremes.dpMin === null ? dp : Math.min(extremes.dpMin, dp);
  }

  if (!isNaN(hum)) {
    extremes.humMax = extremes.humMax === null ? hum : Math.max(extremes.humMax, hum);
    extremes.humMin = extremes.humMin === null ? hum : Math.min(extremes.humMin, hum);
  }

  if (!isNaN(wind)) {
    extremes.windMax = extremes.windMax === null ? wind : Math.max(extremes.windMax, wind);
  }

  if (!isNaN(gust)) {
    extremes.gustMax = extremes.gustMax === null ? gust : Math.max(extremes.gustMax, gust);
  }

  if (!isNaN(pressure)) {
    extremes.pressureMax = extremes.pressureMax === null ? pressure : Math.max(extremes.pressureMax, pressure);
    extremes.pressureMin = extremes.pressureMin === null ? pressure : Math.min(extremes.pressureMin, pressure);
  }

  if (!isNaN(solar)) {
    extremes.solarMax = extremes.solarMax === null ? solar : Math.max(extremes.solarMax, solar);
  }

  if (!isNaN(uv)) {
    extremes.uvMax = extremes.uvMax === null ? uv : Math.max(extremes.uvMax, uv);
  }

  // ✅ SAVE AFTER UPDATE
  saveExtremes();
}

function loadWeather() {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const obs = data.observations[0];

      updateExtremes(obs);

      const temp = format(obs.metric?.temp);
      const humidity = format(obs.humidity);
      const dewPoint = format(obs.metric?.dewpt);
      const windSpeed = format(obs.metric?.windSpeed);

      const windDeg = obs.winddir;
      let windDisplay = "N/A";

      if (windDeg !== undefined && !isNaN(windDeg)) {
        windDisplay = `${parseFloat(windDeg).toFixed(1)}° (${windDirToCompass(windDeg)})`;
      }

      const pressure = format(obs.metric?.pressure);
      const rainfall = format(obs.metric?.precipTotal);
      const solar = format(obs.solarRadiation);
      const uv = format(obs.uv);

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
            <div class="value">${rainfall} mm</div>
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
      document.getElementById("weather").innerText = "Error loading weather data";
    });
}

loadWeather();
setInterval(loadWeather, 15000);
