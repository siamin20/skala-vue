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

// 3. 목록 카드는 폭이 좁아 'KIA 타이거즈' 가 잘린다.
//     앞 낱말만 쓰면 'KIA', '롯데' 처럼 짧아져 그대로 들어간다.
const shortName = (fullName) => fullName.split(' ')[0]

// 4. 상태에 따라 점수를 보여줄지 정한다 (예정·취소는 점수가 없다)
const hasScore = computed(() => {
  if (props.game === null) {
    return false
  }
  return props.game.status === 'LIVE' || props.game.status === 'FINAL'
})
</script>

<template>
  <!-- 목록 카드 안: 좁아서 두 줄로 나눈다 -->
  <div v-if="compact" class="line">
    <span v-if="game === null" class="none">오늘 경기 없음</span>
    <template v-else>
      <span class="line-head">
        <el-tag :type="tagType(game.status)" size="small" effect="dark">{{
          game.statusLabel
        }}</el-tag>
        <span class="when">{{
          game.note
            ? game.note
            : game.status === 'LIVE'
              ? `${game.inning}회${game.half}`
              : game.startTime
        }}</span>
      </span>

      <span class="line-teams">
        <span class="bar" :style="{ backgroundColor: game.away.color }"></span>
        <span class="nm">{{ shortName(game.away.name) }}</span>
        <span class="mid">
          <template v-if="hasScore">{{ game.awayScore }} : {{ game.homeScore }}</template>
          <template v-else>vs</template>
        </span>
        <span class="nm right">{{ shortName(game.home.name) }}</span>
        <span class="bar" :style="{ backgroundColor: game.home.color }"></span>
      </span>
    </template>
  </div>

  <!-- 상세 화면: 스코어보드 -->
  <div v-else-if="game === null" class="board empty">
    <p>오늘 이 구장에는 경기가 없습니다.</p>
  </div>

  <div v-else class="board">
    <div class="board-head">
      <el-tag :type="tagType(game.status)" size="small" effect="dark">{{
        game.statusLabel
      }}</el-tag>
      <span v-if="game.status === 'LIVE' && game.inning" class="inning"
        >{{ game.inning }}회{{ game.half }}</span
      >
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

    <!-- 이닝별 전광판. 백엔드가 못 받아오면 없으므로 있을 때만 그린다. -->
    <div v-if="game.board" class="linescore">
      <table>
        <thead>
          <tr>
            <th class="nm"></th>
            <th v-for="(n, i) in game.board.awayByInning.length" :key="i">{{ i + 1 }}</th>
            <th class="sum">R</th>
            <th class="sum">H</th>
            <th class="sum">E</th>
            <th class="sum">B</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="nm">{{ shortName(game.away.name) }}</td>
            <td
              v-for="(v, i) in game.board.awayByInning"
              :key="i"
              :class="{ run: v !== '0' && v !== '-' }"
            >
              {{ v }}
            </td>
            <td v-for="(v, i) in game.board.awayRheb" :key="`ar${i}`" class="sum">{{ v }}</td>
          </tr>
          <tr>
            <td class="nm">{{ shortName(game.home.name) }}</td>
            <td
              v-for="(v, i) in game.board.homeByInning"
              :key="i"
              :class="{ run: v !== '0' && v !== '-' }"
            >
              {{ v }}
            </td>
            <td v-for="(v, i) in game.board.homeRheb" :key="`hr${i}`" class="sum">{{ v }}</td>
          </tr>
        </tbody>
      </table>

      <p class="starters">
        <span v-if="game.board.awayStarter">
          선발 {{ game.board.awayStarter }} vs {{ game.board.homeStarter }}
        </span>
        <span v-if="game.board.channel" class="ch">중계 {{ game.board.channel }}</span>
      </p>
    </div>

    <p v-if="game.note" class="note">{{ game.note }}</p>
  </div>
</template>

<style scoped>
/* Element Plus 태그 모서리를 이 화면 톤(각진 테두리)에 맞춘다 */
:deep(.el-tag) {
  border-radius: 0;
}

/* 목록 카드 안 — 폭이 좁아 한 줄에 다 못 들어가므로 위아래로 나눈다 */
.line {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
  margin: 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  color: var(--line);
}
.none {
  color: var(--muted);
}
.line-head {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.when {
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.line-teams {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
/* 남는 자리는 오른쪽 끝에 몰아 준다 */
.line-teams .bar:last-child {
  margin-right: auto;
}
.line .bar {
  flex-shrink: 0;
  width: 3px;
  height: 12px;
}
/* 짧은 이름이라 늘리지 않고 제 폭만 차지하게 둔다 */
.nm {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: 600;
}
.mid {
  flex-shrink: 0;
  font-weight: 600;
}

.board {
  padding: 11px 13px;
  border: 1px solid var(--line);
  background-color: var(--panel);
}
.board.empty {
  padding: 18px 16px;
  border-style: dashed;
  border-color: var(--muted);
  color: var(--muted);
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
  color: var(--muted);
}

.match {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 12px;
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
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.72);
}
.team {
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
  /* 좁아도 말줄임표로 지우지 말고 낱말 단위로 접는다 */
  word-break: keep-all;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}
/* 두 팀 색이 만나는 자리라 어떤 색 위에서도 읽히도록 어두운 판을 깐다 */
.score {
  flex-shrink: 0;
  font-family: 'Galmuri11', monospace;
  padding: 3px 11px;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.34);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

/* 이닝별 전광판 — 진짜 구장 전광판처럼 칸을 나눈다 */
.linescore {
  margin-top: 12px;
  overflow-x: auto;
}
.linescore table {
  border-collapse: collapse;
  width: 100%;
  font-family: 'Galmuri11', monospace;
  font-size: 11px;
}
.linescore th,
.linescore td {
  min-width: 22px;
  padding: 4px 2px;
  border: 1px solid var(--line);
  text-align: center;
  color: var(--text);
}
.linescore th {
  font-weight: 400;
  color: var(--muted);
  background-color: var(--ink);
}
.linescore .nm {
  min-width: 46px;
  text-align: left;
  padding-left: 7px;
  white-space: nowrap;
}
/* 점수가 난 이닝은 불이 들어온 것처럼 */
.linescore .run {
  color: var(--amber);
  background-color: rgba(255, 176, 32, 0.08);
}
.linescore .sum {
  background-color: var(--ink);
}
.starters {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin: 8px 0 0 0;
  font-size: 11px;
  color: var(--muted);
}
.starters .ch {
  margin-left: auto;
}

.note {
  margin: 12px 0 0 0;
  padding-top: 10px;
  border-top: 1px dashed var(--line);
  font-size: 13px;
  color: var(--red);
}
</style>
