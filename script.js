const stationId = "IGEELO181";
const apiKey = "d86cfab380f54255acfab380f5b255a0";

const url = `https://api.weather.com/v2/pws/observations/current?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;

function format(value) {
  if (value === undefined || value === null || isNaN(value)) {
    return "N/A";
  }
  return Number(value).toFixed(1);
}

fetch(url)
  .then(res => res.json())
  .then(data => {
    const obs = data.observations[0];

    const temp = format(obs.metric?.temp);
    const humidity = format(obs.humidity);

    const windSpeed = format(obs.metric?.windSpeed);
    const windDir = format(obs.winddir);

    const pressure = format(obs.metric?.pressure);
    const dewPoint = format(obs.metric?.dewpt);

    const rainRate = format(obs.metric?.precipRate);
    const rainTotal = format(obs.metric?.precipTotal);

    const solar = format(obs.solarRadiation);
    const uv = format(obs.uv);

    document.getElementById("weather").innerHTML = `
      <h2>Current Conditions</h2>

      <p><strong>Temperature:</strong> ${temp} °C</p>
      <p><strong>Humidity:</strong> ${humidity} %</p>
      <p><strong>Dew Point:</strong> ${dewPoint} °C</p>

      <p><strong>Wind:</strong> ${windSpeed} km/h (${windDir}°)</p>

      <p><strong>Pressure:</strong> ${pressure} hPa</p>

      <h3>Rain</h3>
      <p><strong>Rate:</strong> ${rainRate} mm/hr</p>
      <p><strong>Total:</strong> ${rainTotal} mm</p>

      <h3>Solar</h3>
      <p><strong>Solar Radiation:</strong> ${solar} W/m²</p>
      <p><strong>UV Index:</strong> ${uv}</p>
    `;
  })
  .catch(err => {
    console.error(err);
    document.getElementById("weather").innerText = "Error loading weather data";
  });
