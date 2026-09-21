let url_geo =
  "https://geocoding-api.open-meteo.com/v1/search?name=Nagoya&count=1&language=en&format=json";

//平均気温計算
function weather(array) {
  let daily_weather = new Array(7);
  for (let i = 0; i < 7; i++) {
    let array_daily = array.slice(i * 24, (i + 1) * 24);
    let max = Math.max(...array_daily);
    let min = Math.min(...array_daily);
    let sum = array_daily.reduce((total, temp) => {
      return total + temp;
    }, 0);
    let ave = sum / array_daily.length;
    daily_weather[i] = { max_temp: max, min_temp: min, ave_temp: ave };
  }
  console.log(daily_weather);
}

//位置情報から天気の情報を取得
fetch(url_geo)
  .then((response) => response.json())
  .then((data) => {
    let latitude = data.results[0].latitude;
    let longitude = data.results[0].longitude;
    // console.log(data);
    let url_weather = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&timezone=Asia%2FTokyo&utm_source=chatgpt.com&start_date=2026-09-21&end_date=2026-09-27`;
    fetch(url_weather)
      .then((response) => response.json())
      .then((data) => {
        // console.log(data.hourly.temperature_2m);
        weather(data.hourly.temperature_2m);
      });
  });
