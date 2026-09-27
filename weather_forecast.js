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
});

const button_summary = document.createElement("button");
button_summary.textContent = "サマリー";
button_summary.classList.add("button-sub");
const button_detail = document.createElement("button");
button_detail.textContent = "詳細";
button_detail.classList.add("button-sub");

let data_api;
let create_button_status = false;

//一週間分の天気情報表示
function createWeatherCard(data) {
  card_table.innerHTML = "";

  //最初の一回目はサマリー/詳細ボタンを表示する
  if (!create_button_status) {
    data_api = data;
    button_summary.classList.add("activated");
    button_summary.disabled = true;
    htmlBody.append(button_summary, button_detail);
    create_button_status = true;
  }

  //dataから情報を抽出する
  const date_array = data.daily.time.map((element) => {
    const month = Number.parseInt(element.slice(5, 7));
    const day = Number.parseInt(element.slice(8, 10));
    return `${month}/${day}`;
  });
  const weather_array = data.daily.weather_code;
  const time_array = data.hourly.time.slice(0, 24).map((element) => {
    return element.slice(11, 16);
  });

  let temp_array = new Array(7);
  for (let i = 0; i < 7; i++) {
    let array_daily = data.hourly.temperature_2m.slice(i * 24, (i + 1) * 24);
    let max = Math.max(...array_daily);
    let min = Math.min(...array_daily);
    temp_array[i] = { max_temp: max, min_temp: min };
  }

  //一日ごとのサマリーを表示する
  if (button_summary.classList.contains("activated")) {
    const card_table_tr = document.createElement("tr");

    for (let i = 0; i < 7; i++) {
      const card_table_td = document.createElement("td");
      const daily_info = document.createElement("p");
      const weather_info = document.createElement("p");
      const temp_info = document.createElement("p");
      const max_temp_info = document.createElement("span");
      const min_temp_info = document.createElement("span");

      daily_info.classList.add("daily");
      weather_info.classList.add("weather");
      temp_info.classList.add("temp");
      max_temp_info.classList.add("max-temp");
      min_temp_info.classList.add("min-temp");

      daily_info.textContent = date_array[i];
      weather_info.textContent = icon(weather_array[i]);
      max_temp_info.textContent = `${temp_array[i].max_temp.toFixed(1)}℃`;
      min_temp_info.textContent = `${temp_array[i].min_temp.toFixed(1)}℃`;

      temp_info.append(max_temp_info, " / ", min_temp_info);

      card_table_td.append(daily_info, weather_info, temp_info);
      card_table_tr.appendChild(card_table_td);
    }
    card_table.appendChild(card_table_tr);
    htmlBody.appendChild(card_table);

    //一日の詳細の気温を表示
  } else if (button_detail.classList.contains("activated")) {
    for (let i = 0; i < 7; i++) {
      const card_table_tr = document.createElement("tr");
      const card_date_th = document.createElement("th");
      const card_weather_th = document.createElement("th");
      
      card_date_th.textContent = date_array[i];
      const detail_weather = icon(weather_array[i]);
      card_weather_th.textContent = detail_weather;
      card_table_tr.append(card_date_th, card_weather_th);
      for (let j = 0; j < 24; j++) {
        const daily_temp = document.createElement("td");
        const daily_temp_time = document.createElement("p");
        const daily_temp_temp = document.createElement("p");
        daily_temp_time.textContent = time_array[j];
        const temp = data.hourly.temperature_2m[i * 24 + j];
        daily_temp_temp.textContent = `${data.hourly.temperature_2m[i * 24 + j].toFixed(1)}℃`;
        if (temp === temp_array[i].max_temp) {
          daily_temp_temp.classList.add("max-temp");
        } else if (temp === temp_array[i].min_temp) {
          daily_temp_temp.classList.add("min-temp");
        }
        daily_temp.append(daily_temp_time, daily_temp_temp);
        card_table_tr.appendChild(daily_temp);
      }
      card_table.appendChild(card_table_tr);
      htmlBody.appendChild(card_table);
    }
  } else {
    return;
  }

  //詳細ボタンを押したときの処理
  button_detail.addEventListener("click", () => {
    button_summary.classList.remove("activated");
    button_detail.classList.add("activated");
    button_summary.disabled = false;
    button_detail.disabled = true;
    createWeatherCard(data);
  });

  //サマリーボタンを押したときの処理
  button_summary.addEventListener("click", () => {
    button_detail.classList.remove("activated");
    button_summary.classList.add("activated");
    button_summary.disabled = true;
    button_detail.disabled = false;
    createWeatherCard(data);
  });
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
