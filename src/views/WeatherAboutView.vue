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

    <h2>Data / API</h2>
    <dl class="source">
      <dt>날씨 / 대기질</dt>
      <dd>OpenWeatherMap : 기온, 습도, 바람, 미세먼지</dd>

      <dt>비 예보 / 레이더</dt>
      <dd>기상청 초단기예보 (공공데이터포털) : 6시간 강수 예보, 강수예측 영상</dd>

      <dt>경기 / 순위</dt>
      <dd>자체 백엔드 (Spring Boot) : 실시간 점수, 이닝별 전광판, 선발 투수, 구단 순위</dd>

      <dt>사주</dt>
      <dd>자체 백엔드 (Spring Boot) : 만세력 조회</dd>

      <dt>구장 정보</dt>
      <dd>고정 데이터 (src/data/stadiums.js)</dd>
    </dl>

    <p class="credit">자료 제공 기상청 / 이용허락범위 저작자 표시</p>
  </div>
</template>

<style scoped>
h2 {
  margin: 26px 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--line);
  font-family: 'Galmuri11', sans-serif;
  font-size: 14px;
}
.credit {
  margin: 16px 0 0 0;
  font-size: 10.5px;
  color: var(--muted);
}
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
