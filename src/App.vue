<script setup>
// 라우터를 쓰면 App.vue 는 내비게이션과 화면이 갈아 끼워질 자리만 갖는다.
import UnitToggler from './components/exercise/UnitToggler.vue'
</script>

<template>
  <div class="app-root">
    <nav class="nav-bar">
      <span class="logo">직관 날씨</span>
      <RouterLink to="/">구장</RouterLink>
      <RouterLink to="/games">오늘 경기</RouterLink>
      <RouterLink to="/saju">닮은 선수</RouterLink>
      <RouterLink to="/about">정보</RouterLink>

      <!-- 내비게이션 바 옆에 온도 단위 전환 버튼을 둔다 -->
      <UnitToggler />
    </nav>

    <!-- 경로에 맞는 컴포넌트가 이 자리에 마운트된다 -->
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style>
body {
  display: block;
  margin: 0;
  background-color: #dedbd4;
  font-family:
    'IBM Plex Sans KR',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  color: #1a1a1a;
}
#app {
  display: block;
  max-width: 100%;
  margin: 0;
  padding: 0;
  font-weight: 400;
}
</style>

<style scoped>
.app-root {
  min-height: 100vh;
}
.nav-bar {
  display: flex;
  align-items: baseline;
  gap: 20px;
  padding: 0 28px;
  height: 54px;
  border-bottom: 2px solid #1a1a1a;
  background-color: #dedbd4;
}
.logo {
  font-family: 'Black Han Sans', sans-serif;
  font-size: 19px;
  margin-right: 14px;
}
.nav-bar a {
  font-size: 14px;
  color: #6d6a63;
  text-decoration: none;
  padding-bottom: 2px;
}
.nav-bar a:hover {
  color: #1a1a1a;
}
.nav-bar :deep(.unit-toggler) {
  margin-left: auto;
}
.nav-bar a.router-link-exact-active {
  color: #1a1a1a;
  font-weight: 600;
  border-bottom: 2px solid #1a1a1a;
}
.content {
  max-width: 1020px;
  margin: 0 auto;
  padding: 30px 28px 70px 28px;
}
</style>
