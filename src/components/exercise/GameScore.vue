<script setup>
import { computed } from 'vue'

// 경기 상태에 따라 태그 색을 고른다. Element Plus 가 정해 둔 색 이름을 쓴다.
const tagType = (status) => {
  if (status === 'LIVE') {
    return 'danger'
  }
  if (status === 'CANCELED' || status === 'DELAYED') {
    return 'info'
  }
  if (status === 'FINAL') {
    return 'success'
  }
  return 'primary'
}

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

// 2. 스코어보드 배경을 왼쪽은 원정팀 색, 오른쪽은 홈팀 색으로 이어 칠한다.
//     가운데를 겹쳐 두면 두 색이 자연스럽게 섞인다.
const matchStyle = computed(() => {
  if (props.game === null) {
    return {}
  }
  const away = props.game.away.color
  const home = props.game.home.color
  return {
    backgroundImage: `linear-gradient(100deg, ${away} 0%, ${away} 28%, ${home} 72%, ${home} 100%)`,
  }
})

// 3. 상태에 따라 점수를 보여줄지 정한다 (예정·취소는 점수가 없다)
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
      <el-tag :type="tagType(game.status)" size="small" effect="dark">{{
        game.statusLabel
      }}</el-tag>
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
      <el-tag :type="tagType(game.status)" size="small" effect="dark">{{
        game.statusLabel
      }}</el-tag>
      <span v-if="game.status === 'LIVE'" class="inning">{{ game.inning }}회{{ game.half }}</span>
      <span v-else class="inning">{{ game.startTime }}</span>
    </div>

    <div class="match" :style="matchStyle">
      <div class="side">
        <span class="label">원정</span>
        <span class="team">{{ game.away.name }}</span>
      </div>

      <div class="score">
        <template v-if="hasScore">{{ game.awayScore }} : {{ game.homeScore }}</template>
        <template v-else>vs</template>
      </div>

      <div class="side right">
        <span class="team">{{ game.home.name }}</span>
        <span class="label">홈</span>
      </div>
    </div>

    <p v-if="game.note" class="note">{{ game.note }}</p>
  </div>
</template>

<style scoped>
/* Element Plus 태그 모서리를 이 화면 톤(각진 테두리)에 맞춘다 */
:deep(.el-tag) {
  border-radius: 0;
}

/* 한 줄 버전 — 테두리 없이 카드 안에 얹는다 */
.line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 5px;
  margin: 0;
  min-width: 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  color: #1a1a1a;
}
.line .bar {
  width: 3px;
  height: 12px;
}
.tail {
  margin-left: auto;
  color: #6d6a63;
}
/* 카드 폭이 좁을 때 팀 이름이 줄바꿈되도록 둔다 */
.line > span,
.line {
  overflow-wrap: anywhere;
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
  padding: 14px 14px;
  color: #fff;
}
.side {
  display: flex;
  align-items: baseline;
  gap: 7px;
  flex: 1;
  min-width: 0;
}
.side.right {
  justify-content: flex-end;
}
/* 원정·홈 표시. 팀 이름보다 한 단계 뒤로 물러나게 둔다 */
.label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.72);
}
.team {
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}
/* 두 팀 색이 만나는 자리라 어떤 색 위에서도 읽히도록 어두운 판을 깐다 */
.score {
  flex-shrink: 0;
  padding: 3px 11px;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.34);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 21px;
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
