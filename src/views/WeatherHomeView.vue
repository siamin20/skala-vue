<script setup>
import { ref, computed, watch, watchEffect, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

import { stadiumList } from '../data/stadiums.js'
import { todayWeather } from '../data/todayWeather.js'
import { getWeather, skyText } from '../api/weatherApi.js'
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
  // 티켓에 붙는 경기 상태도 1분마다 갱신한다
  timer = setInterval(() => {
    gameStore.loadGames()
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

// [추가] 내 응원팀 구장을 맨 위로 올린 목록
const sortedList = computed(() => {
  const mine = filteredWeatherList.value.filter((item) => item.id === myProfileStore.teamCityId)
  const others = filteredWeatherList.value.filter((item) => item.id !== myProfileStore.teamCityId)
  return mine.concat(others)
})

// 6. 오늘 경기가 열리는 구장 수 (직접 추가한 computed)
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
    <div class="page-head">
      <h1>오늘의 구장</h1>
      <p v-if="isLoading" class="count">불러오는 중…</p>
      <p v-else class="count">
        <span class="source">{{ gameSource }}</span
        >경기 {{ gameCount }} / 전체 {{ ticketList.length }}
      </p>
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

    <BaseDashboardCard>
      <div class="ticket-grid">
        <WeatherCard
          v-for="item in sortedList"
          :key="item.id"
          :city-item="item"
          :is-opened="openedId === item.id"
          @select-card="selectCard"
          @click-detail="goDetail"
        >
          <GameScore :game="gameStore.findGame(item.id)" compact />
        </WeatherCard>
      </div>
    </BaseDashboardCard>

    <p class="status-bar">{{ selectedCityInfo }}</p>
  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 6px;
  margin-bottom: 10px;
  border-bottom: 3px solid #004c86;
}
h1 {
  margin: 0;
  font-family: 'Galmuri11', sans-serif;
  font-size: 20px;
}
.count {
  margin: 0;
  font-family: 'Galmuri11', monospace;
  font-size: 11px;
  color: #6d6a63;
}
.source {
  padding: 2px 7px;
  margin-right: 7px;
  border: 1px solid #cfccc4;
  font-size: 11px;
}

.error {
  padding: 10px 14px;
  margin-bottom: 16px;
  border: 1px solid #b3261e;
  font-size: 13px;
  color: #b3261e;
}
.ticket-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(205px, 1fr));
  align-items: start;
  gap: 10px;
}

.status-bar {
  margin: 22px 0 0 0;
  padding: 10px 14px;
  border: 1px dashed #9b978e;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12.5px;
  color: #6d6a63;
}
</style>
