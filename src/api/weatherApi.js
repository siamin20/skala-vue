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

// 2. 날씨 상태를 우리말로 바꾼다.
//    OpenWeather 의 한국어 번역은 '온흐림', '튼구름', '실비' 처럼 잘 안 쓰는 말이라
//    번역 대신 상태 코드(weather[0].id)로 직접 정한다.
export const skyText = (id) => {
  if (id >= 200 && id < 300) {
    return '뇌우'
  }
  if (id >= 300 && id < 400) {
    return '이슬비'
  }
  if (id >= 500 && id < 600) {
    return '비'
  }
  if (id >= 600 && id < 700) {
    return '눈'
  }
  if (id >= 700 && id < 800) {
    return '안개'
  }
  if (id === 800) {
    return '맑음'
  }
  if (id === 801) {
    return '구름 조금'
  }
  if (id === 804) {
    return '흐림'
  }
  return '구름'
}

// 3. 대기오염 정보. 이쪽은 도시명이 아니라 위도·경도로만 부를 수 있다.
export const getAirPollution = async (lat, lon) => {
  const response = await axios.get(`${BASE_URL}/air_pollution`, {
    params: {
      lat,
      lon,
      appid: API_KEY,
    },
  })
  return response.data
}
