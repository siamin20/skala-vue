import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 내 응원팀과 생년월일. 화면 여러 곳에서 쓰고, 브라우저를 껐다 켜도 남아 있어야 해서
// 값이 바뀔 때마다 로컬 스토리지에도 같이 저장한다.
export const useMyProfileStore = defineStore('myProfile', () => {
  // 1. state : 처음 열 때 저장해 둔 값이 있으면 가져오고, 없으면 빈 값으로 시작한다
  const teamCityId = ref(localStorage.getItem('myTeamCityId') || '')
  const birthday = ref(localStorage.getItem('myBirthday') || '')

  // 2. getter : 응원팀을 골랐는지, 생일을 넣었는지
  const hasTeam = computed(() => teamCityId.value !== '')
  const hasBirthday = computed(() => birthday.value !== '')

  // 3. action : 응원팀 설정. 같은 팀을 다시 고르면 해제한다.
  const setTeam = (cityId) => {
    if (teamCityId.value === cityId) {
      teamCityId.value = ''
      localStorage.removeItem('myTeamCityId')
    } else {
      teamCityId.value = cityId
      localStorage.setItem('myTeamCityId', cityId)
    }
  }

  const setBirthday = (value) => {
    birthday.value = value
    localStorage.setItem('myBirthday', value)
  }

  return { teamCityId, birthday, hasTeam, hasBirthday, setTeam, setBirthday }
})
