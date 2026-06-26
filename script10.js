const stationId = "IGEELO181";
const apiKey = "d86cfab380f54255acfab380f5b255a0";

const url = `https://api.weather.com/v2/pws/observations/current?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;

function format(value) {
  if (value === undefined || value === null || isNaN(value)) return "N/A";
  return parseFloat(value).toFixed(1);
}

function windDirToCompass(deg) {
  if (deg === undefined || deg === null || isNaN(deg)) return "N/A";
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function loadWeather() {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const obs = data.observations[0];

      const temp = format(obs.metric?.temp);
      const humidity = format(obs.humidity);
      const dew = format(obs.metric?.dewpt);
      const wind = format(obs.metric?.windSpeed);
      const pressure = format(obs.metric?.pressure);
      const rain = format(obs.metric?.precipTotal);
      const solar = format(obs.solarRadiation);
      const uv = format(obs.uv);

      let windDisplay = "N/A";
      if (!isNaN(obs.winddir)) {
        windDisplay =
          `${parseFloat(obs.winddir).toFixed(1)}° (${windDirToCompass(obs.winddir)})`;
      }

      document.getElementById("weather").innerHTML = `
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
            <div class="title">Dew Point</div>
            <div class="value">${dew}°C</div>
          </div>

          <div class="card">
            <div class="title">Wind</div>
            <div class="value">${wind} km/h</div>
            <div>${windDisplay}</div>
          </div>

          <div class="card">
            <div class="title">Pressure</div>
            <div class="value">${pressure} hPa</div>
          </div>

          <div class="card">
            <div class="title">Rainfall Today</div>
            <div class="value">${rain} mm</div>
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
    .catch(() => {
      document.getElementById("weather").innerText = "Error loading data";
    });
}

loadWeather();
setInterval(loadWeather, 15000);
