import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 코드 챌린지 : 스토어의 세 가지(state / getter / action)를 하나씩 담은 가장 단순한 예.
export const useCounterStore = defineStore('counter', () => {
  // 1. state : 반응형 데이터
  const count = ref(0)

  // 2. getter : computed 로 계산된 값
  const doubleCount = computed(() => count.value * 2)

  // 3. action : 값을 바꾸는 함수. 바깥에서 직접 바꾸지 않고 이 함수를 거치게 한다.
  const increment = () => {
    count.value++
  }

  return { count, doubleCount, increment }
})
