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
  <!-- 전광판 한 줄. 왼쪽 구단색 띠 - 로고 - 구장 - 기온 - 상세 -->
  <div
    class="row"
    :class="{
      'no-game': !cityItem.hasGame,
      opened: isOpened,
      'my-team': myProfileStore.teamCityId === cityItem.id,
    }"
    @click="emit('select-card', cityItem.id)"
  >
    <span class="bar" :style="stubStyle"></span>

    <img
      v-if="!logoFailed"
      class="logo"
      :src="`/logos/${cityItem.id}.png`"
      :alt="cityItem.team"
      @error="logoFailed = true"
    />
    <span v-else class="face">{{ cityItem.emoji }}</span>

    <span class="place">
      <span class="stadium">{{ cityItem.stadium }}</span>
      <span class="team">{{ cityItem.name }} {{ cityItem.team }}</span>
    </span>

    <span class="temp">
      {{ displayTemp }}<span class="unit">{{ configStore.unitSymbol }}</span>
    </span>
    <span class="sky">{{ cityItem.skyIcon }}</span>

    <span class="meta">
      <span>습 {{ cityItem.humidity }}</span>
      <span>풍 {{ cityItem.wind }}</span>
    </span>

    <span class="when" :class="{ off: !cityItem.hasGame }">
      {{ cityItem.hasGame ? '18:30' : '경기 없음' }}
    </span>

    <button
      class="btn-team"
      :class="{ picked: myProfileStore.teamCityId === cityItem.id }"
      :title="myProfileStore.teamCityId === cityItem.id ? '내 응원팀 해제' : '내 응원팀으로 지정'"
      @click.stop="myProfileStore.setTeam(cityItem.id)"
    >
      {{ myProfileStore.teamCityId === cityItem.id ? '★' : '☆' }}
    </button>

    <button class="btn-detail" @click.stop="emit('click-detail', cityItem.id)">상세</button>

    <!-- 줄을 눌러 펼쳤을 때만 부모가 넣어 준 내용을 보여 준다 -->
    <div v-if="isOpened" class="opened-box">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* 전광판 한 줄. 펼치면 아래로 내용이 붙으므로 그리드 두 줄로 잡는다. */
.row {
  display: grid;
  grid-template-columns: 4px 30px minmax(0, 1fr) auto auto auto auto auto auto;
  align-items: center;
  gap: 0 12px;
  padding: 0 12px 0 0;
  min-height: 46px;
  border-bottom: 1px solid var(--line);
  cursor: pointer;
}
.row:hover {
  background-color: var(--panel-2);
}
.row.opened {
  background-color: var(--panel-2);
}
.row.my-team .stadium {
  color: var(--amber);
}
/* 경기 없는 구장은 한 단계 뒤로 */
.row.no-game .stadium,
.row.no-game .temp,
.row.no-game .logo {
  opacity: 0.5;
}

.bar {
  align-self: stretch;
  width: 4px;
}
.logo {
  width: 26px;
  height: 26px;
  object-fit: contain;
}
.face {
  font-size: 19px;
  text-align: center;
}

.place {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 1px;
  padding: 7px 0;
}
.stadium {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.team {
  font-size: 10px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.temp {
  font-family: 'Galmuri11', sans-serif;
  font-size: 21px;
  color: var(--amber);
  white-space: nowrap;
}
.unit {
  margin-left: 1px;
  font-size: 11px;
  color: var(--muted);
}
.sky {
  font-size: 15px;
}
.meta {
  display: flex;
  gap: 9px;
  font-size: 10px;
  color: var(--muted);
  white-space: nowrap;
}
.when {
  min-width: 52px;
  text-align: right;
  font-size: 11px;
  color: var(--green);
  white-space: nowrap;
}
.when.off {
  color: var(--muted);
}

.btn-team {
  padding: 0;
  border: none;
  background: none;
  font-size: 15px;
  color: var(--line);
  cursor: pointer;
}
.btn-team:hover,
.btn-team.picked {
  color: var(--amber);
}
.btn-detail {
  padding: 4px 9px;
  border: 1px solid var(--line);
  border-radius: 3px;
  background-color: transparent;
  font-size: 10px;
  color: var(--muted);
  cursor: pointer;
}
.btn-detail:hover {
  border-color: var(--amber);
  color: var(--amber);
}

/* 펼친 내용은 줄 전체 폭을 쓴다 */
.opened-box {
  grid-column: 1 / -1;
  padding: 2px 0 10px 20px;
}

@media (max-width: 720px) {
  .row {
    grid-template-columns: 4px 26px minmax(0, 1fr) auto auto;
    gap: 0 9px;
  }
  .meta,
  .sky {
    display: none;
  }
}
</style>
