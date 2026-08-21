import axios from 'axios'

// 직접 만든 KBO 백엔드(springboot-kbo-live)를 부른다.
// 네이버 스포츠에서 받아온 오늘 경기 정보를 정리해서 내려 준다.
// 배포본에는 이 서버가 없으므로, 실패하면 목업으로 넘어가도록 호출한 쪽에서 처리한다.
const BASE_URL = import.meta.env.VITE_KBO_API_URL

// 백엔드는 구장을 '잠실', '문학' 처럼 짧은 이름으로 준다. 우리 구장 id 와 이어 준다.
const STADIUM_TO_CITY = {
  잠실: 'seoul',
  고척: 'gocheok',
  문학: 'incheon',
  수원: 'suwon',
  대전: 'daejeon',
  대구: 'daegu',
  사직: 'busan',
  광주: 'gwangju',
  창원: 'changwon',
}

// 생년월일로 사주 네 기둥을 받아 온다.
// 연주·월주는 절기 기준이라 날짜 계산으로 구할 수 없어 백엔드가 만세력을 대신 조회해 준다.
export const getSaju = async (year, month, day) => {
  const response = await axios.get(`${BASE_URL}/api/saju`, {
    params: { year: year, month: month, day: day },
    timeout: 45000,
  })
  return response.data
}

export const getTodayGames = async () => {
  // 무료 호스팅은 한동안 요청이 없으면 잠들었다가 깨어나는 데 30초쯤 걸린다.
  // 그동안 기다려 주되, 그보다 오래 걸리면 저장해 둔 값으로 넘어간다.
  const response = await axios.get(`${BASE_URL}/api/games/today`, { timeout: 45000 })

  // 화면에서 쓰기 좋게 cityId 를 붙여 준다
  const games = []
  for (const game of response.data) {
    const cityId = STADIUM_TO_CITY[game.stadium]
    if (cityId) {
      games.push({ ...game, cityId: cityId })
    }
  }
  return games
}
