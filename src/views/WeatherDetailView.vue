<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { stadiumList } from '../data/stadiums.js'
import { todayWeather } from '../data/todayWeather.js'
import { getWeather, getAirPollution, skyText } from '../api/weatherApi.js'
import { getShortForecast, rainRisk } from '../api/kmaApi.js'

import GameScore from '../components/exercise/GameScore.vue'
import { useConfigStore } from '../stores/configStore.js'
import { useGameStore } from '../stores/gameStore.js'

const configStore = useConfigStore()
const gameStore = useGameStore()

const route = useRoute()
const router = useRouter()

const weatherList = ref(todayWeather)

const stadium = ref(null)
const weather = ref(null)
const game = ref(null)
const air = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

// public/logos/{id}.png 가 없으면 이모지를 대신 보여 준다.
const logoFailed = ref(false)

// 기상청 초단기예보 (앞으로 6시간)
const forecast = ref([])
const forecastFailed = ref(false)

// 2. 주소창의 /weather/:cityId 값을 읽어서 화면이 붙는 시점에 데이터를 고른다
onMounted(async () => {
  const cityId = route.params.cityId
  console.log(`[onMounted] 상세 페이지 진입: ${cityId}`)

  stadium.value = stadiumList.find((item) => item.id === cityId)
  weather.value = weatherList.value.find((item) => item.id === cityId)

  // 오늘 이 구장 경기. 없으면 undefined 가 되므로 null 로 맞춰 둔다.
  game.value = gameStore.findGame(cityId)

  // == null 은 null 과 undefined 를 한 번에 걸러 준다
  if (stadium.value == null || weather.value == null) {
    return
  }

  // 실제 날씨와 대기오염을 불러온다. 대기오염은 위도·경도가 필요해서 날씨를 먼저 받는다.
  isLoading.value = true
  try {
    const { main, weather: sky, wind, coord } = await getWeather(stadium.value.query)
    weather.value = {
      id: cityId,
      temp: Math.round(main.temp),
      feelsLike: Math.round(main.feels_like),
      tempMin: Math.round(main.temp_min),
      tempMax: Math.round(main.temp_max),
      status: skyText(sky[0].id),
      sky: sky[0].main,
      humidity: main.humidity,
      wind: Math.round(wind.speed),
      hasGame: weather.value.hasGame,
    }

    const airData = await getAirPollution(coord.lat, coord.lon)
    air.value = airData.list[0]

    // 경기 정보는 스토어가 실시간 -> 저장됨 -> 목업 순으로 알아서 물러선다.
    await gameStore.loadGames()
    game.value = gameStore.findGame(cityId)
  } catch (error) {
    errorMessage.value = '실시간 정보를 불러오지 못했습니다.'
    console.error('[상세 조회 실패]', error)
  } finally {
    isLoading.value = false
  }

  // 기상청 예보는 따로 받는다. 이게 실패해도 위 정보는 그대로 보여야 한다.
  try {
    forecast.value = await getShortForecast(stadium.value.nx, stadium.value.ny)
  } catch (error) {
    forecastFailed.value = true
    console.error('[기상청 예보 실패]', error)
  }
})

// 3. 구장 분위기를 색으로 깔아 준다.
//    사진은 저작권이 걸려서 구단 색 두 개를 크게 번지게 해 흐릿한 배경을 만든다.
const fieldStyle = computed(() => {
  if (stadium.value == null) {
    return {}
  }
  const first = stadium.value.color
  const second = stadium.value.color2 ? stadium.value.color2 : first
  return {
    backgroundImage:
      `radial-gradient(70% 55% at 18% 0%, ${first} 0%, transparent 62%),` +
      `radial-gradient(60% 50% at 92% 12%, ${second} 0%, transparent 58%)`,
  }
})

// 4. 경기 시각에 비가 오는지 한 줄로 정리한다. 돔구장은 비와 상관없다.
const rainLine = computed(() => {
  if (stadium.value == null || stadium.value.isDome) {
    return null
  }
  return rainRisk(forecast.value, game.value?.startTime ?? '')
})

// [추가] 대기질 등급(1~5)을 우리말로 바꾼다
const airGrade = computed(() => {
  const table = ['', '좋음', '보통', '나쁨', '매우 나쁨', '최악']
  return table[air.value?.main.aqi] ?? ''
})

// [추가] 등급을 막대 길이(0~100)로 바꾼다
const airPercent = computed(() => {
  return (air.value?.main.aqi ?? 0) * 20
})

// [추가] 등급이 나쁠수록 붉게
const airColor = computed(() => {
  const table = ['', '#3d7a4f', '#7aa63d', '#d99a2b', '#d4622b', '#b3261e']
  return table[air.value?.main.aqi] ?? '#9b978e'
})

// 3. 설정된 단위에 맞춘 온도
const displayTemp = computed(() => {
  const rawTemp = weather.value?.temp
  if (rawTemp == null) {
    return 0
  }
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
})

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div>
    <!-- 주소를 직접 고쳐 없는 구장으로 들어오는 경우를 막는다 -->
    <div v-if="stadium == null">
      <div class="page-head"><h1>구장 없음</h1></div>
      <p class="msg">주소에 적힌 구장 번호가 올바르지 않습니다.</p>
      <button @click="goHome">구장 목록으로</button>
    </div>

    <div v-else class="detail">
      <!-- 구단 색이 번진 배경. 글씨를 가리지 않게 흐리고 어둡게 깐다. -->
      <span class="field" :style="fieldStyle"></span>

      <div class="page-head">
        <div class="title-row">
          <!-- 구단 로고를 구단 색 판에 얹어 어느 구장인지 한눈에 보이게 한다 -->
          <span class="logo-badge" :style="{ borderColor: stadium.color }">
            <img
              v-if="!logoFailed"
              class="logo"
              :src="`/logos/emblem/${stadium.id}.png`"
              :alt="stadium.team"
              @error="logoFailed = true"
            />
            <span v-else class="face">{{ stadium.emoji }}</span>
          </span>
          <div>
            <h1>{{ stadium.stadium }}</h1>
            <p class="count">
              <span>{{ stadium.name }}</span>
              <span>{{ stadium.team }}</span>
            </p>
          </div>
        </div>
      </div>

      <p class="temp">
        {{ displayTemp }}<span class="unit">{{ configStore.unitSymbol }}</span>
      </p>
      <p class="meta">
        <span>{{ weather.status }}</span>
        <span>습도 {{ weather.humidity }}%</span>
        <span>바람 {{ weather.wind }}m/s</span>
        <span>{{ weather.hasGame ? '18:30 경기' : '오늘 경기 없음' }}</span>
      </p>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <!-- 기상청 초단기예보. 발표 시각부터 6시간 앞까지 1시간 간격으로 온다.
           돔구장은 비와 무관하므로 아예 띄우지 않는다. -->
      <template v-if="!stadium.isDome">
        <h2>비 예보</h2>
        <p v-if="forecastFailed" class="msg-small">기상청 예보를 불러오지 못했습니다.</p>
        <p v-else-if="forecast.length === 0" class="msg-small">불러오는 중</p>
        <div v-else>
          <p class="rain-line" :class="rainLine.level">{{ rainLine.text }}</p>

          <ul class="hours">
            <li v-for="slot in forecast" :key="slot.time" :class="{ wet: slot.rainType !== '' }">
              <span class="hour">{{ slot.time.slice(0, 2) }}시</span>
              <span class="what">{{ slot.rainType === '' ? '—' : slot.rainType }}</span>
              <span class="mm">{{ slot.rainType === '' ? '' : slot.rain + 'mm' }}</span>
            </li>
          </ul>

          <p class="credit">자료 제공 기상청</p>
        </div>
      </template>

      <h2>대기질</h2>
      <div v-if="air !== null">
        <el-progress
          :percentage="airPercent"
          :color="airColor"
          :stroke-width="18"
          :show-text="false"
        />
        <p class="air-grade" :style="{ color: airColor }">{{ airGrade }}</p>
        <dl>
          <dt>미세먼지 PM10</dt>
          <dd>{{ air.components.pm10 }} ㎍/㎥</dd>
          <dt>초미세먼지 PM2.5</dt>
          <dd>{{ air.components.pm2_5 }} ㎍/㎥</dd>
        </dl>
      </div>
      <p v-else class="msg">{{ isLoading ? '불러오는 중…' : '대기질 정보가 없습니다.' }}</p>

      <h2 class="gap">오늘 경기</h2>
      <GameScore :game="game" />

      <h2>구장</h2>
      <dl>
        <dt>개장</dt>
        <dd>{{ stadium.opened }}년</dd>
        <dt>좌석</dt>
        <dd>{{ stadium.seats }}석</dd>
      </dl>

      <button @click="goHome">구장 목록으로</button>
    </div>
  </div>
</template>

<style scoped>
.detail {
  position: relative;
}
/* 구단 색이 퍼지며 구장에 들어선 느낌을 준다 */
@keyframes spread {
  from {
    opacity: 0;
    transform: scale(0.7);
  }
  to {
    opacity: 0.34;
    transform: scale(1);
  }
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
/* 구장 분위기 배경 — 구단 색을 크게 번지게 하고 세게 흐린다 */
.field {
  animation: spread 0.72s ease-out both;
  position: fixed;
  top: 52px;
  left: 0;
  right: 0;
  height: 340px;
  z-index: 0;
  opacity: 0.34;
  filter: blur(58px);
  pointer-events: none;
}
/* 머리말이 배경보다 살짝 늦게 올라온다 */
.detail .page-head {
  animation: rise 0.4s 0.06s ease-out both;
}
.detail .temp,
.detail .meta {
  animation: rise 0.44s 0.12s ease-out both;
}
/* 배경 위에 내용이 올라오게 */
.detail > *:not(.field) {
  position: relative;
  z-index: 1;
}
.page-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 10px;
  margin-bottom: 22px;
  border-bottom: 2px solid var(--line);
}
/* 비 예보 */
.msg-small {
  margin: 0 0 6px 0;
  font-size: 13.5px;
  color: var(--muted);
}
.rain-line {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 700;
}
.rain-line.none {
  color: var(--green);
}
.rain-line.low {
  color: var(--amber);
}
.rain-line.high {
  color: var(--red);
}
.hours {
  display: flex;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-x: auto;
}
.hours li {
  flex: 1 0 62px;
  padding: 8px 4px;
  border: 1px solid var(--line);
  text-align: center;
  background-color: var(--panel);
}
.hours li.wet {
  border-color: var(--line);
  background-color: var(--panel-2);
}
.hours .hour {
  display: block;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: var(--muted);
}
.hours .what {
  display: block;
  margin-top: 3px;
  font-size: 13px;
}
.hours .mm {
  display: block;
  min-height: 14px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: var(--red);
}
/* 공공데이터 이용허락범위가 "저작자 표시"라 출처를 반드시 밝힌다 */
.credit {
  margin: 8px 0 0 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: var(--muted);
}

h1 {
  margin: 0;
  font-family: 'Galmuri11', sans-serif;
  font-size: 20px;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.logo-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 96px;
  height: 96px;
  border: 3px solid var(--line);
  border-radius: 12px;
  /* 구단 엠블럼이 흰 바탕으로 만들어져 있어 판도 희게 두고 테두리로 구단색을 준다 */
  background-color: #fff;
}
.logo-badge .logo {
  width: 84px;
  height: 84px;
  object-fit: contain;
}
.logo-badge .face {
  font-size: 46px;
}
.count {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0;
  font-size: 11px;
  color: var(--muted);
}

/* 상세 화면에서도 온도가 가장 크다 */
.temp {
  margin: 0;
  font-family: 'Galmuri11', sans-serif;
  color: var(--amber);
  font-size: 84px;
  font-weight: 600;
  line-height: 0.95;
  letter-spacing: -0.03em;
}
.unit {
  /* ℃ 는 IBM Plex Mono 에 없는 글자라 본문 폰트로 지정해 숫자와 어긋나지 않게 한다 */
  font-family: 'IBM Plex Sans KR', sans-serif;
  font-size: 30px;
  color: var(--muted);
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin: 8px 0 30px 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12.5px;
  color: var(--muted);
}

h2 {
  margin: 22px 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--line);
  font-size: 14px;
}
ul {
  margin: 0 0 30px 0;
  padding: 0;
  list-style: none;
}
li {
  padding: 9px 0;
  border-bottom: 1px solid var(--line);
  font-size: 14px;
}
/* 이름과 값을 위아래로 쌓으면 줄 간격이 들쭉날쭉해 보인다.
   두 칸으로 나란히 놓고 줄마다 같은 간격을 준다. */
dl {
  display: grid;
  grid-template-columns: 132px 1fr;
  align-items: baseline;
  margin: 0 0 30px 0;
  font-size: 14px;
  line-height: 1.5;
}
.air-grade {
  margin: 8px 0 14px 0;
  font-size: 17px;
  font-weight: 600;
}
/* Element Plus 막대를 전광판 톤에 맞춘다 */
:deep(.el-progress-bar__outer),
:deep(.el-progress-bar__inner) {
  border-radius: 0;
}
:deep(.el-progress-bar__outer) {
  background-color: var(--panel-2);
}
dt {
  padding: 9px 0 8px 0;
  border-top: 1px solid var(--line);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  color: var(--muted);
}
dd {
  margin: 0;
  padding: 8px 0;
  border-top: 1px solid var(--line);
}
/* 첫 줄 위에는 h2 밑줄이 이미 있어 겹치지 않게 뗀다 */
dl dt:first-of-type,
dl dt:first-of-type + dd {
  border-top: none;
}
.gap {
  margin-top: 26px;
}
.error {
  padding: 10px 14px;
  margin-bottom: 16px;
  border: 1px solid var(--red);
  font-size: 13px;
  color: var(--red);
}
.msg {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: var(--muted);
}
button {
  padding: 9px 18px;
  background-color: transparent;
  border: 1px solid var(--line);
  font-family: 'IBM Plex Sans KR', sans-serif;
  font-size: 13px;
  cursor: pointer;
}
button:hover {
  background-color: var(--line);
  color: var(--panel);
}
</style>
