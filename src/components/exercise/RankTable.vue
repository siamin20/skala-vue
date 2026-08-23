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

// 2. 최근 다섯 경기 결과 문자열을 한 글자씩 나눠 준다 ('WLLWD' -> ['W','L',...])
const splitFive = (text) => {
  if (!text) {
    return []
  }
  return text.split('')
}
</script>

<template>
  <div class="rank">
    <p class="rank-head">구단 순위</p>

    <p v-if="rankList.length === 0" class="rank-empty">순위를 불러오지 못했습니다</p>

    <ul v-else>
      <li v-for="item in rankList" :key="item.teamCode" :class="{ mine: item.teamCode === myTeam }">
        <span class="no">{{ item.rank }}</span>
        <span class="bar" :style="{ backgroundColor: item.color }"></span>
        <span class="nm">{{ item.teamName }}</span>
        <span class="rec">{{ item.win }}-{{ item.lose }}</span>
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
  margin: 0;
  padding: 9px 12px;
  border-bottom: 1px solid var(--line);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--muted);
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
  grid-template-columns: 20px 3px 1fr auto auto;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  font-size: 11.5px;
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
.rec {
  font-family: 'Galmuri11', monospace;
  font-size: 10.5px;
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
