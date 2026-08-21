<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div>
    <h1>서비스 소개</h1>
    <p class="lead">직관 날씨는 야구 보러 가기 전에 딱 한 번 열어 보는 날씨 앱입니다.</p>

    <div class="about-box">
      <h3>이런 걸 볼 수 있습니다</h3>
      <ul>
        <li>KBO 9개 구장의 오늘 날씨를 입장권 모양으로 확인</li>
        <li>도시 이름으로 검색해서 원하는 구장만 골라 보기</li>
        <li>구장을 누르면 날씨에 맞춰 직관 준비물을 알려 줌</li>
        <li>돔구장은 비가 와도 경기가 열린다는 것까지 표시</li>
      </ul>
    </div>

    <div class="about-box">
      <h3>왜 만들었나</h3>
      <p>
        야구장은 우산 반입이 안 됩니다. 비 소식을 모르고 갔다가 우비도 없이 앉아 있는 일이 많아서,
        가기 전에 챙길 것을 알려 주는 화면을 만들었습니다.
      </p>
    </div>

    <button @click="goHome">대시보드로 돌아가기</button>
  </div>
</template>

<style scoped>
h1 {
  margin: 0 0 8px 0;
  font-family: 'Black Han Sans', sans-serif;
  font-size: 38px;
  line-height: 1.2;
  color: #2f2b24;
}
.lead {
  margin: 0 0 26px 0;
  font-size: 15px;
  color: #8b8271;
}
.about-box {
  padding: 20px 24px;
  margin-bottom: 16px;
  background-color: #fffdf8;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(47, 43, 36, 0.08);
}
.about-box h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  letter-spacing: 0.02em;
  color: #3d7a4f;
}
.temp {
  margin: 0 0 8px 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 52px;
  font-weight: 600;
  line-height: 1;
  color: #c96f3f;
}
.about-box p {
  margin: 0 0 6px 0;
  color: #6b6355;
}
ul {
  margin: 0;
  padding-left: 4px;
  list-style: none;
}
li {
  padding: 10px 0;
  border-bottom: 1px dashed #e6e0d1;
  color: #2f2b24;
}
li:last-child {
  border-bottom: none;
}
button {
  padding: 11px 22px;
  background-color: #2f5d3f;
  border: none;
  border-radius: 24px;
  font-family: 'IBM Plex Sans KR', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #fffdf8;
  cursor: pointer;
}
button:hover {
  background-color: #24492f;
}
</style>
