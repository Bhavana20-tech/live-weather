const apiKey = "adff5186f14862f9d6831fb6311911fe"; // Your API key
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");

let currentCity = ""; // Store current city for live updates
let weatherInterval;  // Store interval reference

// List of Telugu state cities for autocomplete or validation (optional)
const teluguCities = [
  "Hyderabad", "Warangal", "Karimnagar", "Nizamabad",
  "Visakhapatnam", "Vijayawada", "Guntur", "Tirupati",
  "Rajahmundry", "Kurnool", "Eluru", "Srikakulam",
];

async function checkWeather(city) {
  if (!city) {
    alert("Please enter a city name");
    return;
  }

  try {
    const response = await fetch(apiUrl + encodeURIComponent(city) + "&appid=" + apiKey);
    const data = await response.json();

    if (data.cod != 200) {
      alert("Error: " + data.message);
      return;
    }

    // Update UI
    document.querySelector(".city").textContent = data.name;
    document.querySelector(".temp").textContent = Math.round(data.main.temp) + "°C";
    document.querySelector(".humidity").textContent = data.main.humidity + "%";
    document.querySelector(".wind").textContent = data.wind.speed + " km/h";

    const weather = data.weather[0].main;

    if (weather === "Clouds") weatherIcon.src = "images/clouds.png";
    else if (weather === "Clear") weatherIcon.src = "images/clear.png";
    else if (weather === "Rain") weatherIcon.src = "images/rain.png";
    else if (weather === "Drizzle") weatherIcon.src = "images/drizzle.png";
    else if (weather === "Mist") weatherIcon.src = "images/mist.png";
    else if (weather === "Snow") weatherIcon.src = "images/snow.png";
    else weatherIcon.src = "images/clear.png";

  } catch (error) {
    alert("Network or API error");
    console.error(error);
  }
}

// Function to fetch weather and start live updates
function getWeather() {
  const city = document.querySelector("#city").value.trim();
  
  if (!city) return alert("Please enter a city name");

  // Optional: validate against Telugu cities
  if (!teluguCities.includes(city) && city !== "") {
    console.log("City not in Telugu list, but still fetching...");
  }

  currentCity = city;
  checkWeather(currentCity);

  // Clear previous interval if any
  if (weatherInterval) clearInterval(weatherInterval);

  // Live updates every 60 seconds
  weatherInterval = setInterval(() => {
    checkWeather(currentCity);
  }, 60000); // 60000 ms = 1 min
}

// Event listeners
searchBtn.addEventListener("click", getWeather);
searchBox.addEventListener("keydown", (e) => {
  if (e.key === "Enter") getWeather();
});
