const htmlBody = document.querySelector("body");
const form = document.getElementById("location-form");
const card_table = document.querySelector(".card-table");

let user_location;

form.addEventListener("submit", (event) => {
  card_table.innerHTML = "";
  event.preventDefault();
  user_location = document.getElementById("location").value;
  let url_geo = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(user_location)}&count=1&language=ja&format=json`;

  //位置情報から天気の情報を取得
  fetch(url_geo)
    .then((response) => response.json())
    .then((data) => {
      if (!data.results) {
        alert("場所が見つかりませんでした");
        return;
      }
      let latitude = data.results[0].latitude;
      let longitude = data.results[0].longitude;
      let url_weather = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code&hourly=temperature_2m`;
      fetch(url_weather)
        .then((response) => response.json())
        .then((data) => {
          createWeatherCard(data);
        });
    });

  //一週間分の天気情報表示
  function createWeatherCard(data) {
    const card_table_tr = document.createElement("tr");

    const daily_time = data.daily.time.map((date) => {
      const month = Number.parseInt(date.slice(5, 7));
      const day = Number.parseInt(date.slice(8, 10));
      return `${month}/${day}`;
    });

    const daily_weather = data.daily.weather_code;

    let daily_temp = new Array(7);
    for (let i = 0; i < 7; i++) {
      let array_daily = data.hourly.temperature_2m.slice(i * 24, (i + 1) * 24);
      let max = Math.max(...array_daily);
      let min = Math.min(...array_daily);
      daily_temp[i] = { max_temp: max, min_temp: min };
    }

    for (let i = 0; i < 7; i++) {
      let card_table_td = document.createElement("td");
      let daily_info = document.createElement("p");
      let weather_info = document.createElement("p");
      let temp_info = document.createElement("p");

      daily_info.classList.add("daily");
      weather_info.classList.add("weather");
      temp_info.classList.add("temp");

      daily_info.textContent = daily_time[i];
      weather_info.textContent = icon(daily_weather[i]);
      temp_info.textContent = `${daily_temp[i].max_temp.toFixed(1)}℃ / ${daily_temp[i].min_temp.toFixed(1)}℃`;

      card_table_td.append(daily_info, weather_info, temp_info);
      card_table_tr.appendChild(card_table_td);
    }
    card_table.appendChild(card_table_tr);
    htmlBody.appendChild(card_table);
  }

  //天気アイコンへ変換
  function icon(wmo_code) {
    switch (wmo_code) {
      case 0:
        return "☀️";

      case 1:
      case 2:
        return "🌤️";

      case 3:
        return "☁️";

      case 45:
      case 48:
        return "🌫️";

      case 51:
      case 53:
      case 55:
        return "🌦️";

      case 61:
      case 63:
      case 65:
        return "🌧️";

      case 71:
      case 73:
      case 75:
        return "🌨️";

      case 80:
      case 81:
      case 82:
        return "🌦️";

      case 95:
      case 96:
      case 99:
        return "⛈️";

      default:
        return "❓";
    }
  }
});
