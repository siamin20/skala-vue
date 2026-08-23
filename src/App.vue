<script setup>
// 라우터를 쓰면 App.vue 는 내비게이션과 화면이 갈아 끼워질 자리만 갖는다.
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UnitToggler from './components/exercise/UnitToggler.vue'

const route = useRoute()
const router = useRouter()

// 1. 아래 버튼 세 개로 넘길 화면 순서. 진짜 다마고치처럼 버튼만으로 돌아다닐 수 있게 한다.
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

      <!-- 진짜 기계처럼 아래 버튼 세 개로도 화면을 넘길 수 있다 -->
      <div class="pad">
        <button class="btn" title="이전 화면" @click="move(-1)">◀</button>
        <button class="btn mid" title="첫 화면" @click="goHome">●</button>
        <button class="btn" title="다음 화면" @click="move(1)">▶</button>
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
  padding: 0;
  height: 100vh;
  overflow: hidden;
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
/* ── 다마고치 본체 ──────────────────────────────
   진짜 다마고치는 달걀 모양 몸통 한가운데에 작은 정사각 액정이 박혀 있다.
   몸통이 액정 둘레로 넉넉히 보여야 기계처럼 읽힌다. */
.machine {
  position: relative;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  align-items: center;
  height: 100vh;
  padding: 34px 0 10px 0;
}
/* 귀 — 마메치의 남색 귀 */
.ear {
  position: absolute;
  top: 2px;
  z-index: 0;
  width: 78px;
  height: 108px;
  background-color: #004c86;
  border-radius: 50% 50% 44% 44% / 62% 62% 22% 22%;
}
.ear.left {
  left: calc(50% - 168px);
  transform: rotate(-14deg);
}
.ear.right {
  left: calc(50% + 90px);
  transform: rotate(14deg);
}

/* 달걀 모양 몸통 */
.shell {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  width: calc(84vh + 116px);
  max-width: 96vw;
  padding: 44px 52px 24px 52px;
  border: 10px solid #004c86;
  /* 원본 다마고치는 완전한 타원이 아니라 모서리가 살짝 각진 원이다 */
  border-radius: 30% / 24%;
  background-color: #fff89e;
  box-shadow: 9px 10px 0 rgba(0, 76, 134, 0.2);
}

/* 액정 — 정사각형 */
.bezel {
  display: flex;
  flex-shrink: 0;
  width: 84vh;
  height: 63vh;
  max-width: 100%;
  margin-top: 0;
  padding: 9px;
  border: 6px solid #004c86;
  border-radius: 26px;
  background-color: #004c86;
}
.screen {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
  border-radius: 16px;
  background-color: #fdfbe9;
  overflow: hidden;
}

/* ── 액정 속 메뉴 ───────────────────────────── */
.nav-bar {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  overflow-x: auto;
  padding: 6px 8px;
  border-bottom: 3px solid #004c86;
  background-color: #cfe9ff;
}
.nav-bar::-webkit-scrollbar {
  height: 0;
}
.logo {
  flex-shrink: 0;
  margin-right: 4px;
  padding: 3px 6px;
  white-space: nowrap;
  border-radius: 4px;
  background-color: #004c86;
  color: #fff89e;
  font-size: 11px;
}
.nav-bar a {
  padding: 3px 6px;
  border: 2px solid #004c86;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 2px 2px 0 #004c86;
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 10px;
  color: #004c86;
  text-decoration: none;
}
.nav-bar a:hover {
  background-color: #fff89e;
}
.nav-bar a.router-link-exact-active {
  background-color: #f5b4ae;
  box-shadow: none;
  transform: translate(2px, 2px);
}
.nav-bar :deep(.unit-toggler) {
  margin-left: auto;
}

/* 내용은 액정 안에서만 굴러간다 */
.content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px 12px 20px 12px;
}
.content::-webkit-scrollbar {
  width: 9px;
}
.content::-webkit-scrollbar-thumb {
  border: 2px solid #004c86;
  background-color: #f5b4ae;
}

/* ── 볼과 버튼 ─────────────────────────────── */
.shell::before,
.shell::after {
  content: '';
  position: absolute;
  top: 52%;
  width: 30px;
  height: 18px;
  border-radius: 50%;
  background-color: #f5b4ae;
}
.shell::before {
  left: 26px;
}
.shell::after {
  right: 26px;
}
.pad {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 26px;
  flex-shrink: 0;
  margin-top: 20px;
}
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 4px solid #004c86;
  border-radius: 50%;
  background-color: #f5b4ae;
  box-shadow: 0 4px 0 rgba(0, 76, 134, 0.32);
  font-family: 'Galmuri11', sans-serif;
  font-size: 9px;
  color: #004c86;
  cursor: pointer;
}
.btn:hover {
  background-color: #ffc9c4;
}
/* 진짜 버튼처럼 눌리면 내려앉는다 */
.btn:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 rgba(0, 76, 134, 0.32);
}
.btn.mid {
  background-color: #cfe9ff;
}
.btn.mid:hover {
  background-color: #e4f2ff;
}

/* 폰처럼 좁고 긴 화면에서는 정사각 액정을 고집하지 않는다.
   억지로 맞추면 글씨가 세로로 쪼개진다. 세로로 길게 늘려 쓴다. */
@media (max-width: 720px) {
  .machine {
    padding: 26px 0 8px 0;
  }
  .ear {
    width: 46px;
    height: 68px;
  }
  .ear.left {
    left: calc(50% - 108px);
  }
  .ear.right {
    left: calc(50% + 62px);
  }
  .shell {
    width: 94vw;
    height: 100%;
    padding: 26px 18px 14px 18px;
    border-width: 7px;
    border-radius: 22% / 9%;
  }
  .bezel {
    flex: 1;
    width: 100%;
    height: auto;
    min-height: 0;
    border-radius: 18px;
  }
  .shell::before,
  .shell::after {
    top: 50%;
    width: 18px;
    height: 30px;
  }
  .shell::before {
    left: 6px;
  }
  .shell::after {
    right: 6px;
  }
  .pad {
    margin-top: 12px;
    gap: 20px;
  }
}
</style>
