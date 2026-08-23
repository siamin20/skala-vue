import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 날씨 화면 전체가 함께 쓰는 설정. 컴포넌트끼리 props 로 내려보내지 않고 여기서 꺼내 쓴다.
export const useConfigStore = defineStore('config', () => {
  // 1. state : 온도 단위
  const unit = ref('celsius')

  // 2. getter : 지금 단위에 맞는 기호
  const unitSymbol = computed(() => {
    if (unit.value === 'fahrenheit') {
      return '℉'
    }
    return '℃'
  })

  // 3. action : 섭씨와 화씨를 번갈아 바꾼다
  const toggleUnit = () => {
    if (unit.value === 'celsius') {
      unit.value = 'fahrenheit'
    } else {
      unit.value = 'celsius'
    }
  }

  return { unit, unitSymbol, toggleUnit }
})
