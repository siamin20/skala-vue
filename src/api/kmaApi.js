import axios from 'axios'

// 기상청 초단기예보 (공공데이터포털). 발표 시각부터 6시간 앞까지 1시간 간격으로 준다.
// 자료 출처: 기상청 국가기후데이터센터 — 이용허락범위 "저작자 표시"
const BASE_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0'

// 인증키는 이미 URL 인코딩된 상태라 axios params 에 넘기면 두 번 인코딩된다.
// 그래서 주소 문자열에 직접 붙인다.
const SERVICE_KEY = import.meta.env.VITE_KMA_KEY

// 1. 두 자리로 맞춰 준다 (8 -> '08')
const pad = (value) => {
  return value < 10 ? '0' + value : '' + value
}

// 2. 지금 시각으로 조회할 수 있는 가장 최근 발표 시각을 구한다.
//    예보는 매시 30분에 만들어지고 45분이 지나야 받을 수 있다.
//    그래서 45분 전이면 한 시간 더 뒤로 물러선다.
const baseTimeOf = (now) => {
  const moment = new Date(now.getTime())
  if (moment.getMinutes() < 45) {
    moment.setHours(moment.getHours() - 1)
  }
  const date = `${moment.getFullYear()}${pad(moment.getMonth() + 1)}${pad(moment.getDate())}`
  const time = `${pad(moment.getHours())}30`
  return { date, time }
}

// 3. 강수형태 코드를 사람이 읽는 말로 바꾼다.
const RAIN_TYPE = {
  1: '비',
  2: '비/눈',
  3: '눈',
  5: '빗방울',
  6: '빗방울눈날림',
  7: '눈날림',
}
const rainTypeText = (code) => RAIN_TYPE[code] ?? ''

// 4. 강수량은 '1mm 미만', '30.0~50.0mm' 같은 범주 문자열로도 온다.
//    비교할 수 있게 대표 숫자를 뽑아 준다.
const rainAmount = (text) => {
  if (!text || text === '강수없음' || text === '-') {
    return 0
  }
  const number = parseFloat(text)
  if (isNaN(number)) {
    // '1mm 미만' 처럼 숫자로 시작하지 않는 경우
    return 0.5
  }
  return number
}

// 5. 한 구장의 앞으로 6시간 예보를 시간별로 정리해 준다.
//    [{ time: '1800', rainType: '비', rain: 3, sky: '4', lightning: 0 }, ...]
export const getShortForecast = async (nx, ny) => {
  const base = baseTimeOf(new Date())
  const url =
    `${BASE_URL}/getUltraSrtFcst?serviceKey=${SERVICE_KEY}` +
    `&pageNo=1&numOfRows=60&dataType=JSON` +
    `&base_date=${base.date}&base_time=${base.time}&nx=${nx}&ny=${ny}`

  const response = await axios.get(url, { timeout: 10000 })
  const { resultCode, resultMsg } = response.data.response.header
  if (resultCode !== '00') {
    throw new Error(`기상청 응답 오류: ${resultMsg}`)
  }

  // 같은 시각끼리 묶는다. 한 시각에 항목이 열 개씩 따로 온다.
  const items = response.data.response.body.items.item
  const byTime = {}
  for (const { fcstTime, category, fcstValue } of items) {
    const slot = byTime[fcstTime] ?? {
      time: fcstTime,
      rainType: '',
      rain: 0,
      sky: '',
      lightning: 0,
    }
    if (category === 'PTY') {
      slot.rainType = rainTypeText(fcstValue)
    }
    if (category === 'RN1') {
      slot.rain = rainAmount(fcstValue)
    }
    if (category === 'SKY') {
      slot.sky = fcstValue
    }
    if (category === 'LGT') {
      slot.lightning = Number(fcstValue)
    }
    byTime[fcstTime] = slot
  }

  // 기상청이 이미 시각 순으로 주므로 받은 차례를 그대로 쓴다.
  // 글자로 정렬하면 자정을 넘길 때 '0000' 이 '1900' 보다 앞으로 가 버린다.
  return Object.entries(byTime).map(([, slot]) => slot)
}

// 6. 경기 시각에 비가 오는지 한 줄로 판정한다.
//    실제 우천취소는 그라운드 상태와 중계 일정까지 보고 정하므로
//    여기서는 "예보가 이렇다"까지만 말한다.
export const rainRisk = (forecast, startTime) => {
  if (forecast.length === 0) {
    return null
  }

  // 경기 시작 시각(예: '18:30')이 예보 범위 안에 있으면 그 시각부터, 없으면 전체를 본다.
  const startHour = startTime ? `${startTime.split(':')[0]}00` : ''
  const found = forecast.findIndex((slot) => slot.time === startHour)
  const from = found === -1 ? 0 : found

  // 그중 가장 많이 오는 시간대를 고른다
  const worst = forecast
    .slice(from)
    .filter((slot) => slot.rainType !== '')
    .reduce((most, slot) => (most === null || slot.rain > most.rain ? slot : most), null)

  if (worst === null) {
    return { level: 'none', text: '예보상 비 없음' }
  }
  if (worst.rain >= 3) {
    return {
      level: 'high',
      text: `${worst.time.slice(0, 2)}시 ${worst.rainType} 시간당 ${worst.rain}mm`,
    }
  }
  return {
    level: 'low',
    text: `${worst.time.slice(0, 2)}시 ${worst.rainType} 약하게`,
  }
}
