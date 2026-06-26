const stationId = "IGEELO181";
const apiKey = "d86cfab380f54255acfab380f5b255a0";

const url = `https://api.weather.com/v2/pws/observations/current?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;

function format(value) {
  return value !== undefined && value !== null
    ? Number(value).toFixed(1)
    : "N/A";
}

fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log(data);

    const obs = data.observations[0];

    // --- CORE ---
    const temp = format(obs.metric.temp);
    const humidity = format(obs.humidity);
    const dewPoint = format(obs.metric.dewpt);

    // --- WIND ---
    const windSpeed = format(obs.metric.windSpeed);
    const windDir = format(obs.winddir);
    const windChill = format(obs.metric.windChill);

    // --- HEAT ---
    const heatIndex = format(obs.metric.heatIndex);

    // --- PRESSURE ---
    const pressure = format(obs.metric.pressure);

    // --- RAIN ---
    const rainRate = format(obs.metric.precipRate);
    const rainTotal = format(obs.metric.precipTotal);

    // ⚠️ Not available directly from WU
    const rain15m = "N/A";
    const rain1h = "N/A";
    const rainSince9am = "N/A";
    const rainSinceMidnight = "N/A";

    // --- SOLAR ---
    const solar = format(obs.solarRadiation);
    const uv = format(obs.uv);

    // --- NOT PROVIDED BY WU ---
    const thwIndex = "N/A";
    const thswIndex = "N/A";
    const evapotranspiration = "N/A";

    // --- DISPLAY ---
    document.getElementById("weather").innerHTML = `
      <h2>Current Conditions</h2>

      <p><strong>Temperature:</strong> ${temp} °C</p>
      <p><strong>Dew Point:</strong> ${dewPoint} °C</p>
      <p><strong>Humidity:</strong> ${humidity} %</p>

      <p><strong>Wind:</strong> ${windSpeed} km/h (${windDir}°)</p>
      <p><strong>Wind Chill:</strong> ${windChill} °C</p>

      <p><strong>Heat Index:</strong> ${heatIndex} °C</p>
      <p><strong>THW Index:</strong> ${thwIndex}</p>
      <p><strong>THSW Index:</strong> ${thswIndex}</p>

      <p><strong>Pressure:</strong> ${pressure} hPa</p>

      <h3>Rainfall</h3>
      <p><strong>Rate:</strong> ${rainRate} mm/hr</p>
      <p><strong>Total (recent):</strong> ${rainTotal} mm</p>
      <p><strong>Last 15 min:</strong> ${rain15m}</p>
      <p><strong>Last 1 hr:</strong> ${rain1h}</p>
      <p><strong>Since 9am:</strong> ${rainSince9am}</p>
      <p><strong>Since Midnight:</strong> ${rainSinceMidnight}</p>

      <h3>Solar</h3>
      <p><strong>Solar Radiation:</strong> ${solar} W/m²</p>
      <p><strong>UV Index:</strong> ${uv}</p>

      <p><strong>Evapotranspiration:</strong> ${evapotranspiration}</p>
    `;
  })
  .catch(err => {
    console.error(err);
    document.getElementById("weather").innerText =
      "Error loading weather data";
  });
``
