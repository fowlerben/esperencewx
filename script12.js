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

      const obs = data.observations[0];

      // --- values ---
      const temp = format(obs.metric?.temp);
      const humidity = format(obs.humidity);
      const dewPoint = format(obs.metric?.dewpt);
      const windSpeed = format(obs.metric?.windSpeed);
      const pressure = format(obs.metric?.pressure);
      const rainfall = format(obs.metric?.precipTotal);
      const solar = format(obs.solarRadiation);
      const uv = format(obs.uv);

      let windDisplay = "N/A";
      if (!isNaN(obs.winddir)) {
        windDisplay =
          `${parseFloat(obs.winddir).toFixed(1)}° (${windDirToCompass(obs.winddir)})`;
      }

      // ✅ ALWAYS render something
      document.getElementById("weather").innerHTML = `
        <div class="grid">

          <div class="card">
            <div class="title">Temperature</div>
            <div class="value">${temp}°</div>
          </div>

          <div class="card">
            <div class="title">Humidity</div>
            <div class="value">${humidity}%</div>
          </div>

          <div class="card">
            <div class="title">Dew Point</div>
            <div class="value">${dewPoint}°</div>
          </div>

          <div class="card">
            <div class="title">Wind</div>
            <div class="value">${windSpeed} km/h</div>
            <div class="small">${windDisplay}</div>
          </div>

          <div class="card">
            <div class="title">Pressure</div>
            <div class="value">${pressure} hPa</div>
          </div>

          <div class="card">
            <div class="title">Rainfall Today</div>
            <div class="value">${rainfall} mm</div>
          </div>

          <div class="card">
            <div class="title">Solar Radiation</div>
            <div class="value">${solar}</div>
          </div>

          <div class="card">
            <div class="title">UV Index</div>
            <div class="value">${uv}</div>
          </div>

        </div>
      `;
    })
    .catch(err => {
      console.error(err);

      document.getElementById("weather").innerText =
        "Weather data unavailable (API or connection issue)";
    });
}

loadWeather();
setInterval(loadWeather, 15000);
``
