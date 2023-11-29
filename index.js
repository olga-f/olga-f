require("dotenv").config();
const fetch = require("cross-fetch");
const Mustache = require("mustache");
const fs = require("fs");
const MUSTACHE_MAIN_DIR = "./main.mustache";

const DATA = {
  date: new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
    timeZone: "Europe/Madrid",
  }),
};

const OPEN_WEATHER_CITY_ID = 2521886; // city id for Almeria, Spain
const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?id=${OPEN_WEATHER_CITY_ID}&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`;

async function fetchWeather() {
  try {
    const res = await fetch(weatherUrl);
    if (res.status >= 400) {
      throw new Error("Bad response from server");
    }
    const weather = await res.json();
    setWeatherData(weather);
  } catch (err) {
    console.error(err);
  }

  function setWeatherData(weather) {
    DATA.city_temperature = Math.round(weather.main.temp);
    DATA.city_weather = weather.weather[0].description;
    DATA.weather_icon_src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`;
    DATA.sun_rise = new Date(weather.sys.sunrise * 1000).toLocaleString(
      "en-GB",
      {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Madrid",
      }
    );
    DATA.sun_set = new Date(weather.sys.sunset * 1000).toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Madrid",
    });
  }
}

async function writeTemplate() {
  await fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync("README.md", output);
  });
}

async function generateReadMe() {
  await fetchWeather();
  await writeTemplate();
}

generateReadMe();
