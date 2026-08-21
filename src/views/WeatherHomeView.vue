<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

import { stadiumList } from '../data/stadiums.js'
import { todayWeather } from '../data/todayWeather.js'
import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/exercise/SearchBar.vue'
import WeatherCard from '../components/exercise/WeatherCard.vue'

const router = useRouter()

// 1. 반응형 상태
const weatherList = ref(todayWeather)

const searchQuery = ref('')
const selectedCityInfo = ref('입장권을 눌러 보세요.')

// 2. 구장 정보와 날씨를 하나로 합친다. 마스코트 표정도 여기서 정한다.
const ticketList = computed(() => {
  return stadiumList.map((stadium) => {
    const weather = weatherList.value.find((item) => item.id === stadium.id)
    let face = '😀'
    if (!weather.hasGame) {
      face = '😴'
    } else if (stadium.isDome) {
      face = '😎'
    } else if (weather.status === '비') {
      face = '🥲'
    } else if (weather.temp >= 33) {
      face = '🥵'
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
      face: face,
    }
  })
})

// 3. 검색어가 도시 이름에 포함된 것만 걸러 낸다
const filteredWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()
  if (keyword === '') {
    return ticketList.value
  }
  return ticketList.value.filter((item) => item.name.includes(keyword))
})

// 4. 오늘 경기가 열리는 구장 수 (직접 추가한 computed)
const gameCount = computed(() => {
  return filteredWeatherList.value.filter((item) => item.hasGame).length
})

// 5. 상태바 문구가 바뀔 때마다 기록
watch(selectedCityInfo, (newValue, oldValue) => {
  console.log(`[watch] 상태바 변경: "${oldValue}" -> "${newValue}"`)
})

// 6. 검색어는 감시 대상을 적지 않아도 되는 watchEffect 로 추적
watchEffect(() => {
  console.log(
    `[watchEffect] 검색어 "${searchQuery.value}" / 결과 ${filteredWeatherList.value.length}곳`,
  )
})

// 7. 상세보기를 누르면 알림창 대신 상세 페이지로 이동한다
const goDetail = (cityId) => {
  router.push(`/weather/${cityId}`)
}
</script>

<template>
  <div>
    <header class="hero">
      <p class="eyebrow">KBO 9개 구장 · 오늘</p>
      <h1>오늘 직관 갈까?</h1>
      <p class="lead">가기 전에 딱 한 번. 날씨 보고 뭘 챙길지 정하세요.</p>

      <div class="summary">
        <div class="summary-item">
          <span class="summary-num">{{ gameCount }}</span>
          <span class="summary-label">오늘 경기</span>
        </div>
        <div class="summary-item">
          <span class="summary-num">{{ filteredWeatherList.length }}</span>
          <span class="summary-label">보이는 구장</span>
        </div>
        <div class="summary-item">
          <span class="summary-num">{{ ticketList.length }}</span>
          <span class="summary-label">전체 구장</span>
        </div>
      </div>
    </header>

    <BaseDashboardCard>
      <template #title>🔍 도시 검색</template>
      <SearchBar
        :keyword="searchQuery"
        :total-count="ticketList.length"
        :result-count="filteredWeatherList.length"
        @update-query="searchQuery = $event"
      />
    </BaseDashboardCard>

    <h2 class="section-title">🎫 오늘의 입장권</h2>
    <div class="ticket-grid">
      <WeatherCard
        v-for="item in filteredWeatherList"
        :key="item.id"
        :city-item="item"
        @select-card="selectedCityInfo = $event"
        @click-detail="goDetail"
      />
    </div>

    <div class="status-bar">{{ selectedCityInfo }}</div>
  </div>
</template>

<style scoped>
.hero {
  padding: 8px 0 28px 0;
}
.eyebrow {
  margin: 0 0 8px 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.12em;
  color: #8b8271;
}
h1 {
  margin: 0 0 10px 0;
  font-family: 'Black Han Sans', sans-serif;
  font-size: 46px;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: #2f2b24;
}
.lead {
  margin: 0 0 24px 0;
  font-size: 16px;
  color: #6b6355;
}

.summary {
  display: flex;
  gap: 10px;
}
.summary-item {
  flex: 0 0 auto;
  min-width: 108px;
  padding: 14px 18px;
  background-color: #fffdf8;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(47, 43, 36, 0.08);
}
.summary-num {
  display: block;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 28px;
  font-weight: 600;
  line-height: 1.1;
  color: #c96f3f;
}
.summary-label {
  display: block;
  margin-top: 4px;
  font-size: 12.5px;
  color: #8b8271;
}

.section-title {
  margin: 32px 0 14px 0;
  font-size: 18px;
  color: #2f2b24;
}
.ticket-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 16px;
}

.status-bar {
  margin-top: 28px;
  padding: 14px 20px;
  background-color: #2f2b24;
  border-radius: 10px;
  font-size: 14.5px;
  color: #f2efe6;
}
</style>
