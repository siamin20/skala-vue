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

// 4. 왼쪽 띠를 구단 대표색으로 칠한다.
//    잠실처럼 두 팀이 같이 쓰는 구장은 두 색을 위아래로 이어 붙인다.
const stubStyle = computed(() => {
  if (props.cityItem.color2) {
    return {
      backgroundImage: `linear-gradient(180deg, ${props.cityItem.color} 50%, ${props.cityItem.color2} 50%)`,
    }
  }
  return { backgroundColor: props.cityItem.color }
})
</script>

<template>
  <!-- 어두운 판 위의 입장권. 왼쪽 스터브(구단) · 절취선 · 오른쪽 본권(날씨) -->
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
    </div>

    <div class="body">
      <p class="place">
        <span class="stadium">{{ cityItem.stadium }}</span>
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
      <p class="team">{{ cityItem.name }} · {{ cityItem.team }}</p>

      <p class="temp">
        {{ displayTemp }}<span class="unit">{{ configStore.unitSymbol }}</span>
        <span class="sky">{{ cityItem.skyIcon }}</span>
      </p>

      <p class="meta">
        <span>습 {{ cityItem.humidity }}</span>
        <span>풍 {{ cityItem.wind }}</span>
        <span class="when" :class="{ off: !cityItem.hasGame }">
          {{ cityItem.hasGame ? '18:30 경기' : '경기 없음' }}
        </span>
      </p>

      <!-- 비 예보가 있을 때만 나온다. 이 앱이 답하려는 질문이라 티켓 앞면에 둔다. -->
      <p v-if="cityItem.rain" class="rain" :class="cityItem.rain.level">
        ☔ {{ cityItem.rain.text }}
      </p>

      <button class="btn-detail" @click.stop="emit('click-detail', cityItem.id)">상세보기</button>

      <!-- 티켓을 눌러 펼쳤을 때만 부모가 넣어 준 내용을 보여 준다 -->
      <div v-if="isOpened" class="opened-box">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 가로형 입장권. 절취선 위아래를 반원으로 파내 진짜 표처럼 보이게 한다. */
.ticket {
  position: relative;
  display: flex;
  min-width: 0;
  border-radius: 8px;
  background-color: var(--panel);
  cursor: pointer;
  transition:
    background-color 0.15s,
    transform 0.15s;
}
.ticket:hover {
  background-color: var(--panel-2);
  transform: translateY(-2px);
}
.ticket.opened {
  background-color: var(--panel-2);
  box-shadow: inset 0 0 0 1px var(--amber);
}
/* 절취선 구멍 — 바탕색으로 찍어 파낸 것처럼 */
.ticket::before,
.ticket::after {
  content: '';
  position: absolute;
  left: 66px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: var(--ink);
  transform: translateX(-50%);
  z-index: 2;
}
.ticket::before {
  top: -7px;
}
.ticket::after {
  bottom: -7px;
}
.ticket.my-team .stadium {
  color: var(--amber);
}
.ticket.no-game .body {
  opacity: 0.6;
}
.ticket.no-game .stub {
  opacity: 0.8;
}

/* 스터브 */
.stub {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  width: 66px;
  border-radius: 8px 0 0 8px;
}
.logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
.face {
  font-size: 26px;
}
/* 절취선 */
.stub::after {
  content: '';
  position: absolute;
  top: 8px;
  bottom: 8px;
  right: 0;
  width: 1px;
  background-image: repeating-linear-gradient(180deg, var(--ink) 0 5px, transparent 5px 10px);
}

/* 본권 */
.body {
  flex: 1;
  min-width: 0;
  padding: 11px 13px 11px 15px;
}
.place {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}
.stadium {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.team {
  margin: 2px 0 0 0;
  font-size: 10.5px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.temp {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 7px 0 5px 0;
  font-family: 'Galmuri11', sans-serif;
  font-size: 30px;
  line-height: 1;
  color: var(--amber);
  text-shadow: 0 0 16px rgba(255, 176, 32, 0.4);
}
.unit {
  margin-left: 1px;
  font-family: 'IBM Plex Sans KR', sans-serif;
  font-size: 12px;
  color: var(--muted);
}
.sky {
  font-size: 17px;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 3px 10px;
  margin: 0 0 9px 0;
  font-size: 10.5px;
  color: var(--muted);
}
.when {
  color: var(--green);
}
.when.off {
  color: var(--muted);
}

/* 비 예보 — 셀 만하면 노랑, 많이 오면 빨강 */
.rain {
  margin: 0 0 8px 0;
  padding: 4px 7px;
  border-radius: 3px;
  background-color: rgba(255, 176, 32, 0.1);
  font-size: 11px;
  color: var(--amber);
}
.rain.high {
  background-color: rgba(255, 107, 107, 0.12);
  color: var(--red);
}

.btn-team {
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: none;
  font-size: 15px;
  color: var(--muted);
  cursor: pointer;
}
.btn-team:hover {
  border-color: transparent;
}
.btn-team:hover,
.btn-team.picked {
  color: var(--amber);
}
.btn-detail {
  width: 100%;
  padding: 5px 0;
  border: 1px solid var(--line);
  border-radius: 3px;
  background-color: transparent;
  font-family: 'IBM Plex Sans KR', sans-serif;
  font-size: 11px;
  color: var(--muted);
  cursor: pointer;
}
.btn-detail:hover {
  border-color: var(--amber);
  color: var(--amber);
}

.opened-box {
  margin-top: 9px;
  padding-top: 9px;
  border-top: 1px dashed var(--line);
}
</style>
