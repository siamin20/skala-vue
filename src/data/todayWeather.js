// 오늘 구장별 날씨. 과제 6에서 OpenWeatherMap 응답으로 바뀔 자리라 따로 모아 둔다.
// hasGame 은 KBO 백엔드가 없을 때 쓰는 값이라 실제 오늘 일정에 맞춰 두었다.
export const todayWeather = [
  { id: 'seoul', temp: 28, status: '맑음', humidity: 45, wind: 3, hasGame: true },
  { id: 'gocheok', temp: 29, status: '비', humidity: 85, wind: 2, hasGame: true },
  { id: 'incheon', temp: 27, status: '구름', humidity: 75, wind: 8, hasGame: true },
  { id: 'suwon', temp: 24, status: '비', humidity: 88, wind: 5, hasGame: false },
  { id: 'daejeon', temp: 32, status: '맑음', humidity: 50, wind: 4, hasGame: true },
  { id: 'daegu', temp: 35, status: '맑음', humidity: 30, wind: 3, hasGame: false },
  { id: 'busan', temp: 26, status: '구름', humidity: 70, wind: 6, hasGame: false },
  { id: 'gwangju', temp: 30, status: '맑음', humidity: 65, wind: 4, hasGame: false },
  { id: 'changwon', temp: 25, status: '비', humidity: 90, wind: 7, hasGame: true },
]
