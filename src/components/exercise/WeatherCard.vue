<script setup>
import { ref, computed } from 'vue'
import { useConfigStore } from '../../stores/configStore.js'
import { useMyProfileStore } from '../../stores/myProfileStore.js'

const configStore = useConfigStore()
const myProfileStore = useMyProfileStore()

// 1. 부모가 넘겨 준 구장 하나의 정보 (구장 정보 + 오늘 날씨를 합친 객체)
const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
  // 부모가 펼쳐 놓은 카드인지 알려 준다
  isOpened: {
    type: Boolean,
    default: false,
  },
})

// 2. 카드를 고른 것과 상세보기를 누른 것을 각각 부모에게 알린다
const emit = defineEmits(['select-card', 'click-detail'])

// public/logos/{id}.png 가 있으면 로고를, 없으면 이모지를 보여 준다.
const logoFailed = ref(false)

// 3. 설정된 단위에 맞춰 온도를 바꾼다. 원본 데이터는 섭씨 숫자다.
const displayTemp = computed(() => {
  const rawTemp = props.cityItem.temp
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
})

// 4. 스터브를 구단 대표색으로 칠한다.
//    잠실처럼 두 팀이 같이 쓰는 구장은 두 색을 비스듬히 이어 붙인다.
const stubStyle = computed(() => {
  if (props.cityItem.color2) {
    return {
      backgroundImage: `linear-gradient(150deg, ${props.cityItem.color} 52%, ${props.cityItem.color2} 52%)`,
    }
  }
  return { backgroundColor: props.cityItem.color }
})
</script>

<template>
  <div
    class="ticket"
    :class="{
      'no-game': !cityItem.hasGame,
      opened: isOpened,
      'my-team': myProfileStore.teamCityId === cityItem.id,
    }"
    @click="emit('select-card', cityItem.id)"
  >
    <div class="stub" :style="stubStyle">
      <img
        v-if="!logoFailed"
        class="logo"
        :src="`/logos/${cityItem.id}.png`"
        :alt="cityItem.team"
        @error="logoFailed = true"
      />
      <span v-else class="face">{{ cityItem.emoji }}</span>
      <span class="team">{{ cityItem.team }}</span>
    </div>

    <div class="body">
      <p class="place">
        {{ cityItem.name }} · {{ cityItem.stadium }}
        <button
          class="btn-team"
          :class="{ picked: myProfileStore.teamCityId === cityItem.id }"
          :title="
            myProfileStore.teamCityId === cityItem.id ? '내 응원팀 해제' : '내 응원팀으로 지정'
          "
          @click.stop="myProfileStore.setTeam(cityItem.id)"
        >
          {{ myProfileStore.teamCityId === cityItem.id ? '★' : '☆' }}
        </button>
      </p>

      <p class="temp">
        {{ displayTemp }}<span class="unit">{{ configStore.unitSymbol }}</span>
        <span class="sky">{{ cityItem.skyIcon }}</span>
      </p>

      <p class="meta">
        습도 {{ cityItem.humidity }}% · 바람 {{ cityItem.wind }}m/s ·
        {{ cityItem.hasGame ? '18:30 경기' : '경기 없음' }}
      </p>

      <button class="btn-detail" @click.stop="emit('click-detail', cityItem.id)">상세보기</button>

      <!-- 카드를 눌러 펼쳤을 때만 부모가 넣어 준 내용을 보여 준다 -->
      <div v-if="isOpened" class="opened-box">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 가로형 입장권: 왼쪽 스터브(구단) - 절취선 - 오른쪽 본권(날씨) */
.ticket {
  display: flex;
  background-color: #fbfaf7;
  border: 1px solid #1a1a1a;
  cursor: pointer;
}
.ticket.my-team {
  border-width: 2px;
}
.ticket.opened {
  box-shadow: 4px 4px 0 #1a1a1a;
}
.ticket:hover {
  background-color: #fff;
  box-shadow: 4px 4px 0 #1a1a1a;
}
.no-game {
  opacity: 0.45;
}

.stub {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 74px;
  padding: 12px 6px;
  text-align: center;
  color: #fff;
}
/* 스터브와 본권 사이를 미싱 자국처럼 보이게 세로로 구멍을 뚫는다 */
.stub::after {
  content: '';
  position: absolute;
  top: 0;
  right: -4px;
  width: 8px;
  height: 100%;
  background-image: repeating-radial-gradient(
    circle at center,
    #dedbd4 0px,
    #dedbd4 3px,
    transparent 3px,
    transparent 8px
  );
  background-size: 8px 16px;
  background-repeat: repeat-y;
}
.logo {
  display: block;
  width: 38px;
  height: 38px;
  margin: 0 auto;
  object-fit: contain;
}
.face {
  font-size: 30px;
  line-height: 1.1;
}
.team {
  margin-top: 5px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.88);
}

.body {
  position: relative;
  flex: 1;
  padding: 11px 13px 10px 14px;
}
.place {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  font-size: 12px;
  color: #6d6a63;
}
.btn-team {
  padding: 0 3px;
  margin-left: 1px;
  background-color: transparent;
  border: none;
  font-size: 20px;
  line-height: 1;
  color: #cfccc4;
  cursor: pointer;
}
.btn-team:hover,
.btn-team.picked {
  color: #c9a227;
}
/* 온도가 이 카드에서 가장 크다 */
.temp {
  display: flex;
  align-items: baseline;
  margin: 3px 0 6px 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 44px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.02em;
}
.unit {
  /* ℃ 는 IBM Plex Mono 에 없는 글자라 본문 폰트로 지정해 숫자와 어긋나지 않게 한다 */
  font-family: 'IBM Plex Sans KR', sans-serif;
  font-size: 18px;
  color: #6d6a63;
}
.sky {
  margin-left: auto;
  font-size: 24px;
}
.meta {
  margin: 0 0 8px 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: #6d6a63;
}
.btn-detail {
  width: 100%;
  padding: 5px 0;
  background-color: transparent;
  border: 1px solid #1a1a1a;
  font-family: 'IBM Plex Sans KR', sans-serif;
  font-size: 11.5px;
  color: #1a1a1a;
  cursor: pointer;
}
.btn-detail:hover {
  background-color: #1a1a1a;
  color: #fbfaf7;
}

.opened-box {
  padding: 8px 0 10px 0;
  margin-bottom: 8px;
  border-top: 1px dashed #cfccc4;
  border-bottom: 1px dashed #cfccc4;
}
</style>
