<script setup>
// 라우터를 쓰면 App.vue 는 내비게이션과 화면이 갈아 끼워질 자리만 갖는다.
import UnitToggler from './components/exercise/UnitToggler.vue'
</script>

<template>
  <!-- 앱 전체를 손바닥 게임기 안에 넣는다. 화면 밖은 기계 몸통이다. -->
  <div class="machine">
    <span class="ear left"></span>
    <span class="ear right"></span>

    <div class="shell">
      <div class="bezel">
        <div class="screen">
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
      </div>

      <!-- 진짜 기계처럼 아래에 버튼 세 개 -->
      <div class="pad">
        <span class="btn"></span>
        <span class="btn mid"></span>
        <span class="btn"></span>
      </div>
    </div>
  </div>
</template>

<style>
/* 손바닥 게임기 느낌으로 간다.
   글씨는 도트(비트맵) 글꼴, 화면은 흑백 액정 색, 테두리는 두껍고 각지게. */
body {
  display: block;
  margin: 0;
  padding: 18px 0 26px 0;
  background-color: #cfe6f5;
  font-family:
    'Galmuri11',
    'IBM Plex Sans KR',
    -apple-system,
    sans-serif;
  color: #004c86;
  /* 도트 글꼴이 흐려지지 않게 자간 다듬기를 끈다 */
  -webkit-font-smoothing: none;
  font-smooth: never;
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
/* ── 기계 몸통 ───────────────────────────────
   마메치처럼 둥근 몸에 귀 두 개를 얹고, 가운데를 액정으로 판다.
   페이지 자체는 움직이지 않고 액정 안쪽만 굴러가게 해서 스크롤을 줄인다. */
.machine {
  position: relative;
  width: min(1040px, 96vw);
  margin: 0 auto;
  padding: 92px 0 0 0;
}
/* 귀 — 마메치는 위로 솟은 남색 귀 두 개다 */
.ear {
  position: absolute;
  top: 0;
  width: 78px;
  height: 132px;
  background-color: #004c86;
  border-radius: 50% 50% 44% 44% / 62% 62% 22% 22%;
}
.ear.left {
  left: 29%;
  transform: rotate(-12deg);
}
.ear.right {
  right: 29%;
  transform: rotate(12deg);
}

/* 몸통 */
.shell {
  position: relative;
  z-index: 1;
  padding: 24px 26px 14px 26px;
  border: 9px solid #004c86;
  border-radius: 46% 46% 40% 40% / 30% 30% 26% 26%;
  background-color: #fff89e;
  box-shadow: 8px 9px 0 rgba(0, 76, 134, 0.22);
}
/* 볼 — 얼굴 양쪽 분홍 자국 */
.shell::before,
.shell::after {
  content: '';
  position: absolute;
  bottom: 30px;
  width: 74px;
  height: 40px;
  border-radius: 50%;
  background-color: #f5b4ae;
}
.shell::before {
  left: 96px;
}
.shell::after {
  right: 96px;
}

/* 액정 테두리 */
.bezel {
  padding: 12px;
  border: 6px solid #004c86;
  border-radius: 22px;
  background-color: #004c86;
}
.screen {
  display: flex;
  flex-direction: column;
  height: min(72vh, 720px);
  border-radius: 12px;
  background-color: #fdfbe9;
  overflow: hidden;
}

/* ── 화면 위쪽 메뉴 ─────────────────────────── */
.nav-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 8px 10px;
  border-bottom: 3px solid #004c86;
  background-color: #cfe9ff;
}
.logo {
  margin-right: 6px;
  padding: 4px 8px;
  border: 2px solid #004c86;
  border-radius: 4px;
  background-color: #004c86;
  color: #fff89e;
  font-size: 12px;
}
.nav-bar a {
  padding: 4px 8px;
  border: 2px solid #004c86;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 2px 2px 0 #004c86;
  font-size: 11px;
  color: #004c86;
  text-decoration: none;
}
.nav-bar a:hover {
  background-color: #fff89e;
}
/* 고른 메뉴는 눌린 것처럼 내려앉는다 */
.nav-bar a.router-link-exact-active {
  background-color: #f5b4ae;
  box-shadow: none;
  transform: translate(2px, 2px);
}
.nav-bar :deep(.unit-toggler) {
  margin-left: auto;
}

/* 액정 안쪽만 굴러간다 */
.content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 16px 26px 16px;
}
.content::-webkit-scrollbar {
  width: 10px;
}
.content::-webkit-scrollbar-thumb {
  border: 2px solid #004c86;
  border-radius: 0;
  background-color: #f5b4ae;
}

/* ── 아래 버튼 세 개 ───────────────────────── */
.pad {
  display: flex;
  justify-content: center;
  gap: 34px;
  padding: 14px 0 8px 0;
}
.btn {
  width: 40px;
  height: 40px;
  border: 4px solid #004c86;
  border-radius: 50%;
  background: radial-gradient(circle at 36% 32%, #fff 0 22%, #f5b4ae 24% 100%);
  box-shadow: 0 4px 0 rgba(0, 76, 134, 0.35);
}
.btn.mid {
  background: radial-gradient(circle at 36% 32%, #fff 0 22%, #fff89e 24% 100%);
}

@media (max-width: 720px) {
  .ear {
    width: 62px;
    height: 62px;
  }
  .screen {
    height: 74vh;
  }
}
</style>
