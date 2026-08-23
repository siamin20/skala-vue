<script setup>
import { stadiumList } from '../data/stadiums.js'
</script>

<template>
  <div>
    <div class="page-head">
      <h1>정보</h1>
    </div>

    <table>
      <thead>
        <tr>
          <th>도시</th>
          <th>구장</th>
          <th>구단</th>
          <th>개장</th>
          <th>좌석</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in stadiumList" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.stadium }}<span v-if="item.isDome" class="dome">돔</span></td>
          <td>{{ item.team }}</td>
          <td class="num">{{ item.opened }}</td>
          <td class="num">{{ item.seats }}</td>
        </tr>
      </tbody>
    </table>

    <dl class="source">
      <dt>구장 정보</dt>
      <dd>고정 데이터 (src/data/stadiums.js)</dd>
      <dt>날씨</dt>
      <dd>목업 데이터. OpenWeatherMap 연동 예정</dd>
      <dt>경기 일정</dt>
      <dd>목업 데이터. 자체 KBO API 연동 예정</dd>
    </dl>
  </div>
</template>

<style scoped>
.page-head {
  padding-bottom: 10px;
  margin-bottom: 18px;
  border-bottom: 2px solid var(--line);
}
h1 {
  margin: 0;
  font-family: 'Galmuri11', sans-serif;
  font-size: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}
th {
  padding: 8px 10px;
  border-bottom: 1px solid var(--line);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  font-weight: 500;
  text-align: left;
  color: var(--muted);
}
td {
  padding: 9px 10px;
  border-bottom: 1px solid var(--line);
}
.num {
  font-family: 'IBM Plex Mono', monospace;
  text-align: right;
}
.dome {
  margin-left: 6px;
  padding: 1px 5px;
  border: 1px solid var(--muted);
  font-size: 10.5px;
  color: var(--muted);
}

.source {
  margin: 26px 0 0 0;
  font-size: 13px;
}
.source dt {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  color: var(--muted);
}
.source dd {
  margin: 2px 0 12px 0;
}
</style>
