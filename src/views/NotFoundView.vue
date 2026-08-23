<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="not-found">
    <p class="code">404</p>
    <p class="msg">해당 주소에 연결된 화면이 없습니다.</p>
    <button @click="goHome">구장 목록으로</button>
  </div>
</template>

<style scoped>
.not-found {
  padding: 90px 0;
  text-align: center;
}
.code {
  margin: 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 64px;
  font-weight: 600;
  line-height: 1;
}
.msg {
  margin: 12px 0 22px 0;
  font-size: 14px;
  color: var(--muted);
}
button {
  padding: 9px 18px;
  background-color: transparent;
  border: 1px solid var(--line);
  font-family: 'IBM Plex Sans KR', sans-serif;
  font-size: 13px;
  cursor: pointer;
}
button:hover {
  background-color: var(--line);
  color: var(--panel);
}
</style>
