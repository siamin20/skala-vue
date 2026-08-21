<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="not-found">
    <p class="mark">⚾</p>
    <h1>파울볼입니다</h1>
    <p class="lead">주소를 다시 확인해 주세요. 찾으시는 페이지가 없습니다.</p>
    <button @click="goHome">대시보드로 돌아가기</button>
  </div>
</template>

<style scoped>
.not-found {
  padding: 90px 0;
  text-align: center;
}
.mark {
  margin: 0;
  font-size: 76px;
  line-height: 1;
}
h1 {
  margin: 18px 0 8px 0;
  font-family: 'Black Han Sans', sans-serif;
  font-size: 40px;
  color: #2f2b24;
}
.lead {
  margin: 0 0 26px 0;
  color: #8b8271;
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
