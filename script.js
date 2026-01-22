
const API_KEY = "adff5186f14862f9d6831fb6311911fe";

/* ===== INDEX PAGE ===== */
function goToWeather() {
  const city = document.getElementById("cityInput").value.trim();

  if (city === "") {
    alert("Please enter a city name!");
    return;
  }

  window.location.href = `weather.html?city=${encodeURIComponent(city)}`;
}

/* ===== WEATHER PAGE ===== */
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const city = params.get("city");

  if (!city) return;

  const bodyEl = document.getElementById("weatherBody");
  const loaderEl = document.getElementById("loader");
  const weatherBoxEl = document.getElementById("weatherBox");
  const errorBoxEl = document.getElementById("errorBox");

  loaderEl.style.display = "block";
  weatherBoxEl.style.display = "none";
  errorBoxEl.style.display = "none";

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`)
    .then(res => res.json())
    .then(data => {

      // ✅ if city not found
      if (data.cod === "404" || data.cod === 404) {
        loaderEl.style.display = "none";
        weatherBoxEl.style.display = "none";
        errorBoxEl.style.display = "block";

        errorBoxEl.innerHTML = `
          <h2> City not found</h2>
          <p>You entered: <b>${city}</b></p>
          <p>Please check spelling and try again.</p>
          <a href="index.html"> Search another city</a>
        `;
        return;
      }

      loaderEl.style.display = "none";
      weatherBoxEl.style.display = "block";

      document.getElementById("cityName").innerText = data.name;
      document.getElementById("countryName").innerText = data.sys.country;

      // ✅ Day + Date + Time (City Local Time)
      const cityTime = new Date((data.dt + data.timezone) * 1000);
      const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

      const dayName = days[cityTime.getUTCDay()];
      const dateNum = cityTime.getUTCDate();
      const monthName = months[cityTime.getUTCMonth()];
      const yearNum = cityTime.getUTCFullYear();

      const hours = cityTime.getUTCHours().toString().padStart(2, "0");
      const minutes = cityTime.getUTCMinutes().toString().padStart(2, "0");

      // ✅ Make sure you added <p id="dateTime"></p> in weather.html
      const dateTimeEl = document.getElementById("dateTime");
      if (dateTimeEl) {
        dateTimeEl.innerText = ` ${dayName}, ${dateNum} ${monthName} ${yearNum}  |   ${hours}:${minutes}`;
      }

      document.getElementById("temperature").innerText = `${Math.round(data.main.temp)}°C`;
      document.getElementById("condition").innerText = data.weather[0].main;

      document.getElementById("clouds").innerText = data.clouds.all + "%";
      document.getElementById("humidity").innerText = data.main.humidity + "%";
      document.getElementById("wind").innerText = data.wind.speed + " m/s";
      document.getElementById("pressure").innerText = data.main.pressure + " hPa";
      document.getElementById("visibility").innerText =
        data.visibility ? (data.visibility / 1000).toFixed(1) + " km" : "N/A";

      const weatherMain = data.weather[0].main;
      document.getElementById("weatherIcon").innerHTML = getIcon(weatherMain);

      setWeatherTheme(weatherMain, bodyEl);

      loadForecast(data.coord.lat, data.coord.lon);
    })
    .catch(() => {
      loaderEl.style.display = "none";
      weatherBoxEl.style.display = "none";
      errorBoxEl.style.display = "block";

      errorBoxEl.innerHTML = `
        <h2>Failed to load weather data</h2>
        <p>Possible reasons:</p>
        <p> Wrong API Key OR Internet issue OR  API Limit</p>
        <a href="index.html">Search another city</a>
      `;
    });
});

/* ===== FORECAST ===== */
function loadForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const hourlyEl = document.getElementById("hourly");
      const weeklyEl = document.getElementById("weekly");

      hourlyEl.innerHTML = "";
      weeklyEl.innerHTML = "";

      // Hourly next 8 (24 hrs)
      data.list.slice(0, 8).forEach(item => {
        const time = new Date(item.dt_txt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        hourlyEl.innerHTML += `
          <div class="hour">
            <div>${time}</div>
            <div>${getIcon(item.weather[0].main)}</div>
            <div>${Math.round(item.main.temp)}°C</div>
          </div>
        `;
      });

      // Weekly (every 24 hours)
      for (let i = 0; i < data.list.length; i += 8) {
        const date = new Date(data.list[i].dt_txt);
        const day = date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });

        weeklyEl.innerHTML += `
          <div class="day">
            <div>${day}</div>
            <div>${getIcon(data.list[i].weather[0].main)}</div>
            <div>${Math.round(data.list[i].main.temp)}°C</div>
          </div>
        `;
      }
    })
    .catch(err => console.log("Forecast Error:", err));
}

/* ===== ICONS ===== */
function getIcon(condition) {
  if (condition.includes("Rain")) return "🌧️";
  if (condition.includes("Cloud")) return "☁️";
  if (condition.includes("Snow")) return "❄️";
  if (condition.includes("Clear")) return "☀️";
  if (condition.includes("Drizzle")) return "🌦️";
  if (condition.includes("Mist")) return "🌫️";
  return "🌤️";
}

/* ===== THEMES (DARKER + TEXT VISIBLE) ===== */
function setWeatherTheme(weather, bodyEl) {
  switch (weather) {
    case "Snow":
      bodyEl.style.background = "linear-gradient(135deg,#1e3a8a,#0f172a)";
      break;
    case "Rain":
    case "Drizzle":
      bodyEl.style.background = "linear-gradient(135deg,#1f2937,#0b1220)";
      break;
    case "Clouds":
      bodyEl.style.background = "linear-gradient(135deg,#334155,#0f172a)";
      break;
    case "Clear":
      bodyEl.style.background = "linear-gradient(135deg,#f97316,#0f172a)";
      break;
    case "Mist":
      bodyEl.style.background = "linear-gradient(135deg,#475569,#0f172a)";
      break;
    default:
      bodyEl.style.background = "linear-gradient(135deg,#0ea5e9,#0f172a)";
  }
}
