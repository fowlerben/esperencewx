const stationId = "IGEELO181";
const apiKey = "d86cfab380f54255acfab380f5b255a0";

const url = `https://api.weather.com/v2/pws/observations/current?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;

// --- helpers ---
function format(v) {
  if (v === undefined || v === null || isNaN(v)) return "N/A";
  return parseFloat(v).toFixed(1);
}

function windDirToCompass(deg) {
  if (!deg && deg !== 0) return "N/A";
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
}

// --- storage ---
let history = JSON.parse(localStorage.getItem("history")) || [];

// --- save ---
function saveHistory() {
  localStorage.setItem("history", JSON.stringify(history));
}

// --- store observation ---
function store(obs) {
  history.push({
    time: new Date().toISOString(),
    temp: obs.metric?.temp,
    humidity: obs.humidity,
    wind: obs.metric?.windSpeed,
    pressure: obs.metric?.pressure
  });

  // keep only today
  const today = new Date().toISOString().slice(0,10);
  history = history.filter(d => d.time.startsWith(today));

  saveHistory();
}

// --- chart cleanup ---
let charts = [];

function clearCharts() {
  charts.forEach(c => c.destroy());
  charts = [];
}

// --- build chart ---
function makeChart(id, label, data) {
  const chart = new Chart(document.getElementById(id), {
    type: "line",
    data: {
      datasets: [{
        label,
        data,
        borderColor: "#38bdf8",
        tension: 0.2
      }]
    },
    options: {
      parsing: false,
      scales: {
        x: { type: "time", time: { unit: "hour" } },
        y: { beginAtZero: false }
      }
    }
  });

  charts.push(chart);
}

// --- draw charts ---
function drawCharts() {
  if (history.length === 0) return;

  clearCharts();

  const mapSeries = key =>
    history.map(d => ({ x: new Date(d.time), y: d[key] ?? null }));

  makeChart("tempChart", "Temperature", mapSeries("temp"));
  makeChart("humidityChart", "Humidity", mapSeries("humidity"));
  makeChart("windChart", "Wind Speed", mapSeries("wind"));
  makeChart("pressureChart", "Pressure", mapSeries("pressure"));
}

// --- main load ---
function loadWeather() {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const obs = data.observations[0];

      // ✅ store history
      store(obs);

      // ✅ LIVE DASHBOARD
      const temp = format(obs.metric?.temp);
      const humidity = format(obs.humidity);
      const windSpeed = format(obs.metric?.windSpeed);
      const pressure = format(obs.metric?.pressure);
      const rain = format(obs.metric?.precipTotal);

      const windDeg = obs.winddir;
      let windDisplay = "N/A";

      if (!isNaN(windDeg)) {
        windDisplay = `${parseFloat(windDeg).toFixed(1)}° (${windDirToCompass(windDeg)})`;
      }

      document.getElementById("dashboard").innerHTML = `
        <div class="grid">

          <div class="card">
            <div class="title">Temperature</div>
            <div class="value">${temp}°C</div>
          </div>

          <div class="card">
            <div class="title">Humidity</div>
            <div class="value">${humidity}%</div>
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
            <div class="value">${rain} mm</div>
          </div>

        </div>
      `;

      // ✅ redraw charts
      drawCharts();
    })
    .catch(() => {
      document.getElementById("dashboard").innerText =
        "Error loading weather data";
    });
}

// run
loadWeather();
setInterval(loadWeather, 15000);
