const stationId = "IGEELO181";
const apiKey = "d86cfab380f54255acfab380f5b255a0";

const url = `https://api.weather.com/v2/pws/observations/current?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;

function format(value) {
  if (value === undefined || value === null || isNaN(value)) {
    return "N/A";
  }
  return Number(value).toFixed(1);
}

function windDirToCompass(deg) {
  if (deg === null || deg === undefined || isNaN(deg)) return "N/A";

  const dirs = [
    "N","NNE","NE","ENE",
    "E","ESE","SE","SSE",
    "S","SSW","SW","WSW",
    "W","WNW","NW","NNW"
  ];

  return dirs[Math.round(deg / 22.5) % 16];
}

let rainHistory = [];

function loadWeather() {
  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error("API response failed");
      }
      return res.json();
    })
    .then(data => {

      // ✅ SAFETY CHECK (this fixes your issue)
      if (!data.observations || data.observations.length === 0) {
        throw new Error("No observation data returned");
      }

      const obs = data.observations[0];

      const now = Date.now();
      const rainTotalRaw = Number(obs.metric?.precipTotal) || 0;

      rainHistory.push({ time: now, total: rainTotalRaw });
      rainHistory = rainHistory.filter(r => now - r.time < 86400000);

      function calcRain(ms) {
        const past = rainHistory.find(r => now - r.time >= ms);
        if (!past) return 0;
        return Math.max(0, rainTotalRaw - past.total);
      }

      const rain15m = calcRain(15 * 60 * 1000);
      const rain1h = calcRain(60 * 60 * 1000);
      const rain24h = calcRain(24 * 60 * 60 * 1000);

      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);

      const midnightEntry = rainHistory.find(r => r.time >= midnight.getTime());
      const rainSinceMidnight = midnightEntry
        ? Math.max(0, rainTotalRaw - midnightEntry.total)
        : 0;

      const nineAM = new Date();
      nineAM.setHours(9, 0, 0, 0);

      const nineEntry = rainHistory.find(r => r.time >= nineAM.getTime());
      const rainSince9am = nineEntry
        ? Math.max(0, rainTotalRaw - nineEntry.total)
        : 0;

      const temp = format(obs.metric?.temp);
      const humidity = format(obs.humidity);
      const dewPoint = format(obs.metric?.dewpt);

      const windSpeed = format(obs.metric?.windSpeed);

      const windDegRaw = obs.winddir;
      const windDeg = (windDegRaw !== undefined && !isNaN(windDegRaw))
        ? Number(windDegRaw)
        : null;

      const windCompass = windDirToCompass(windDeg);
      const windDisplay = windDeg !== null
        ? `${windDeg.toFixed(1)}° (${windCompass})`
        : "N/A";

      const pressure = format(obs.metric?.pressure);

      const rainRate = format(obs.metric?.precipRate);
      const rainTotal = format(rainTotalRaw);

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
        <p><strong>Rate:</strong> ${rainRate} mm/hr</p>
        <p><strong>Total:</strong> ${rainTotal} mm</p>
        <p><strong>Last 15 min:</strong> ${format(rain15m)} mm</p>
        <p><strong>Last 1 hour:</strong> ${format(rain1h)} mm</p>
        <p><strong>Last 24 hours:</strong> ${format(rain24h)} mm</p>
        <p><strong>Since Midnight:</strong> ${format(rainSinceMidnight)} mm</p>
        <p><strong>Since 9am:</strong> ${format(rainSince9am)} mm</p>

        <h3>Solar</h3>
        <p><strong>Solar Radiation:</strong> ${solar} W/m²</p>
        <p><strong>UV Index:</strong> ${uv}</p>
      `;
    })
    .catch(err => {
      console.error("FETCH ERROR:", err);

      document.getElementById("weather").innerText =
        "Error loading weather data (check console)";
    });
}

loadWeather();
setInterval(loadWeather, 15000);
