
const API_KEY = "adff5186f14862f9d6831fb6311911fe";

/* ====== INDEX PAGE ====== */
function goToWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) { alert("Enter city name"); return; }
  window.location.href = `weather.html?city=${encodeURIComponent(city)}`;
}

/* ====== WEATHER PAGE ====== */
const params = new URLSearchParams(window.location.search);
const city = params.get("city");

if (city) {
  const bodyEl = document.getElementById("weatherBody");
  const loaderEl = document.getElementById("loader");
  const weatherBoxEl = document.getElementById("weatherBox");

  
  loaderEl.style.display = "block";
  weatherBoxEl.style.display = "none";

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      loaderEl.style.display = "none";
      weatherBoxEl.style.display = "block";

      document.getElementById("cityName").innerText = data.name;
      document.getElementById("countryName").innerText = data.sys.country;
      document.getElementById("temperature").innerText = `${Math.round(data.main.temp)}°C`;
      document.getElementById("condition").innerText = data.weather[0].main;
      document.getElementById("clouds").innerText = data.clouds.all + "%";
      document.getElementById("humidity").innerText = data.main.humidity + "%";
      document.getElementById("wind").innerText = data.wind.speed + " m/s";
      document.getElementById("pressure").innerText = data.main.pressure + " hPa";
      document.getElementById("visibility").innerText = (data.visibility / 1000).toFixed(1) + " km";

      const iconEl = document.getElementById("weatherIcon");
      const weatherMain = data.weather[0].main;
      iconEl.innerHTML = getIcon(weatherMain);
      setWeatherTheme(weatherMain, bodyEl);

      const { lat, lon } = data.coord;
      loadForecast(lat, lon);
    })
    .catch(err => { loaderEl.style.display = "none"; alert("Failed to load weather data!"); console.error(err); });
}

/* ====== FORECAST ====== */
function loadForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const hourlyEl = document.getElementById("hourly");
      const weeklyEl = document.getElementById("weekly");

      hourlyEl.innerHTML = "";
      weeklyEl.innerHTML = "";

      data.list.slice(0, 8).forEach(item => {
        const time = new Date(item.dt_txt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
        hourlyEl.innerHTML += `<div class="hour"><div>${time}</div><div>${getIcon(item.weather[0].main)}</div><div>${Math.round(item.main.temp)}°C</div></div>`;
      });

      for (let i=0; i<data.list.length; i+=8) {
        const date = new Date(data.list[i].dt_txt);
        const day = date.toLocaleDateString('en-US',{weekday:'short', month:'short', day:'numeric'});
        weeklyEl.innerHTML += `<div class="day"><div>${day}</div><div>${getIcon(data.list[i].weather[0].main)}</div><div>${Math.round(data.list[i].main.temp)}°C</div></div>`;
      }
    })
    .catch(err => console.error("Forecast error:", err));
}

/* ====== ICONS ====== */
function getIcon(condition) {
  if (condition.includes("Rain")) return "🌧️";
  if (condition.includes("Cloud")) return "☁️";
  if (condition.includes("Snow")) return "❄️";
  if (condition.includes("Clear")) return "☀️";
  if (condition.includes("Drizzle")) return "🌦️";
  if (condition.includes("Mist")) return "🌫️";
  return "🌤️";
}

/* ====== BACKGROUND THEMES ====== */
function setWeatherTheme(weather, bodyEl) {
  switch(weather){
    case "Snow": bodyEl.style.background="linear-gradient(135deg,#a1c4fd,#c2e9fb)"; break;
    case "Rain": case "Drizzle": bodyEl.style.background="linear-gradient(135deg,#4e5d6c,#7a8b99)"; break;
    case "Clouds": bodyEl.style.background="linear-gradient(135deg,#d7d2cc,#304352)"; break;
    case "Clear": bodyEl.style.background="linear-gradient(135deg,#fceabb,#f8b500)"; break;
    case "Mist": bodyEl.style.background="linear-gradient(135deg,#cfd9df,#e2ebf0)"; break;
    default: bodyEl.style.background="linear-gradient(135deg,#07c4ee,#7b6cdd)";
  }
}
