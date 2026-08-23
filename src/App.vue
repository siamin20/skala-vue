<script setup>
// 라우터를 쓰면 App.vue 는 내비게이션과 화면이 갈아 끼워질 자리만 갖는다.
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UnitToggler from './components/exercise/UnitToggler.vue'

const route = useRoute()
const router = useRouter()

// 1. 좌우 버튼으로 넘길 화면 순서. 전광판을 넘기듯 한 손으로 돌아다닐 수 있게 한다.
const menu = [
  { path: '/', name: '구장' },
  { path: '/games', name: '오늘 경기' },
  { path: '/saju', name: '닮은 선수' },
  { path: '/about', name: '정보' },
]

// 2. 지금 몇 번째 화면인지. 목록에 없는 주소(상세 화면 등)면 -1 이 된다.
const nowIndex = computed(() => {
  return menu.findIndex((item) => item.path === route.path)
})

// 3. 앞뒤로 돌린다. 끝에서 넘어가면 처음으로 돌아온다.
const move = (step) => {
  const start = nowIndex.value === -1 ? 0 : nowIndex.value
  const next = (start + step + menu.length) % menu.length
  router.push(menu[next].path)
}

// 4. 가운데 버튼은 첫 화면으로 돌아온다.
const goHome = () => {
  router.push('/')
}
</script>

<template>
  <!-- 구장 전광판을 본떴다. 검은 판에 도트 글씨, 구단 색은 왼쪽 띠로만 쓴다. -->
  <div class="board">
    <header class="top">
      <span class="logo">직관 날씨</span>

      <nav class="menu">
        <RouterLink to="/">구장</RouterLink>
        <RouterLink to="/games">오늘 경기</RouterLink>
        <RouterLink to="/saju">닮은 선수</RouterLink>
        <RouterLink to="/about">정보</RouterLink>
      </nav>

      <div class="ctrl">
        <button title="이전 화면" @click="move(-1)">◀</button>
        <button title="첫 화면" @click="goHome">●</button>
        <button title="다음 화면" @click="move(1)">▶</button>
      </div>

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

.ctrl {
  display: flex;
  gap: 5px;
  margin-left: auto;
}
.ctrl button {
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 3px;
  background-color: var(--panel-2);
  font-size: 9px;
  color: var(--muted);
  cursor: pointer;
}
.ctrl button:hover {
  border-color: var(--amber);
  color: var(--amber);
}
.ctrl button:active {
  background-color: var(--amber);
  color: var(--ink);
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

/* 화면 전환 — 들어올 때는 살짝 다가오며 밝아지고, 나갈 때는 옅어진다 */
.screen-enter-active {
  transition:
    opacity 0.26s ease-out,
    transform 0.26s ease-out;
}
.screen-leave-active {
  transition:
    opacity 0.16s ease-in,
    transform 0.16s ease-in;
}
.screen-enter-from {
  opacity: 0;
  transform: scale(0.985) translateY(6px);
}
.screen-leave-to {
  opacity: 0;
  transform: scale(1.005);
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
