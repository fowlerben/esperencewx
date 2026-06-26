const stationId = "IGEELO181";
const apiKey = "d86cfab380f54255acfab380f5b255a0";

const url = `https://api.weather.com/v2/pws/observations/current?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;

function format(value) {
  if (value === undefined || value === null || isNaN(value)) {
    return "N/A";
  }
  return parseFloat(value).toFixed(1);
}

// ✅ Compass conversion
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
      const dewPoint = format(obs.metric?.dewpt);

      const windSpeed = format(obs.metric?.windSpeed);

      // ✅ Wind direction (fixed)
      const windDeg = obs.winddir;
      let windDisplay = "N/A";

      if (windDeg !== undefined && !isNaN(windDeg)) {
        const compass = windDirToCompass(windDeg);
        windDisplay = `${parseFloat(windDeg).toFixed(1)}° (${compass})`;
      }

      const pressure = format(obs.metric?.pressure);

      // ✅ Rainfall = TODAY
      const rainfallToday = format(obs.metric?.precipTotal);

      const solar = format(obs.solarRadiation);
      const uv = format(obs.uv);

      document.getElementById("weather").innerHTML = `
        <h2>Current Conditions</h2>

        <p><strong>Temperature:</strong> ${temp} °C</p>
        <p><strong>Humidity:</strong> ${humidity} %</p>
        <p><strong>Dew Point:</strong> ${dewPoint} °C</p>

        <p><strong>Wind:</strong> ${windSpeed} km/h (${windDisplay})</p>

        <p><strong>Pressure:</strong> ${pressure} hPa</p>

        <h3>Rain</h3>
        <p><strong>Rainfall Today:</strong> ${rainfallToday} mm</p>

        <h3>Solar</h3>
        <p><strong>Solar Radiation:</strong> ${solar} W/m²</p>
        <p><strong>UV Index:</strong> ${uv}</p>
      `;
    })
    .catch(() => {
      document.getElementById("weather").innerText =
        "Error loading weather data";
    });
}

// ✅ Run once
loadWeather();

// ✅ Refresh every 15 seconds
setInterval(loadWeather, 15000);
``
