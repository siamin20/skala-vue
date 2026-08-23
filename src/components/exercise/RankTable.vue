<script setup>
// 1. 구단 순위표. 부모가 받아 온 목록을 그대로 그린다.
defineProps({
  rankList: {
    type: Array,
    required: true,
  },
  myTeam: {
    type: String,
    default: '',
  },
})

// 2. 승률은 야구에서 앞의 0 을 떼고 적는다 (0.606 -> .606)
const rateText = (value) => {
  return value.toFixed(3).slice(1)
}

// 3. 게임차. 1위는 차이가 없으므로 줄표 대신 점을 찍는다.
const behindText = (value) => {
  return value === 0 ? '·' : value.toFixed(1)
}

// 4. 최근 다섯 경기 결과 문자열을 한 글자씩 나눠 준다 ('WLLWD' -> ['W','L',...])
const splitFive = (text) => {
  if (!text) {
    return []
  }
  return text.split('')
}
</script>

<template>
  <div class="rank">
    <p class="rank-head">
      <span>구단 순위</span>
      <span class="cap">승률 / GB</span>
    </p>

    <p v-if="rankList.length === 0" class="rank-empty">순위를 불러오지 못했습니다</p>

    <ul v-else>
      <li v-for="item in rankList" :key="item.teamCode" :class="{ mine: item.teamCode === myTeam }">
        <span class="no">{{ item.rank }}</span>
        <span class="bar" :style="{ backgroundColor: item.color }"></span>
        <span class="nm">{{ item.teamName }}</span>
        <span class="rec">{{ item.win }}-{{ item.lose }}</span>
        <span class="rate">{{ rateText(item.winRate) }}</span>
        <span class="gb">{{ behindText(item.behind) }}</span>
        <span class="five">
          <i v-for="(r, i) in splitFive(item.lastFive)" :key="i" :class="r.toLowerCase()"></i>
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.rank {
  border: 1px solid var(--line);
  border-radius: 4px;
  background-color: var(--panel);
  overflow: hidden;
}
.rank-head {
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: 9px 10px;
  border-bottom: 1px solid var(--line);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--muted);
}
.rank-head .cap {
  color: var(--line);
}
.rank-empty {
  margin: 0;
  padding: 14px 12px;
  font-size: 11px;
  color: var(--muted);
}
ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
li {
  display: grid;
  grid-template-columns: 18px 3px minmax(0, 1fr) auto auto auto auto;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  font-size: 11px;
}
li + li {
  border-top: 1px solid var(--line);
}
/* 내 응원팀 줄은 전광판 불이 들어온 것처럼 */
li.mine {
  background-color: rgba(255, 176, 32, 0.09);
}
li.mine .nm {
  color: var(--amber);
}
.no {
  font-family: 'Galmuri11', monospace;
  text-align: right;
  color: var(--muted);
}
.bar {
  align-self: stretch;
  min-height: 14px;
}
.nm {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rec,
.rate,
.gb {
  font-family: 'Galmuri11', monospace;
  font-size: 10px;
  text-align: right;
  white-space: nowrap;
}
.rec {
  color: var(--muted);
}
/* 승률은 순위를 가르는 값이라 한 단계 밝게 */
.rate {
  color: var(--text);
}
.gb {
  min-width: 22px;
  color: var(--muted);
}
/* 최근 다섯 경기를 점 다섯 개로 */
.five {
  display: flex;
  gap: 2px;
}
.five i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: var(--line);
}
.five i.w {
  background-color: var(--green);
}
.five i.l {
  background-color: var(--red);
}
.five i.d {
  background-color: var(--muted);
}
</style>
