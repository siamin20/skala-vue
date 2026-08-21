<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { playerList } from '../data/players.js'
import { getIljin } from '../data/iljin.js'
import { stadiumList } from '../data/stadiums.js'
import { getSaju } from '../api/kboApi.js'
import { useMyProfileStore } from '../stores/myProfileStore.js'

const router = useRouter()
const myProfileStore = useMyProfileStore()

// 1. 입력한 생년월일. 스토어에 저장해 둔 값이 있으면 그걸로 시작한다.
const birthday = ref(myProfileStore.birthday)

// 화면에 치는 값은 숫자 8자리만 담는다. 하이픈은 넣지 않는다.
const birthText = ref(myProfileStore.birthday.split('-').join(''))
const errorMessage = ref('')
const mySaju = ref(null)
const isLoading = ref(false)
const noticeMessage = ref('')

// 한 자리 수는 앞에 0을 붙여 준다.
const padZero = (value) => {
  return value < 10 ? '0' + value : '' + value
}

// 그 달의 마지막 날. 2월은 윤년을 따진다.
const lastDayOf = (year, month) => {
  const table = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (month === 2) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    return isLeap ? 29 : 28
  }
  return table[month - 1]
}

// 아직 안 친 자리는 Y·M·D 로 남겨 어디까지 쳤는지 보여 준다.
const birthMask = computed(() => {
  const slot = ['Y', 'Y', 'Y', 'Y', 'M', 'M', 'D', 'D']
  let text = ''
  for (let i = 0; i < 8; i++) {
    text = text + (i < birthText.value.length ? birthText.value.charAt(i) : slot[i])
    if (i === 3 || i === 5) {
      text = text + '  '
    }
  }
  return text
})

// 숫자만 8자리까지 받고, 다 차면 날짜가 맞는지 검사한다.
const onBirthInput = (value) => {
  let digits = ''
  for (let i = 0; i < value.length; i++) {
    const ch = value.charAt(i)
    if (ch >= '0' && ch <= '9' && digits.length < 8) {
      digits = digits + ch
    }
  }
  birthText.value = digits
  errorMessage.value = ''

  if (digits.length < 8) {
    return
  }

  const year = Number(digits.slice(0, 4))
  const month = Number(digits.slice(4, 6))
  const day = Number(digits.slice(6, 8))
  const thisYear = new Date().getFullYear()

  if (year < 1900 || year > thisYear) {
    errorMessage.value = `연도는 1900 ~ ${thisYear} 사이로 넣어 주세요.`
    return
  }
  if (month < 1 || month > 12) {
    errorMessage.value = '월은 01 ~ 12 사이로 넣어 주세요.'
    return
  }
  const last = lastDayOf(year, month)
  if (day < 1 || day > last) {
    errorMessage.value = `${month}월은 ${last}일까지 있습니다.`
    return
  }

  birthday.value = `${year}-${padZero(month)}-${padZero(day)}`
}

// 2. 내 사주를 받아 온다.
//    연주·월주는 절기 기준이라 백엔드가 만세력을 대신 조회해 준다.
//    서버가 없거나 실패하면 날짜만으로 구할 수 있는 일주만 채운다.
const loadSaju = async (dateText) => {
  const parts = dateText.split('-')
  const iljin = getIljin(dateText)

  isLoading.value = true
  noticeMessage.value = ''
  try {
    const { year, month, day } = await getSaju(...parts.map(Number))
    mySaju.value = { year, month, day, iljin }
  } catch (error) {
    console.warn('[사주 조회 실패] 일주만 계산해서 보여 줍니다.', error.message)
    mySaju.value = { year: '', month: '', day: iljin.hanja, iljin }
    noticeMessage.value = '연주와 월주는 서버가 있어야 볼 수 있습니다. 일주로만 비교합니다.'
  } finally {
    isLoading.value = false
  }
}

// 3. 선수마다 나와 얼마나 겹치는지 점수를 매긴다.
//    세 기둥(연·월·일)을 각각 천간과 지지로 나눠 비교한다.
//    일주는 사주에서 본인을 뜻하는 자리라 가장 무겁게 본다.
const matchList = computed(() => {
  if (mySaju.value === null) {
    return []
  }

  const scored = []
  for (const player of playerList) {
    let score = 0
    const reasons = []

    if (player.day === mySaju.value.day) {
      score = score + 4
      reasons.push('일주가 같음')
    } else {
      if (player.day.charAt(0) === mySaju.value.day.charAt(0)) {
        score = score + 2
        reasons.push('일간이 같음')
      }
      if (player.day.charAt(1) === mySaju.value.day.charAt(1)) {
        score = score + 2
        reasons.push('일지가 같음')
      }
    }

    if (mySaju.value.month) {
      if (player.month === mySaju.value.month) {
        score = score + 2
        reasons.push('월주가 같음')
      } else if (player.month.charAt(1) === mySaju.value.month.charAt(1)) {
        score = score + 1
        reasons.push('같은 절기에 태어남')
      }
    }

    if (mySaju.value.year) {
      if (player.year === mySaju.value.year) {
        score = score + 2
        reasons.push('연주가 같음')
      } else if (player.year.charAt(1) === mySaju.value.year.charAt(1)) {
        score = score + 1
        reasons.push('같은 띠')
      }
    }

    if (score > 0) {
      scored.push({ ...player, score, reasons })
    }
  }

  // 점수가 높은 순, 같으면 이름 순
  return scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }
    return a.name > b.name ? 1 : -1
  })
})

// 4. 가장 많이 겹치는 선수 한 명
const bestMatch = computed(() => {
  if (matchList.value.length === 0) {
    return null
  }
  return matchList.value[0]
})

// 5. 생년월일이 바뀌면 저장해 두고 사주를 다시 받아 온다
watch(birthday, (newValue) => {
  if (newValue) {
    myProfileStore.setBirthday(newValue)
    console.log(`[watch] 생년월일 변경: ${newValue} (일진 ${getIljin(newValue).name})`)
    loadSaju(newValue)
  }
})

// 6. 화면에 들어올 때 저장해 둔 생년월일이 있으면 바로 조회한다
onMounted(() => {
  if (birthday.value) {
    loadSaju(birthday.value)
  }
})

const goStadium = (cityId) => {
  router.push(`/weather/${cityId}`)
}

const stadiumOf = (cityId) => {
  const found = stadiumList.find((item) => item.id === cityId)
  return found ? found.stadium : ''
}
</script>

<template>
  <div>
    <div class="page-head">
      <h1>나와 닮은 선수</h1>
      <p class="count">선수 {{ playerList.length }}명</p>
    </div>

    <p class="lead">
      생년월일을 숫자 여덟 자리로 넣으면 사주 네 기둥을 세워, 글자가 가장 많이 겹치는 KBO 선수를
      찾아 줍니다.
    </p>

    <div class="input-row">
      <div class="birth-box">
        <el-input
          :model-value="birthText"
          size="large"
          inputmode="numeric"
          maxlength="8"
          placeholder="19980312"
          @input="onBirthInput"
        />
        <p class="birth-mask">{{ birthMask }}</p>
      </div>
      <span v-if="isLoading" class="my-iljin">사주를 보는 중…</span>
    </div>
    <p v-if="errorMessage" class="notice">{{ errorMessage }}</p>

    <!-- 사주 네 기둥. 태어난 시각은 받지 않아 시주 자리는 비워 둔다. -->
    <table v-if="mySaju" class="pillars">
      <thead>
        <tr>
          <th>시주</th>
          <th>일주</th>
          <th>월주</th>
          <th>연주</th>
        </tr>
      </thead>
      <tbody>
        <tr class="gan">
          <td class="empty"></td>
          <td>{{ mySaju.day.charAt(0) }}</td>
          <td :class="{ empty: !mySaju.month }">{{ mySaju.month.charAt(0) }}</td>
          <td :class="{ empty: !mySaju.year }">{{ mySaju.year.charAt(0) }}</td>
        </tr>
        <tr class="ji">
          <td class="empty"></td>
          <td>{{ mySaju.day.charAt(1) }}</td>
          <td :class="{ empty: !mySaju.month }">{{ mySaju.month.charAt(1) }}</td>
          <td :class="{ empty: !mySaju.year }">{{ mySaju.year.charAt(1) }}</td>
        </tr>
      </tbody>
    </table>
    <p v-if="noticeMessage" class="notice">{{ noticeMessage }}</p>

    <div v-if="mySaju === null" class="msg">생년월일을 고르면 결과가 나옵니다.</div>

    <div v-else>
      <div v-if="bestMatch" class="best">
        <p class="best-label">사주가 가장 닮은 선수</p>
        <p class="best-name">{{ bestMatch.name }}</p>
        <p class="best-team">
          <span>{{ bestMatch.team }}</span>
          <span>{{ bestMatch.pos }}</span>
        </p>
        <el-rate :model-value="Math.min(bestMatch.score, 8)" :max="8" disabled />
        <p class="best-saju">
          <span>{{ bestMatch.year }}</span>
          <span>{{ bestMatch.month }}</span>
          <span>{{ bestMatch.day }}</span>
        </p>
        <p class="best-reason">
          <span v-for="text in bestMatch.reasons" :key="text">{{ text }}</span>
        </p>
        <button @click="goStadium(bestMatch.cityId)">
          {{ stadiumOf(bestMatch.cityId) }} 날씨 보기
        </button>
      </div>

      <p v-else class="msg">겹치는 기둥이 있는 선수가 없습니다. 흔치 않은 사주네요.</p>

      <div v-if="matchList.length > 1" class="rest">
        <h2>그 밖에 닮은 선수</h2>
        <ul>
          <li v-for="player in matchList.slice(1)" :key="player.name">
            <span class="rank-iljin">{{ player.day }}</span>
            <span class="rank-name">{{ player.name }}</span>
            <span class="rank-team">{{ player.team }}</span>
            <el-rate :model-value="Math.min(player.score, 8)" :max="8" disabled size="small" />
          </li>
        </ul>
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
  margin-bottom: 14px;
  border-bottom: 2px solid #1a1a1a;
}
h1 {
  margin: 0;
  font-family: 'Black Han Sans', sans-serif;
  font-size: 30px;
}
.count {
  margin: 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: #6d6a63;
}
.lead {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #6d6a63;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.my-iljin {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  color: #6d6a63;
}
.my-iljin strong {
  color: #1a1a1a;
}

.birth-box {
  width: 190px;
}
.birth-box :deep(.el-input__inner) {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 19px;
  letter-spacing: 3px;
}
.birth-mask {
  margin: 6px 0 0 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  letter-spacing: 3px;
  color: #b3afa6;
}
.pillars {
  border-collapse: collapse;
  margin-bottom: 8px;
}
.pillars th {
  padding: 5px 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  color: #6d6a63;
}
.pillars td {
  width: 54px;
  height: 54px;
  border: 1px solid #1a1a1a;
  font-size: 26px;
  text-align: center;
  background-color: #fbfaf7;
}
.pillars .ji td {
  border-top: none;
}
.pillars .empty {
  color: #cfccc4;
  background-color: #efece5;
}
.notice {
  margin: 0 0 18px 0;
  font-size: 12.5px;
  color: #b3261e;
}
.best-saju {
  display: flex;
  gap: 12px;
  margin: 0 0 10px 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: #6d6a63;
}
.msg {
  padding: 40px 0;
  text-align: center;
  color: #6d6a63;
}

.best {
  padding: 24px;
  margin-bottom: 26px;
  background-color: #fbfaf7;
  border: 1px solid #1a1a1a;
}
.best-label {
  margin: 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  letter-spacing: 0.08em;
  color: #6d6a63;
}
.best-name {
  margin: 6px 0 2px 0;
  font-family: 'Black Han Sans', sans-serif;
  font-size: 38px;
  line-height: 1.1;
}
.best-team {
  display: flex;
  align-items: baseline;
  gap: 9px;
  margin: 0 0 10px 0;
  font-size: 13.5px;
  color: #6d6a63;
}
.best-reason {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin: 8px 0 16px 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12.5px;
  color: #6d6a63;
}
.best button {
  padding: 8px 16px;
  background-color: transparent;
  border: 1px solid #1a1a1a;
  font-family: 'IBM Plex Sans KR', sans-serif;
  font-size: 13px;
  cursor: pointer;
}
.best button:hover {
  background-color: #1a1a1a;
  color: #fbfaf7;
}

.rest h2 {
  margin: 0 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #1a1a1a;
  font-size: 14px;
}
.rest ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
.rest li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 2px;
  border-bottom: 1px solid #cfccc4;
  font-size: 14px;
}
.rank-iljin {
  width: 44px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: #6d6a63;
}
.rank-name {
  width: 80px;
  font-weight: 600;
}
.rank-team {
  flex: 1;
  font-size: 13px;
  color: #6d6a63;
}

/* Element Plus 기본 스타일을 이 화면 톤(각진 테두리)에 맞춘다 */
:deep(.el-input__wrapper) {
  border-radius: 0;
  box-shadow: 0 0 0 1px #9b978e inset;
}
</style>
