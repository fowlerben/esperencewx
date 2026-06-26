// 🔴 STEP 1: PUT YOUR DETAILS HERE
const stationId = "IGEELO181";  
const apiKey = "d86cfab380f54255acfab380f5b255a0";


// 🔴 STEP 2: BUILD THE API URL
const url = `https://api.weather.com/v2/pws/observations/current?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;


// 🔴 STEP 3: FETCH DATA FROM WUNDERGROUND
fetch(url)
  .then((response) => {
    // Check if request worked
    if (!response.ok) {
      throw new Error("Network response was not OK");
    }
    return response.json();
  })
  .then((data) => {

    console.log("Raw data:", data); // helpful for debugging

    // 🔴 STEP 4: EXTRACT WEATHER VALUES
    const obs = data.observations[0];

    const temperature = obs.metric.temp;
    const humidity = obs.humidity;
    const windSpeed = obs.metric.windSpeed;


    // 🔴 STEP 5: DISPLAY ON WEBPAGE
    document.getElementById("weather").innerHTML = `
      <p><strong>Temperature:</strong> ${temperature} °C</p>
      <p><strong>Humidity:</strong> ${humidity} %</p>
      <p><strong>Wind Speed:</strong> ${windSpeed} km/h</p>
    `;
  })
  .catch((error) => {
    console.error("Error:", error);

    document.getElementById("weather").innerHTML =
      "Error loading weather data (check console)";
  });
