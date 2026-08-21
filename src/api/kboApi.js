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

export const getTodayGames = async () => {
  const response = await axios.get(`${BASE_URL}/api/games/today`, { timeout: 3000 })

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
