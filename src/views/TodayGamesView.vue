<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

import { stadiumList } from '../data/stadiums.js'
import { todayWeather } from '../data/todayWeather.js'
import { useGameStore } from '../stores/gameStore.js'
import GameScore from '../components/exercise/GameScore.vue'
import { useConfigStore } from '../stores/configStore.js'

const configStore = useConfigStore()
const gameStore = useGameStore()

const router = useRouter()

// 1. 취소된 경기를 목록에서 빼는 스위치
const hideCanceled = ref(false)

// 경기 상태는 저녁 내내 예정에서 진행, 종료로 바뀐다.
// 화면을 열어 둔 채로도 따라가도록 1분마다 다시 받아 온다.
let timer = 0

onMounted(async () => {
  await gameStore.loadGames()
  timer = setInterval(() => {
    gameStore.loadGames()
  }, 60000)
})

onUnmounted(() => {
  clearInterval(timer)
})

// 2. 경기에 구장 이름과 그 구장 날씨를 붙인다
const gameList = computed(() => {
  return gameStore.games.map((game) => {
    const stadium = stadiumList.find((item) => item.id === game.cityId)
    const weather = todayWeather.find((item) => item.id === game.cityId)
    return {
      game: game,
      cityId: game.cityId,
      stadium: stadium.stadium,
      name: stadium.name,
      temp:
        configStore.unit === 'fahrenheit' ? Math.round((weather.temp * 9) / 5 + 32) : weather.temp,
      status: weather.status,
    }
  })
})

// 3. 스위치를 켜면 취소된 경기를 뺀다
const shownList = computed(() => {
  if (hideCanceled.value === false) {
    return gameList.value
  }
  return gameList.value.filter((item) => item.game.status !== 'CANCELED')
})

// 4. 취소된 경기 수
const canceledCount = computed(() => {
  return gameList.value.filter((item) => item.game.status === 'CANCELED').length
})

watch(hideCanceled, (newValue) => {
  console.log(`[watch] 취소 경기 제외: ${newValue}`)
})

const goDetail = (cityId) => {
  router.push(`/weather/${cityId}`)
}
</script>

<template>
  <div>
    <div class="page-head">
      <h1>오늘 경기</h1>
      <p class="count">
        <span class="source">{{ gameSource }}</span>
        <span>{{ gameList.length }}경기</span>
        <span>취소 {{ canceledCount }}</span>
      </p>
    </div>

    <label class="filter">
      <input type="checkbox" v-model="hideCanceled" />
      취소 경기 제외
    </label>

    <p v-if="shownList.length === 0" class="msg">
      {{ hideCanceled ? '오늘 열리는 경기가 없습니다.' : '오늘 편성된 경기가 없습니다.' }}
    </p>

    <div v-else class="game-list">
      <div v-for="item in shownList" :key="item.cityId" class="row">
        <div class="place">
          <p class="stadium">{{ item.stadium }}</p>
          <p class="weather">
            <span>{{ item.name }}</span>
            <span>{{ item.status }} {{ item.temp }}{{ configStore.unitSymbol }}</span>
          </p>
          <button @click="goDetail(item.cityId)">구장 상세</button>
        </div>
        <GameScore :game="item.game" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 10px;
  margin-bottom: 16px;
  border-bottom: 2px solid #004c86;
}
h1 {
  margin: 0;
  font-family: 'Galmuri11', sans-serif;
  font-size: 20px;
}
.count {
  display: flex;
  align-items: baseline;
  gap: 10px;
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

.filter {
  display: inline-block;
  margin-bottom: 20px;
  font-size: 13.5px;
  cursor: pointer;
}
.filter input {
  width: auto;
  margin-right: 5px;
  vertical-align: middle;
}

.game-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
/* 좁은 화면에서는 두 칸이 안 들어가므로 위아래로 쌓는다 */
.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  padding: 10px 12px;
  background-color: #fffdf4;
  border: 3px solid #004c86;
  border-radius: 8px;
  box-shadow: 3px 3px 0 #004c86;
}
@media (min-width: 620px) {
  .row {
    grid-template-columns: 168px minmax(0, 1fr);
    align-items: center;
  }
}
.stadium {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
.weather {
  display: flex;
  flex-wrap: wrap;
  gap: 3px 10px;
  margin: 3px 0 8px 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  color: #6d6a63;
}
.place button {
  padding: 4px 9px;
  background-color: transparent;
  border: 1px solid #004c86;
  font-family: 'IBM Plex Sans KR', sans-serif;
  font-size: 11.5px;
  cursor: pointer;
}
.place button:hover {
  background-color: #004c86;
  color: #fbfaf7;
}
.msg {
  font-size: 14px;
  color: #6d6a63;
}
</style>
