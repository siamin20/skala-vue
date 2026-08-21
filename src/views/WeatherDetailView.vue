<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { stadiumList } from '../data/stadiums.js'
import { todayWeather } from '../data/todayWeather.js'
import { getWeather, getAirPollution } from '../api/weatherApi.js'
import { getTodayGames } from '../api/kboApi.js'
import { todayGames } from '../data/todayGames.js'
import GameScore from '../components/exercise/GameScore.vue'
import { useConfigStore } from '../stores/configStore.js'

const configStore = useConfigStore()

const route = useRoute()
const router = useRouter()

const weatherList = ref(todayWeather)

const stadium = ref(null)
const weather = ref(null)
const game = ref(null)
const air = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

// 2. 주소창의 /weather/:cityId 값을 읽어서 화면이 붙는 시점에 데이터를 고른다
onMounted(async () => {
  const cityId = route.params.cityId
  console.log(`[onMounted] 상세 페이지 진입: ${cityId}`)

  stadium.value = stadiumList.find((item) => item.id === cityId)
  weather.value = weatherList.value.find((item) => item.id === cityId)

  // 오늘 이 구장 경기. 없으면 undefined 가 되므로 null 로 맞춰 둔다.
  const found = todayGames.find((item) => item.cityId === cityId)
  game.value = found === undefined ? null : found

  if (
    stadium.value === undefined ||
    stadium.value === null ||
    weather.value === undefined ||
    weather.value === null
  ) {
    return
  }

  // 실제 날씨와 대기오염을 불러온다. 대기오염은 위도·경도가 필요해서 날씨를 먼저 받는다.
  isLoading.value = true
  try {
    const data = await getWeather(stadium.value.query)
    weather.value = {
      id: cityId,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      tempMin: Math.round(data.main.temp_min),
      tempMax: Math.round(data.main.temp_max),
      status: data.weather[0].description,
      sky: data.weather[0].main,
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed),
      hasGame: weather.value.hasGame,
    }

    const airData = await getAirPollution(data.coord.lat, data.coord.lon)
    air.value = airData.list[0]

    // 오늘 경기도 백엔드에서 받아 온다. 없으면 위에서 넣어 둔 목업이 그대로 남는다.
    try {
      const games = await getTodayGames()
      const realGame = games.find((item) => item.cityId === cityId)
      game.value = realGame === undefined ? null : realGame
    } catch (kboError) {
      console.warn('[KBO 백엔드 없음] 목업 경기 정보를 사용합니다.', kboError.message)
    }
  } catch (error) {
    errorMessage.value = '실시간 정보를 불러오지 못했습니다.'
    console.error('[상세 조회 실패]', error)
  } finally {
    isLoading.value = false
  }
})

// [추가] 대기질 등급(1~5)을 우리말로 바꾼다
const airGrade = computed(() => {
  if (air.value === null) {
    return ''
  }
  const table = ['', '좋음', '보통', '나쁨', '매우 나쁨', '최악']
  return table[air.value.main.aqi]
})

// 3. 설정된 단위에 맞춘 온도
const displayTemp = computed(() => {
  if (weather.value === null || weather.value === undefined) {
    return 0
  }
  const rawTemp = weather.value.temp
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
})

// 4. 날씨를 보고 직관 준비물을 골라 준다 (직접 추가한 computed)
const packingList = computed(() => {
  const items = []
  if (weather.value === null || weather.value === undefined) {
    return items
  }
  if (weather.value.status === '비') {
    items.push('🧥 우비 (구장은 우산 반입이 안 됩니다)')
  }
  if (weather.value.status === '맑음') {
    items.push('🧴 선크림')
  }
  if (weather.value.temp >= 28) {
    items.push('🧊 얼음물')
  }
  if (weather.value.temp <= 25) {
    items.push('🧣 담요 (야간 경기는 쌀쌀합니다)')
  }
  if (weather.value.wind >= 6) {
    items.push('🧢 모자보다 후드')
  }
  if (air.value !== null && air.value.main.aqi >= 3) {
    items.push('😷 마스크 (미세먼지 ' + airGrade.value + ')')
  }
  return items
})

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div>
    <!-- 주소를 직접 고쳐 없는 구장으로 들어오는 경우를 막는다 -->
    <div v-if="stadium === null || stadium === undefined">
      <div class="page-head"><h1>구장 없음</h1></div>
      <p class="msg">주소에 적힌 구장 번호가 올바르지 않습니다.</p>
      <button @click="goHome">구장 목록으로</button>
    </div>

    <div v-else>
      <div class="page-head">
        <h1>{{ stadium.emoji }} {{ stadium.stadium }}</h1>
        <p class="count">{{ stadium.name }} · {{ stadium.team }}</p>
      </div>

      <p class="temp">
        {{ displayTemp }}<span class="unit">{{ configStore.unitSymbol }}</span>
      </p>
      <p class="meta">
        {{ weather.status }} · 습도 {{ weather.humidity }}% · 바람 {{ weather.wind }}m/s ·
        {{ weather.hasGame ? '18:30 경기' : '오늘 경기 없음' }}
      </p>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <h2>대기질</h2>
      <dl v-if="air !== null">
        <dt>통합 등급</dt>
        <dd>{{ airGrade }}</dd>
        <dt>미세먼지 PM10</dt>
        <dd>{{ air.components.pm10 }} ㎍/㎥</dd>
        <dt>초미세먼지 PM2.5</dt>
        <dd>{{ air.components.pm2_5 }} ㎍/㎥</dd>
      </dl>
      <p v-else class="msg">{{ isLoading ? '불러오는 중…' : '대기질 정보가 없습니다.' }}</p>

      <h2 class="gap">오늘 경기</h2>
      <GameScore :game="game" />

      <h2 class="gap">준비물</h2>
      <ul v-if="packingList.length > 0">
        <li v-for="(item, index) in packingList" :key="index">{{ item }}</li>
      </ul>
      <p v-else class="msg">특별히 챙길 것은 없습니다.</p>

      <h2>구장</h2>
      <dl>
        <dt>개장</dt>
        <dd>{{ stadium.opened }}년</dd>
        <dt>좌석</dt>
        <dd>{{ stadium.seats }}석</dd>
        <dt>지붕</dt>
        <dd>{{ stadium.isDome ? '돔구장 (비가 와도 경기함)' : '없음' }}</dd>
      </dl>

      <button @click="goHome">구장 목록으로</button>
    </div>
  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 10px;
  margin-bottom: 22px;
  border-bottom: 2px solid #1a1a1a;
}
h1 {
  margin: 0;
  font-family: 'Black Han Sans', sans-serif;
  font-size: 28px;
}
.count {
  margin: 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: #6d6a63;
}

/* 상세 화면에서도 온도가 가장 크다 */
.temp {
  margin: 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 84px;
  font-weight: 600;
  line-height: 0.95;
  letter-spacing: -0.03em;
}
.unit {
  /* ℃ 는 IBM Plex Mono 에 없는 글자라 본문 폰트로 지정해 숫자와 어긋나지 않게 한다 */
  font-family: 'IBM Plex Sans KR', sans-serif;
  font-size: 30px;
  color: #6d6a63;
}
.meta {
  margin: 8px 0 30px 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12.5px;
  color: #6d6a63;
}

h2 {
  margin: 0 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #1a1a1a;
  font-size: 14px;
}
ul {
  margin: 0 0 30px 0;
  padding: 0;
  list-style: none;
}
li {
  padding: 9px 0;
  border-bottom: 1px solid #cfccc4;
  font-size: 14px;
}
dl {
  margin: 0 0 30px 0;
  font-size: 14px;
}
dt {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  color: #6d6a63;
}
dd {
  margin: 2px 0 12px 0;
}
.gap {
  margin-top: 30px;
}
.error {
  padding: 10px 14px;
  margin-bottom: 16px;
  border: 1px solid #b3261e;
  font-size: 13px;
  color: #b3261e;
}
.msg {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #6d6a63;
}
button {
  padding: 9px 18px;
  background-color: transparent;
  border: 1px solid #1a1a1a;
  font-family: 'IBM Plex Sans KR', sans-serif;
  font-size: 13px;
  cursor: pointer;
}
button:hover {
  background-color: #1a1a1a;
  color: #fbfaf7;
}
</style>
