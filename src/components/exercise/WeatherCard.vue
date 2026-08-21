<script setup>
import { computed } from 'vue'

// 1. 부모가 넘겨 준 구장 하나의 정보 (구장 정보 + 오늘 날씨를 합친 객체)
const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
})

// 2. 카드를 고른 것과 상세보기를 누른 것을 각각 부모에게 알린다
const emit = defineEmits(['select-card', 'click-detail'])

// 3. 스터브를 구단 대표색으로 칠한다.
//    잠실처럼 두 팀이 같이 쓰는 구장은 두 색을 비스듬히 이어 붙인다.
const stubStyle = computed(() => {
  if (props.cityItem.color2) {
    return {
      backgroundImage: `linear-gradient(150deg, ${props.cityItem.color} 52%, ${props.cityItem.color2} 52%)`,
    }
  }
  return { backgroundColor: props.cityItem.color }
})
</script>

<template>
  <!-- 입장권 모양 카드. 왼쪽 반쪽(스터브)에 마스코트, 오른쪽에 날씨를 적는다 -->
  <div
    class="ticket"
    :class="{ 'no-game': !cityItem.hasGame }"
    @click="emit('select-card', `${cityItem.stadium} 입장권을 뽑았습니다.`)"
  >
    <div class="stub" :style="stubStyle">
      <span class="face">{{ cityItem.face }}</span>
      <span class="team">{{ cityItem.team }}</span>
    </div>

    <div class="body">
      <h4>{{ cityItem.stadium }}</h4>
      <p class="city">{{ cityItem.name }} · {{ cityItem.status }}</p>
      <p class="temp">{{ cityItem.temp }}°C</p>

      <span v-if="!cityItem.hasGame" class="badge rest">오늘 경기 없음</span>
      <span v-else-if="cityItem.isDome" class="badge dome">🏟️ 돔구장</span>
      <span v-else-if="cityItem.status === '비'" class="badge rain">🌧️ 우천 취소 주의</span>
      <span v-else class="badge play">⚾ 직관 좋은 날</span>

      <button class="btn-detail" @click.stop="emit('click-detail', cityItem.id)">상세보기</button>
    </div>
  </div>
</template>

<style scoped>
/* 입장권 모양: 왼쪽 스터브(마스코트)와 오른쪽 본권(날씨)을 미싱 자국으로 나눈다 */
.ticket {
  display: flex;
  background-color: #fffdf8;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(47, 43, 36, 0.1);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}
.ticket:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 22px rgba(47, 43, 36, 0.18);
}
.no-game {
  opacity: 0.5;
}

.stub {
  position: relative;
  width: 104px;
  border-radius: 10px 0 0 10px;
  padding: 18px 8px;
  text-align: center;
  color: #fffdf8;
}
/* 스터브와 본권 사이를 실제 미싱 자국처럼 보이게 작은 구멍을 세로로 뚫는다 */
.stub::after {
  content: '';
  position: absolute;
  top: 0;
  right: -5px;
  width: 10px;
  height: 100%;
  background-image: repeating-radial-gradient(
    circle at center,
    #f2efe6 0px,
    #f2efe6 4px,
    transparent 4px,
    transparent 9px
  );
  background-size: 10px 18px;
  background-repeat: repeat-y;
}
.face {
  display: block;
  font-size: 38px;
  line-height: 1.1;
}
.team {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.82);
}

.body {
  position: relative;
  flex: 1;
  border-radius: 0 10px 10px 0;
  background-color: #fffdf8;
  padding: 16px 18px 16px 24px;
}
.body h4 {
  margin: 0;
  font-size: 17px;
  color: #2f2b24;
}
.city {
  margin: 4px 0 10px 0;
  font-size: 13px;
  color: #8b8271;
}
.temp {
  margin: 0 0 12px 0;
  font-size: 30px;
  font-weight: bold;
  line-height: 1;
  color: #c96f3f;
}
.badge {
  display: inline-block;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: bold;
  border-radius: 20px;
  color: #fff;
}
.play {
  background-color: #3d7a4f;
}
.rain {
  background-color: #4a7ba7;
}
.dome {
  background-color: #7a5ea7;
}
.rest {
  background-color: #b3ac9d;
}
.btn-detail {
  position: absolute;
  right: 16px;
  bottom: 16px;
  padding: 7px 14px;
  background-color: #fffdf8;
  border: 1px solid #ded8c9;
  border-radius: 20px;
  font-size: 13px;
  color: #6b6355;
  cursor: pointer;
}
.btn-detail:hover {
  background-color: #2f5d3f;
  border-color: #2f5d3f;
  color: #fffdf8;
}
</style>
