<script setup>
// 라우터를 쓰면 App.vue 는 내비게이션과 화면이 갈아 끼워질 자리만 갖는다.
import UnitToggler from './components/exercise/UnitToggler.vue'
</script>

<template>
  <!-- 구장 전광판을 본떴다. 검은 판에 도트 글씨, 구단 색은 왼쪽 띠로만 쓴다. -->
  <div class="board">
    <header class="top">
      <span class="logo">PLAY BALL</span>

      <nav class="menu">
        <RouterLink to="/">구장</RouterLink>
        <RouterLink to="/games">오늘 경기</RouterLink>
        <RouterLink to="/saju">닮은 선수</RouterLink>
        <RouterLink to="/about">정보</RouterLink>
      </nav>

      <!-- 온도 단위 전환 -->
      <UnitToggler />
    </header>

    <!-- 경로에 맞는 컴포넌트가 이 자리에 마운트된다.
         화면을 넘길 때 앞 화면이 먼저 사라지고 다음 화면이 들어오도록 out-in 으로 둔다. -->
    <main class="content">
      <RouterView v-slot="{ Component }">
        <Transition name="screen" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style>
/* 전광판 색. 검은 판 위에 앰버색 도트가 뜨는 모습을 기준으로 잡았다. */
:root {
  --ink: #0b0e13;
  --panel: #141b24;
  --panel-2: #1b232e;
  --line: #2b3542;
  --amber: #ffb020;
  --text: #e2e7ee;
  --muted: #7d8a9a;
  --green: #46d47f;
  --red: #ff6b6b;
}
body {
  display: block;
  margin: 0;
  height: 100vh;
  overflow: hidden;
  background-color: var(--ink);
  font-family:
    'Galmuri11',
    'IBM Plex Sans KR',
    -apple-system,
    sans-serif;
  color: var(--text);
  -webkit-font-smoothing: none;
}
</style>

<style scoped>
.board {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* ── 전광판 머리 ────────────────────────────── */
.top {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
  padding: 0 18px;
  height: 52px;
  border-bottom: 1px solid var(--line);
  background-color: var(--panel);
}
.logo {
  flex-shrink: 0;
  font-family: 'Galmuri11', sans-serif;
  font-size: 15px;
  color: var(--amber);
  letter-spacing: 0.02em;
}
.menu {
  display: flex;
  gap: 4px;
  min-width: 0;
  margin-right: auto;
  overflow-x: auto;
}
.menu::-webkit-scrollbar {
  height: 0;
}
.menu a {
  flex-shrink: 0;
  padding: 5px 10px;
  border-radius: 3px;
  white-space: nowrap;
  font-size: 12px;
  color: var(--muted);
  text-decoration: none;
}
.menu a:hover {
  color: var(--text);
  background-color: var(--panel-2);
}
/* 지금 보고 있는 화면은 전광판 불이 들어온 것처럼 */
.menu a.router-link-exact-active {
  color: var(--ink);
  background-color: var(--amber);
}

/* ── 판 ────────────────────────────────────── */
.content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 22px 34px 22px;
}
.content::-webkit-scrollbar {
  width: 10px;
}
.content::-webkit-scrollbar-track {
  background-color: var(--ink);
}
.content::-webkit-scrollbar-thumb {
  background-color: var(--line);
}
.content::-webkit-scrollbar-thumb:hover {
  background-color: var(--amber);
}

/* 화면 전환 — 구장 안으로 빨려 들어가듯 다가오고, 나갈 때는 뒤로 물러나며 사라진다 */
.screen-enter-active {
  transition:
    opacity 0.34s ease-out,
    transform 0.34s cubic-bezier(0.16, 0.9, 0.3, 1);
}
.screen-leave-active {
  transition:
    opacity 0.2s ease-in,
    transform 0.2s ease-in;
}
.screen-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(22px);
}
.screen-leave-to {
  opacity: 0;
  transform: scale(1.06);
}

@media (max-width: 720px) {
  .top {
    gap: 8px;
    padding: 0 10px;
  }
  .logo {
    font-size: 13px;
  }
  .content {
    padding: 14px 12px 26px 12px;
  }
}
</style>
