import axios from 'axios'

// OpenWeatherMap 호출을 한곳에 모아 둔다. 화면마다 주소와 키를 반복해서 쓰지 않기 위해서다.
// 키는 .env.local 에 두고 Git 에 올리지 않는다.
const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

// 1. 현재 날씨. 도시 영문명으로 부른다.
export const getWeather = async (query) => {
  const response = await axios.get(`${BASE_URL}/weather`, {
    params: {
      q: `${query},KR`,
      appid: API_KEY,
      units: 'metric',
      lang: 'kr',
    },
  })
  return response.data
}

// 2. 대기오염 정보. 이쪽은 도시명이 아니라 위도·경도로만 부를 수 있다.
export const getAirPollution = async (lat, lon) => {
  const response = await axios.get(`${BASE_URL}/air_pollution`, {
    params: {
      lat: lat,
      lon: lon,
      appid: API_KEY,
    },
  })
  return response.data
}
