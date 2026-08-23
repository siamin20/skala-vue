import axios from 'axios'

// 직접 만든 KBO 백엔드(springboot-kbo-live)를 부른다.
// 네이버 스포츠에서 받아온 오늘 경기 정보를 정리해서 내려 준다.
// 배포본에는 이 서버가 없으므로, 실패하면 목업으로 넘어가도록 호출한 쪽에서 처리한다.
const BASE_URL = import.meta.env.VITE_KBO_API_URL

// 주소를 안 넣으면 'undefined/api/...' 로 요청이 나간다.
// 개발 서버는 그런 주소에도 index.html 을 200 으로 돌려주기 때문에
// axios 는 성공으로 보고 HTML 문자열을 준다. 부르기 전에 미리 막는다.
const checkUrl = () => {
  if (!BASE_URL) {
    throw new Error('VITE_KBO_API_URL 이 비어 있다')
  }
}

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

// 구단 순위표. 네이버 주소가 Origin 이 붙으면 막혀서 백엔드를 거친다.
export const getRank = async () => {
  checkUrl()
  const response = await axios.get(`${BASE_URL}/api/teams/rank`, { timeout: 45000 })
  if (!Array.isArray(response.data)) {
    throw new Error('순위 응답이 배열이 아니다')
  }
  return response.data
}

// 생년월일로 사주 네 기둥을 받아 온다.
// 연주·월주는 절기 기준이라 날짜 계산으로 구할 수 없어 백엔드가 만세력을 대신 조회해 준다.
export const getSaju = async (year, month, day) => {
  checkUrl()
  const response = await axios.get(`${BASE_URL}/api/saju`, {
    params: { year, month, day },
    timeout: 45000,
  })
  return response.data
}

export const getTodayGames = async () => {
  checkUrl()
  // 무료 호스팅은 한동안 요청이 없으면 잠들었다가 깨어나는 데 30초쯤 걸린다.
  // 그동안 기다려 주되, 그보다 오래 걸리면 저장해 둔 값으로 넘어간다.
  const response = await axios.get(`${BASE_URL}/api/games/today`, { timeout: 45000 })
  if (!Array.isArray(response.data)) {
    throw new Error('경기 응답이 배열이 아니다')
  }

  // 화면에서 쓰기 좋게 cityId 를 붙여 준다
  const games = []
  for (const game of response.data) {
    const cityId = STADIUM_TO_CITY[game.stadium]
    if (cityId) {
      games.push({ ...game, cityId })
    }
  }
  return games
}
