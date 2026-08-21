import { createRouter, createWebHistory } from 'vue-router'
import WeatherHomeView from '../views/WeatherHomeView.vue'

// 1. 라우트(경로 - 컴포넌트 매핑) 정의
//    홈은 첫 화면이라 정적 import, 나머지는 필요할 때 불러오는 지연 로딩으로 처리한다.
const routes = [
  {
    path: '/',
    name: 'WeatherHome',
    component: WeatherHomeView,
  },
  {
    path: '/weather/:cityId',
    name: 'WeatherDetail',
    component: () => import('../views/WeatherDetailView.vue'),
  },
  // [추가 view] 오늘 열리는 경기를 한 화면에 모아 본다
  {
    path: '/games',
    name: 'TodayGames',
    component: () => import('../views/TodayGamesView.vue'),
  },
  // [추가 view] 생년월일 사주로 나와 닮은 KBO 선수를 찾는다
  {
    path: '/saju',
    name: 'SajuMatch',
    component: () => import('../views/SajuMatchView.vue'),
  },
  {
    path: '/about',
    name: 'WeatherAbout',
    component: () => import('../views/WeatherAboutView.vue'),
  },
  // 2. 위에서 못 찾은 경로는 전부 여기로 (Catch-all). 반드시 맨 끝에 둔다.
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
