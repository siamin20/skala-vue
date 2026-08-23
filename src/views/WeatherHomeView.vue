<script setup>
import { ref, computed, watch, watchEffect, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

import { stadiumList } from '../data/stadiums.js'
import { todayWeather } from '../data/todayWeather.js'
import { getWeather, skyText } from '../api/weatherApi.js'
import { getShortForecast, rainRisk } from '../api/kmaApi.js'
import { useMyProfileStore } from '../stores/myProfileStore.js'
import { useGameStore } from '../stores/gameStore.js'
import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/exercise/SearchBar.vue'
import WeatherCard from '../components/exercise/WeatherCard.vue'
import GameScore from '../components/exercise/GameScore.vue'

const router = useRouter()
const myProfileStore = useMyProfileStore()
const gameStore = useGameStore()

// 1. 반응형 상태
//    처음에는 목업으로 화면을 그리고, 마운트된 뒤 실제 날씨로 덮어쓴다.
const weatherList = ref(todayWeather)
const isLoading = ref(false)
const errorMessage = ref('')

// 구장별 비 예보. 날씨보다 늦게 도착해도 화면이 멈추지 않게 따로 담는다.
const rainMap = ref({})

// [추가] 기상청 예보를 구장마다 받아 온다. 돔구장은 비와 무관해서 건너뛴다.
//        날씨를 다 그린 뒤에 뒤따라 채우므로 첫 화면이 늦어지지 않는다.
const loadRain = async () => {
  for (const stadium of stadiumList) {
    if (stadium.isDome) {
      continue
    }
    try {
      const forecast = await getShortForecast(stadium.nx, stadium.ny)
      const risk = rainRisk(forecast, '18:30')
      if (risk && risk.level !== 'none') {
        rainMap.value = { ...rainMap.value, [stadium.id]: risk }
      }
    } catch (error) {
      console.warn(`[${stadium.name} 비 예보 실패]`, error.message)
    }
  }
}

// 2. 화면이 붙는 시점에 9개 구장 날씨를 불러온다.
//    한 도시가 실패해도 나머지는 보여 줘야 하므로 하나씩 순서대로 받는다.
let timer = 0

onMounted(async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const loaded = []
    for (const stadium of stadiumList) {
      const data = await getWeather(stadium.query)
      const before = todayWeather.find((item) => item.id === stadium.id)
      loaded.push({
        id: stadium.id,
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        status: skyText(data.weather[0].id),
        sky: data.weather[0].main,
        humidity: data.main.humidity,
        wind: Math.round(data.wind.speed),
        lat: data.coord.lat,
        lon: data.coord.lon,
        // 경기 유무는 날씨 API 가 주지 않아서 기존 값을 그대로 쓴다
        hasGame: before.hasGame,
      })
    }
    weatherList.value = loaded
  } catch (error) {
    errorMessage.value = '날씨를 불러오지 못했습니다. 목업 데이터로 보여 줍니다.'
    console.error('[날씨 조회 실패]', error)
  }

  // 날씨는 다 받았으니 여기서 로딩 표시를 끝낸다.
  isLoading.value = false

  // 경기 정보는 스토어가 실시간 -> 저장됨 -> 목업 순으로 알아서 물러선다.
  // 무료 호스팅이 깨어나는 데 오래 걸릴 수 있어서 기다리지 않고 화면부터 보여 준다.
  gameStore.loadGames()
  loadRain()
  // 티켓에 붙는 경기 상태도 1분마다 갱신한다
  timer = setInterval(() => {
    gameStore.loadGames()
    loadRain()
  }, 60000)
})

// 3. 경기 목록이 바뀌면 각 구장의 경기 유무를 다시 맞춘다.
//    원본 배열을 직접 고치면 다른 화면에도 영향이 가므로 새 배열을 만든다.
watch(
  () => gameStore.games,
  (newGames) => {
    const updated = []
    for (const item of weatherList.value) {
      updated.push({
        ...item,
        hasGame: newGames.some((game) => game.cityId === item.id),
      })
    }
    weatherList.value = updated
  },
)

const searchQuery = ref('')
const selectedCityInfo = ref('구장을 선택하지 않았습니다.')

// [추가] 펼쳐 놓은 카드의 구장 id. 같은 카드를 다시 누르면 접는다.
const openedId = ref('')

// 4. 구장 정보와 날씨를 하나로 합친다. 마스코트 표정도 여기서 정한다.
const ticketList = computed(() => {
  return stadiumList.map((stadium) => {
    const weather = weatherList.value.find((item) => item.id === stadium.id)
    // API 는 Clear / Clouds / Rain 같은 영문 값을 준다. 목업은 sky 가 없어 status 로 판단한다.
    const sky = weather.sky ? weather.sky : weather.status
    let skyIcon = '☀️'
    if (sky === 'Rain' || sky === 'Drizzle' || sky === 'Thunderstorm' || sky === '비') {
      skyIcon = '🌧️'
    } else if (sky === 'Snow') {
      skyIcon = '❄️'
    } else if (sky === 'Clouds' || sky === '구름') {
      skyIcon = '☁️'
    }

    return {
      id: stadium.id,
      name: stadium.name,
      stadium: stadium.stadium,
      team: stadium.team,
      isDome: stadium.isDome,
      color: stadium.color,
      color2: stadium.color2,
      temp: weather.temp,
      status: weather.status,
      humidity: weather.humidity,
      wind: weather.wind,
      hasGame: weather.hasGame,
      lat: weather.lat,
      lon: weather.lon,
      emoji: stadium.emoji,
      skyIcon: skyIcon,
      rain: rainMap.value[stadium.id],
    }
  })
})

// 5. 검색어가 도시 이름에 포함된 것만 걸러 낸다
const filteredWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()
  if (keyword === '') {
    return ticketList.value
  }
  return ticketList.value.filter((item) => item.name.includes(keyword))
})

// [추가] 오늘 경기가 있는 구장. 내 응원팀은 그중에서도 맨 위로 올린다.
const playingList = computed(() => {
  const list = filteredWeatherList.value.filter((item) => item.hasGame)
  const mine = list.filter((item) => item.id === myProfileStore.teamCityId)
  const others = list.filter((item) => item.id !== myProfileStore.teamCityId)
  return mine.concat(others)
})

// [추가] 경기가 없는 구장은 아래로 내린다
const restingList = computed(() => {
  return filteredWeatherList.value.filter((item) => !item.hasGame)
})

// 6. 오늘 경기가 열리는 구장 수 (직접 추가한 computed)
// [추가] 전광판 머리에 띄울 오늘 요약. 첫 화면에서 오늘을 한 줄로 알려 준다.
const hottest = computed(() => {
  return ticketList.value.reduce((most, item) => (item.temp > most.temp ? item : most))
})

const canceledCount = computed(() => {
  return gameStore.games.filter((item) => item.status === 'CANCELED').length
})

// 오늘 날짜를 '8월 23일 일요일' 로 적는다
const todayText = computed(() => {
  const now = new Date()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`
})

const gameCount = computed(() => {
  return filteredWeatherList.value.filter((item) => item.hasGame).length
})

// 7. 상태바 문구가 바뀔 때마다 기록
watch(selectedCityInfo, (newValue, oldValue) => {
  console.log(`[watch] 상태바 변경: "${oldValue}" -> "${newValue}"`)
})

// 8. 검색어는 감시 대상을 적지 않아도 되는 watchEffect 로 추적
watchEffect(() => {
  console.log(
    `[watchEffect] 검색어 "${searchQuery.value}" / 결과 ${filteredWeatherList.value.length}곳`,
  )
})

// 9. [추가] 어떤 카드를 펼쳤는지 기록한다
watch(openedId, (newId, oldId) => {
  console.log(`[watch/추가] 펼친 카드: "${oldId}" -> "${newId}"`)
})

// 10. 카드를 누르면 상태바 문구를 바꾸고, 그 카드를 펼치거나 접는다
const selectCard = (cityId) => {
  const found = ticketList.value.find((item) => item.id === cityId)
  selectedCityInfo.value = `${found.stadium} 입장권을 확인했습니다.`
  if (openedId.value === cityId) {
    openedId.value = ''
  } else {
    openedId.value = cityId
  }
}

// 11. 상세보기를 누르면 알림창 대신 상세 페이지로 이동한다
const goDetail = (cityId) => {
  router.push(`/weather/${cityId}`)
}

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div>
    <!-- 전광판 머리 — 오늘을 한 줄로 -->
    <div class="marquee">
      <div class="marquee-left">
        <p class="day">{{ todayText }}</p>
        <h1>오늘의 구장</h1>
      </div>

      <div class="marquee-stats">
        <span class="stat">
          <em>오늘 경기</em>
          <b>{{ gameCount }}</b>
        </span>
        <span class="stat">
          <em>우천취소</em>
          <b :class="{ warn: canceledCount > 0 }">{{ canceledCount }}</b>
        </span>
        <span class="stat wide">
          <em>최고 기온</em>
          <b>{{ hottest.name }} {{ hottest.temp }}<i>°</i></b>
        </span>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <BaseDashboardCard>
      <SearchBar
        :keyword="searchQuery"
        :total-count="ticketList.length"
        :result-count="filteredWeatherList.length"
        @update-query="searchQuery = $event"
      />
    </BaseDashboardCard>

    <!-- 오늘 경기가 열리는 구장이 먼저, 쉬는 구장은 아래로 -->
    <section v-if="playingList.length > 0" class="group">
      <p class="group-head"><span class="on"></span>오늘 경기 {{ playingList.length }}</p>
      <div class="ticket-grid">
        <WeatherCard
          v-for="item in playingList"
          :key="item.id"
          :city-item="item"
          :is-opened="openedId === item.id"
          @select-card="selectCard"
          @click-detail="goDetail"
        >
          <GameScore :game="gameStore.findGame(item.id)" compact />
        </WeatherCard>
      </div>
    </section>

    <section v-if="restingList.length > 0" class="group">
      <p class="group-head off">오늘 경기 없음 {{ restingList.length }}</p>
      <div class="ticket-grid">
        <WeatherCard
          v-for="item in restingList"
          :key="item.id"
          :city-item="item"
          :is-opened="openedId === item.id"
          @select-card="selectCard"
          @click-detail="goDetail"
        >
          <GameScore :game="gameStore.findGame(item.id)" compact />
        </WeatherCard>
      </div>
    </section>

    <p v-if="filteredWeatherList.length === 0" class="status-bar">찾는 구장이 없습니다.</p>

    <p class="status-bar">{{ selectedCityInfo }}</p>
  </div>
</template>

<style scoped>
/* 화면이 넓어도 글이 가로로 늘어지지 않게 폭을 묶는다 */
:global(.content > *) {
  max-width: 1120px;
  margin-left: auto;
  margin-right: auto;
}

/* ── 전광판 머리 ────────────────────────────── */
.marquee {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px 24px;
  margin-bottom: 16px;
  padding: 16px 18px;
  border: 1px solid var(--line);
  border-radius: 4px;
  background:
    linear-gradient(180deg, var(--panel) 0%, var(--ink) 100%),
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.02) 0 1px, transparent 1px 3px);
}
.day {
  margin: 0 0 4px 0;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--muted);
}
h1 {
  margin: 0;
  font-family: 'Galmuri11', sans-serif;
  font-size: 22px;
  color: var(--text);
}

.marquee-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
/* 전광판 칸처럼 이름 아래 숫자를 둔다 */
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 74px;
  padding: 8px 12px;
  border: 1px solid var(--line);
  border-radius: 3px;
  background-color: var(--ink);
}
.stat b {
  font-family: 'Galmuri11', sans-serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 1;
  color: var(--amber);
  text-shadow: 0 0 16px rgba(255, 176, 32, 0.45);
}
.stat b.warn {
  color: var(--red);
}
.stat b i {
  font-style: normal;
  font-size: 13px;
}
.stat em {
  font-style: normal;
  font-size: 10px;
  color: var(--muted);
  white-space: nowrap;
}
.stat.wide {
  min-width: 128px;
}
.stat.src b.tag {
  font-family: 'IBM Plex Sans KR', sans-serif;
  font-size: 12px;
  color: var(--green);
}

/* ── 목록 ──────────────────────────────────── */
/* 티켓은 비율이 있어야 표처럼 보인다. 가로로 늘이지 않고 격자로 깐다. */
.ticket-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  align-items: start;
  gap: 14px;
}
.group {
  margin-bottom: 16px;
}
.group-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 7px 2px;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--muted);
}
/* 경기가 있으면 전광판 불이 켜진 것처럼 초록 점을 찍는다 */
.group-head .on {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--green);
}
.group-head.off {
  color: var(--muted);
}

.error {
  margin: 0 0 12px 0;
  padding: 9px 12px;
  border: 1px solid var(--red);
  border-radius: 3px;
  font-size: 12px;
  color: var(--red);
}
.status-bar {
  margin: 12px 0 0 0;
  padding: 9px 12px;
  border: 1px dashed var(--line);
  border-radius: 3px;
  font-size: 11px;
  color: var(--muted);
}

@media (max-width: 720px) {
  .marquee {
    padding: 12px;
  }
  h1 {
    font-size: 18px;
  }
  .stat {
    min-width: 54px;
    padding: 6px 8px;
  }
  .stat b {
    font-size: 19px;
  }
}
</style>
