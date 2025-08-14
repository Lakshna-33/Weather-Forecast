// http://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}


const API_KEY = "1a89d7f88efd5e6c11c0c918eaa151f4";
let isCelsius = false;

// Fetch current weather by city
function getWeatherData(city) {
    const URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${isCelsius ? 'metric' : 'imperial'}`;
    console.log(city);
    return fetch(URL).then(res => res.json());
}

// Fetch current weather by coords
function getWeatherByCoords(lat, lon) {
    const URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${isCelsius ? 'metric' : 'imperial'}`;
    return fetch(URL).then(res => res.json());
}

// Fetch 5-day forecast
function getForecast(city) {
    const URL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${isCelsius ? 'metric' : 'imperial'}`;
    return fetch(URL).then(res => res.json());
}


function searchCity(){
    const city = document.getElementById('city-input').value;

    getWeatherData(city)
    .then((res) => {
        showWeatherData(res)
        console.log(res)
    })

   .catch((error) => {
        console.log(error);
    })
}


function getLocationWeather() {
    const city = document.getElementById('city-input').value;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                getWeatherByCoords(lat, lon)
                    .then(response => {
                        showWeatherData(response)
                        console.log(response);
                    })
                    .catch(error => {
                        console.log(error);
                    })      
            },
            error => {
                alert("Unable to retrieve your location.");
                console.log(error);
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Show weather
function showWeatherData(data) {
    // hideError();
    document.getElementById("city-name").innerText = data.name;
    document.getElementById("weather-type").innerText = data.weather[0].description;
    document.getElementById("temp").innerText = Math.round(data.main.temp);
    document.getElementById("feels-like").innerText = Math.round(data.main.feels_like);
    document.getElementById("min-temp").innerText = Math.round(data.main.temp_min);
    document.getElementById("max-temp").innerText = Math.round(data.main.temp_max);
    document.getElementById("humidity").innerText = data.main.humidity;
    document.getElementById("wind-speed").innerText = `${data.wind.speed} ${isCelsius ? 'm/s' : 'mph'}`;
    document.getElementById("visibility").innerText = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById("pressure").innerText = `${data.main.pressure} hPa`;
    document.getElementById("sunrise").innerText = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    document.getElementById("sunset").innerText = new Date(data.sys.sunset * 1000).toLocaleTimeString();
    document.getElementById("time-zone").innerText = `${data.timezone / 3600} hours`;
    document.getElementById("last-update").innerText = new Date(data.dt * 1000).toLocaleString();

    // Set icon
    document.getElementById("weather-icon").src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    // Extreme temp alert
    if ((isCelsius && data.main.temp > 40) || (!isCelsius && data.main.temp > 104)) {
        showError("🔥 Extreme Hot Temperature Alert!");
    }
 }

// Load forecast
function loadForecast(city) {
    getForecast(city)
        .then(data => {
            const forecastDiv = document.getElementById("forecast");
            forecastDiv.innerHTML = "";
            const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));
            daily.forEach(day => {
                forecastDiv.innerHTML += `
                    <div class="bg-white/30 p-3 rounded-lg text-center">
                        <p>${new Date(day.dt * 1000).toLocaleDateString()}</p>
                        <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" class="mx-auto bg-yellow-500" />
                        <p>Temp: ${Math.round(day.main.temp)}°</p>
                        <p>Wind: ${day.wind.speed} ${isCelsius ? 'm/s' : 'mph'}</p>
                        <p>Humidity: ${day.main.humidity}%</p>
                        <p>Condition: ${day.weather[0].description}</p>
                    </div>`;
            });
        })
        .catch(() => showError("Unable to fetch forecast."));
}

// Recent city storage
function saveRecentCity(city) {
    let recent = JSON.parse(localStorage.getItem("recentCities")) || [];
    if (!recent.includes(city)) {
        recent.unshift(city);
        if (recent.length > 5) recent.pop();
        localStorage.setItem("recentCities", JSON.stringify(recent));
    }
    loadRecentDropdown();
}

function loadRecentDropdown() {
    let recent = JSON.parse(localStorage.getItem("recentCities")) || [];
    const container = document.getElementById("recent-container");
    const dropdown = document.getElementById("recent-dropdown");
    dropdown.innerHTML = "";
    if (recent.length) {
        container.classList.remove("hidden");
        recent.forEach(city => {
            const opt = document.createElement("option");
            opt.value = city;
            opt.innerText = city;
            dropdown.appendChild(opt);
        });
        dropdown.onchange = () => {
            searchCityByName(dropdown.value);
        };
    } else {
        container.classList.add("hidden");
    }
}

function searchCityByName(city) {
    getWeatherData(city)
        .then(data => {
            if (data.cod !== 200) return showError(data.message);
            showWeatherData(data);
            loadForecast(city);
            console.log(data);
        })
        .catch(() => showError("Unable to fetch weather data."));
}

// Unit toggle
document.getElementById("unit-toggle").addEventListener("change", (e) => {
    isCelsius = e.target.checked;
    const city = document.getElementById("city-name").innerText;
    if (city && city !== "--") searchCityByName(city);
});

// Error handling
function showError(msg) {
    const err = document.getElementById("error-msg");
    err.innerText = msg;
    err.classList.remove("hidden");
}

function hideError() {
    document.getElementById("error-msg").classList.add("hidden");
}

// Init
loadRecentDropdown();
