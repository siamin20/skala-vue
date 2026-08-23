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
    <p class="rank-title">구단 순위</p>

    <!-- 각 칸이 무엇인지 머리글로 알려 준다 -->
    <p class="rank-cols">
      <span class="c-no">순위</span>
      <span class="c-bar"></span>
      <span class="c-nm">팀</span>
      <span class="c-rec">승-패</span>
      <span class="c-rate">승률</span>
      <span class="c-gb">GB</span>
      <span class="c-five">최근 5</span>
    </p>

    <p v-if="rankList.length === 0" class="rank-empty">순위를 불러오지 못했습니다</p>

    <ul v-else>
      <li v-for="item in rankList" :key="item.teamCode" :class="{ mine: item.teamCode === myTeam }">
        <span class="c-no no">{{ item.rank }}</span>
        <span class="c-bar bar" :style="{ backgroundColor: item.color }"></span>
        <span class="c-nm nm">{{ item.teamName }}</span>
        <span class="c-rec rec">{{ item.win }}-{{ item.lose }}</span>
        <span class="c-rate rate">{{ rateText(item.winRate) }}</span>
        <span class="c-gb gb">{{ behindText(item.behind) }}</span>
        <span class="c-five five">
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
.rank-title {
  margin: 0;
  padding: 10px 12px 9px 12px;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--muted);
}

/* 본문 줄과 칸 너비를 똑같이 맞춰야 머리글이 제자리에 선다 */
.rank-cols,
li {
  display: grid;
  grid-template-columns: 26px 3px minmax(0, 1fr) 40px 34px 32px 38px;
  align-items: center;
  gap: 10px;
  /* 오른쪽 여백을 조금 더 줘서 숫자와 점이 왼쪽으로 붙게 한다 */
  padding: 0 18px 0 12px;
}
.rank-cols {
  margin: 0;
  padding-bottom: 7px;
  border-bottom: 1px solid var(--line);
  font-size: 9.5px;
  color: var(--line);
}
.c-no,
.c-rec,
.c-rate,
.c-gb {
  text-align: right;
}
.c-five {
  text-align: center;
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
  padding-top: 9px;
  padding-bottom: 9px;
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
.rec,
.rate,
.gb {
  font-family: 'Galmuri11', monospace;
  font-size: 10.5px;
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
  color: var(--muted);
}
/* 최근 다섯 경기를 점 다섯 개로 */
.five {
  display: flex;
  justify-content: center;
  gap: 3px;
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
