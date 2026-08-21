<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { stadiumList } from '../data/stadiums.js'
import { todayWeather } from '../data/todayWeather.js'

const route = useRoute()
const router = useRouter()

const weatherList = ref(todayWeather)

const stadium = ref(null)
const weather = ref(null)

// 2. 주소창의 /weather/:cityId 값을 읽어서 화면이 붙는 시점에 데이터를 고른다
onMounted(() => {
  const cityId = route.params.cityId
  console.log(`[onMounted] 상세 페이지 진입: ${cityId}`)

  stadium.value = stadiumList.find((item) => item.id === cityId)
  weather.value = weatherList.value.find((item) => item.id === cityId)
})

// 3. 날씨를 보고 직관 준비물을 골라 준다 (직접 추가한 computed)
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
      <h1>구장을 찾을 수 없습니다</h1>
      <p class="lead">주소에 적힌 구장 번호가 올바르지 않습니다.</p>
      <button @click="goHome">대시보드로 돌아가기</button>
    </div>

    <div v-else>
      <h1>{{ stadium.emoji }} {{ stadium.stadium }}</h1>
      <p class="lead">{{ stadium.name }} · {{ stadium.team }}</p>

      <div class="detail-box">
        <h3>오늘 날씨</h3>
        <p class="temp">{{ weather.temp }}°C</p>
        <p>{{ weather.status }} · 습도 {{ weather.humidity }}% · 바람 {{ weather.wind }}m/s</p>
        <p v-if="weather.hasGame">오늘 이 구장에서 경기가 열립니다.</p>
        <p v-else>오늘은 이 구장에 경기가 없습니다.</p>
      </div>

      <div class="detail-box">
        <h3>직관 준비물</h3>
        <ul v-if="packingList.length > 0">
          <li v-for="(item, index) in packingList" :key="index">{{ item }}</li>
        </ul>
        <p v-else>특별히 챙길 것은 없습니다. 몸만 가세요.</p>
      </div>

      <div class="detail-box">
        <h3>구장 정보</h3>
        <p>개장 {{ stadium.opened }}년 · 좌석 {{ stadium.seats }}석</p>
        <p v-if="stadium.isDome">돔구장이라 비가 와도 경기가 열립니다.</p>
      </div>

      <button @click="goHome">대시보드로 돌아가기</button>
    </div>
  </div>
</template>

<style scoped>
h1 {
  margin: 0 0 8px 0;
  font-family: 'Black Han Sans', sans-serif;
  font-size: 38px;
  line-height: 1.2;
  color: #2f2b24;
}
.lead {
  margin: 0 0 26px 0;
  font-size: 15px;
  color: #8b8271;
}
.detail-box {
  padding: 20px 24px;
  margin-bottom: 16px;
  background-color: #fffdf8;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(47, 43, 36, 0.08);
}
.detail-box h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  letter-spacing: 0.02em;
  color: #3d7a4f;
}
.temp {
  margin: 0 0 8px 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 52px;
  font-weight: 600;
  line-height: 1;
  color: #c96f3f;
}
.detail-box p {
  margin: 0 0 6px 0;
  color: #6b6355;
}
ul {
  margin: 0;
  padding-left: 4px;
  list-style: none;
}
li {
  padding: 10px 0;
  border-bottom: 1px dashed #e6e0d1;
  color: #2f2b24;
}
li:last-child {
  border-bottom: none;
}
button {
  padding: 11px 22px;
  background-color: #2f5d3f;
  border: none;
  border-radius: 24px;
  font-family: 'IBM Plex Sans KR', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #fffdf8;
  cursor: pointer;
}
button:hover {
  background-color: #24492f;
}
</style>
