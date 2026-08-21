<script setup>
// 검색 영역과 목록 영역의 껍데기를 공통으로 쓰기 위한 레이아웃 컴포넌트.
// 데이터는 다루지 않고, 안에 들어갈 내용은 부모가 슬롯으로 넣어 준다.
</script>

<template>
  <section class="dash-card">
    <div>
      <slot>내용이 없습니다.</slot>
    </div>
  </section>
</template>

<style scoped>
.dash-card {
  padding: 14px 16px;
  margin-bottom: 18px;
  background-color: #fbfaf7;
  border: 1px solid #1a1a1a;
}
</style>
