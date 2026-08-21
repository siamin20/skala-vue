import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { todayGames } from '../data/todayGames.js'
import { getTodayGames } from '../api/kboApi.js'

// 오늘 경기 정보를 한곳에서 관리한다.
// 백엔드가 꺼져 있거나 배포본처럼 서버가 아예 없는 경우를 대비해 세 단계로 물러선다.
//   1) 실시간  — 백엔드에서 방금 받아 온 값
//   2) 저장됨  — 마지막으로 성공했을 때 저장해 둔 값
//   3) 목업    — 소스에 적어 둔 값
export const useGameStore = defineStore('game', () => {
  // 1. state
  const games = ref(todayGames)
  const source = ref('목업')
  const savedDate = ref('')

  // 2. getter — 저장된 값이 오늘 것인지
  const isToday = computed(() => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = today.getMonth() + 1
    const dd = today.getDate()
    return savedDate.value === `${yyyy}-${mm}-${dd}`
  })

  // 3. action — 불러오기.
  //    무료 호스팅은 깨어나는 데 30초쯤 걸리므로, 저장해 둔 값을 먼저 보여 주고
  //    응답이 오면 그때 실시간 값으로 바꾼다. 기다리는 동안 화면이 비지 않는다.
  const loadGames = async () => {
    const saved = localStorage.getItem('lastGames')
    const savedStamp = localStorage.getItem('lastGamesDate')
    if (saved) {
      games.value = JSON.parse(saved)
      savedDate.value = savedStamp ? savedStamp : ''
      source.value = '저장됨'
    }

    try {
      const loaded = await getTodayGames()
      games.value = loaded
      source.value = '실시간'

      // 다음에 서버가 없을 때 쓰려고 저장해 둔다
      const today = new Date()
      const stamp = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
      savedDate.value = stamp
      localStorage.setItem('lastGames', JSON.stringify(loaded))
      localStorage.setItem('lastGamesDate', stamp)
      return
    } catch (error) {
      console.warn('[KBO 백엔드 응답 없음]', error.message)
    }

    // 저장해 둔 값도 없으면 소스에 적어 둔 목업으로 물러선다
    if (!saved) {
      games.value = todayGames
      source.value = '목업'
    }
  }

  // 4. 구장 하나의 경기를 찾는다. 없으면 null.
  const findGame = (cityId) => {
    const found = games.value.find((item) => item.cityId === cityId)
    if (found === undefined) {
      return null
    }
    return found
  }

  return { games, source, savedDate, isToday, loadGames, findGame }
})
