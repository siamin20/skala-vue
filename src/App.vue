<script setup>
// 라우터를 쓰면 App.vue 는 내비게이션 바와 화면이 갈아 끼워질 자리만 갖는다.
</script>

<template>
  <div class="app-root">
    <nav class="nav-bar">
      <span class="logo">⚾ 직관 날씨</span>
      <RouterLink to="/">날씨 대시보드</RouterLink>
      <RouterLink to="/about">서비스 소개</RouterLink>
    </nav>

    <!-- 경로에 맞는 컴포넌트가 이 자리에 마운트된다 -->
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style>
/* 스캐폴딩 기본 main.css 가 1024px 이상에서 #app 을 2단 그리드로 만든다. 한 단으로 되돌린다. */
body {
  display: block;
  margin: 0;
  background-color: #f2efe6;
  font-family:
    'IBM Plex Sans KR',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  color: #2f2b24;
}
#app {
  display: block;
  max-width: 100%;
  margin: 0;
  padding: 0;
  font-weight: 400;
}
/* exercise.css 의 input { width: 90% } 가 체크박스·라디오까지 늘려 놓는다. */
input[type='checkbox'],
input[type='radio'] {
  width: auto;
  padding: 0;
  margin-right: 4px;
  vertical-align: middle;
}
</style>

<style scoped>
.app-root {
  min-height: 100vh;
}

/* 내비게이션 바 — 야구장 잔디 줄무늬를 옅게 깐다 */
.nav-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 32px;
  height: 62px;
  background-color: #2f5d3f;
  background-image: repeating-linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.035) 0px,
    rgba(255, 255, 255, 0.035) 26px,
    transparent 26px,
    transparent 52px
  );
  box-shadow: 0 2px 10px rgba(47, 43, 36, 0.18);
}
.logo {
  font-family: 'Black Han Sans', sans-serif;
  font-size: 21px;
  letter-spacing: 0.01em;
  color: #fffdf8;
  margin-right: 28px;
}
.nav-bar a {
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 14.5px;
  font-weight: 500;
  color: #bfd8c8;
  text-decoration: none;
}
.nav-bar a:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fffdf8;
}
/* 현재 열려 있는 메뉴는 뷰 라우터가 이 클래스를 붙여 준다 */
.nav-bar a.router-link-exact-active {
  background-color: #f0c14b;
  color: #2f2b24;
  font-weight: 700;
}

.content {
  max-width: 1080px;
  margin: 0 auto;
  padding: 36px 32px 80px 32px;
}
</style>
