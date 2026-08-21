<script setup>
import { computed } from 'vue'

// 1. 오늘 이 구장의 경기 한 건. 경기가 없으면 null 이 들어온다.
const props = defineProps({
  game: {
    type: Object,
    default: null,
  },
  // 목록 카드 안에서는 한 줄로 좁게 보여 준다
  compact: {
    type: Boolean,
    default: false,
  },
})

// 2. 상태에 따라 점수를 보여줄지 정한다 (예정·취소는 점수가 없다)
const hasScore = computed(() => {
  if (props.game === null) {
    return false
  }
  return props.game.status === 'LIVE' || props.game.status === 'FINAL'
})
</script>

<template>
  <!-- 목록 카드 안: 한 줄 -->
  <p v-if="compact" class="line">
    <template v-if="game === null">오늘 경기 없음</template>
    <template v-else>
      <span class="label" :class="game.status.toLowerCase()">{{ game.statusLabel }}</span>
      <span class="bar" :style="{ backgroundColor: game.away.color }"></span>
      {{ game.away.name }}
      <template v-if="hasScore"> {{ game.awayScore }} : {{ game.homeScore }} </template>
      <template v-else> vs </template>
      {{ game.home.name }}
      <span class="bar" :style="{ backgroundColor: game.home.color }"></span>
      <span class="tail">{{
        game.note
          ? game.note
          : game.status === 'LIVE'
            ? `${game.inning}회${game.half}`
            : game.startTime
      }}</span>
    </template>
  </p>

  <!-- 상세 화면: 스코어보드 -->
  <div v-else-if="game === null" class="board empty">
    <p>오늘 이 구장에는 경기가 없습니다.</p>
  </div>

  <div v-else class="board">
    <div class="board-head">
      <span class="label" :class="game.status.toLowerCase()">{{ game.statusLabel }}</span>
      <span v-if="game.status === 'LIVE'" class="inning">{{ game.inning }}회{{ game.half }}</span>
      <span v-else class="inning">{{ game.startTime }}</span>
    </div>

    <div class="match">
      <div class="side">
        <span class="bar" :style="{ backgroundColor: game.away.color }"></span>
        <span class="team">{{ game.away.name }}</span>
      </div>

      <div class="score">
        <template v-if="hasScore">{{ game.awayScore }} : {{ game.homeScore }}</template>
        <template v-else>vs</template>
      </div>

      <div class="side right">
        <span class="team">{{ game.home.name }}</span>
        <span class="bar" :style="{ backgroundColor: game.home.color }"></span>
      </div>
    </div>

    <p v-if="game.note" class="note">{{ game.note }}</p>
  </div>
</template>

<style scoped>
/* 한 줄 버전 — 테두리 없이 카드 안에 얹는다 */
.line {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  color: #1a1a1a;
  white-space: nowrap;
}
.line .bar {
  width: 3px;
  height: 12px;
}
.tail {
  margin-left: auto;
  color: #6d6a63;
}

.board {
  padding: 11px 13px;
  border: 1px solid #1a1a1a;
  background-color: #fbfaf7;
}
.board.empty {
  padding: 18px 16px;
  border-style: dashed;
  border-color: #9b978e;
  color: #6d6a63;
  font-size: 14px;
}
.board.empty p {
  margin: 0;
}

.board-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.label {
  padding: 2px 7px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: #fbfaf7;
  background-color: #6d6a63;
}
.label.live {
  background-color: #b3261e;
}
.label.canceled,
.label.delayed {
  background-color: #1a1a1a;
}
.inning {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: #6d6a63;
}

.match {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.side {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}
.side.right {
  justify-content: flex-end;
}
.bar {
  width: 5px;
  height: 22px;
}
.team {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}
.score {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 21px;
  white-space: nowrap;
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.note {
  margin: 12px 0 0 0;
  padding-top: 10px;
  border-top: 1px dashed #cfccc4;
  font-size: 13px;
  color: #b3261e;
}
</style>
