<script setup>
// 검색 영역과 목록 영역의 껍데기를 공통으로 쓰기 위한 레이아웃 컴포넌트.
// 데이터는 다루지 않고, 제목과 내용은 부모가 슬롯으로 넣어 준다.
</script>

<template>
  <section class="dash-card">
    <h3 class="dash-title">
      <slot name="title">제목 없음</slot>
    </h3>
    <div>
      <slot>내용이 없습니다.</slot>
    </div>
  </section>
</template>

<style scoped>
.dash-card {
  padding: 20px 24px;
  margin-bottom: 8px;
  background-color: #fffdf8;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(47, 43, 36, 0.08);
}
.dash-title {
  margin: 0 0 14px 0;
  font-size: 14px;
  letter-spacing: 0.02em;
  color: #3d7a4f;
}
</style>
