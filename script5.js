const stationId = "IGEELO181";
const apiKey = "d86cfab380f54255acfab380f5b255a0";

const url = `https://api.weather.com/v2/pws/observations/current?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;

let history = JSON.parse(localStorage.getItem("history")) || [];

// --- SAVE ---
function saveHistory() {
  localStorage.setItem("history", JSON.stringify(history));
}

// --- ADD DATA ---
function store(obs) {
  const now = new Date();
  const entry = {
    time: now.toISOString(),
    temp: obs.metric?.temp,
    humidity: obs.humidity,
    dew: obs.metric?.dewpt,
    wind: obs.metric?.windSpeed,
    pressure: obs.metric?.pressure,
    rain: obs.metric?.precipTotal,
    solar: obs.solarRadiation,
    uv: obs.uv
  };

  history.push(entry);

  // Keep ~3 days max
  const cutoff = Date.now() - (3 * 86400000);
  history = history.filter(d => new Date(d.time).getTime() > cutoff);

  saveHistory();
}

// --- FILTER BY DATE ---
function getDayData(dateStr) {
  return history.filter(d => d.time.startsWith(dateStr));
}

// --- EXTRACT SERIES ---
function series(data, key) {
  return data.map(d => ({
    x: new Date(d.time),
    y: d[key] ?? null
  }));
}

// --- CREATE CHART ---
function makeChart(id, label, data) {
  new Chart(document.getElementById(id), {
    type: 'line',
    data: {
      datasets: [{
        label: label,
        data: data,
        borderColor: '#38bdf8',
        tension: 0.2
      }]
    },
    options: {
      parsing: false,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'hour'
          }
        },
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

// --- DRAW ALL ---
function draw(dateStr) {
  const data = getDayData(dateStr);

  if (data.length === 0) return;

  makeChart("tempChart", "Temperature", series(data, "temp"));
  makeChart("humidityChart", "Humidity", series(data, "humidity"));
  makeChart("dewChart", "Dew Point", series(data, "dew"));
  makeChart("windChart", "Wind Speed", series(data, "wind"));
  makeChart("pressureChart", "Pressure", series(data, "pressure"));
  makeChart("rainChart", "Rainfall Total", series(data, "rain"));
  makeChart("solarChart", "Solar Radiation", series(data, "solar"));
  makeChart("uvChart", "UV Index", series(data, "uv"));
}

// --- FETCH LOOP ---
function loadWeather() {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const obs = data.observations[0];
      store(obs);

      const today = new Date().toISOString().slice(0,10);
      draw(today);
    });
}

// --- DATE PICKER ---
const picker = document.getElementById("datePicker");
const todayStr = new Date().toISOString().slice(0,10);
picker.value = todayStr;

picker.addEventListener("change", () => {
  draw(picker.value);
});

// --- RUN ---
loadWeather();
setInterval(loadWeather, 15000);
