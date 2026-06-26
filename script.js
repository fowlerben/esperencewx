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

// ✅ Daily extremes storage
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
  day: new Date().getDate()
};

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
      day: today
    };
  }

  const temp = obs.metric?.temp;
  const dp = obs.metric?.dewpt;
  const hum = obs.humidity;
  const wind = obs.metric?.windSpeed;
  const gust = obs.metric?.windGust;
  const pressure = obs.metric?.pressure;

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

      // ✅ Wind direction
      const windDeg = obs.winddir;
      let windDisplay = "N/A";

      if (windDeg !== undefined && !isNaN(windDeg)) {
        const compass = windDirToCompass(windDeg);
        windDisplay = `${parseFloat(windDeg).toFixed(1)}° (${compass})`;
      }

      const pressure = format(obs.metric?.pressure);
      const rainfallToday = format(obs.metric?.precipTotal);

      const solar = format(obs.solarRadiation);
      const uv = format(obs.uv);

      document.getElementById("weather").innerHTML = `
        <h2>Current Conditions</h2>

        <p><strong>Temperature:</strong> ${temp} °C (Max: ${format(extremes.tempMax)} / Min: ${format(extremes.tempMin)})</p>
        <p><strong>Humidity:</strong> ${humidity} % (Max: ${format(extremes.humMax)} / Min: ${format(extremes.humMin)})</p>
        <p><strong>Dew Point:</strong> ${dewPoint} °C (Max: ${format(extremes.dpMax)} / Min: ${format(extremes.dpMin)})</p>

        <p><strong>Wind:</strong> ${windSpeed} km/h (${windDisplay})</p>
        <p><strong>Max Wind:</strong> ${format(extremes.windMax)} km/h</p>
        <p><strong>Max Gust:</strong> ${format(extremes.gustMax)} km/h</p>

        <p><strong>Pressure:</strong> ${pressure} hPa (Max: ${format(extremes.pressureMax)} / Min: ${format(extremes.pressureMin)})</p>

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

// ✅ Run immediately
loadWeather();

// ✅ Refresh every 15 seconds
setInterval(loadWeather, 15000);
