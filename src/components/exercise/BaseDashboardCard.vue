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
  padding: 9px 10px;
  margin-bottom: 10px;
  background-color: #fffdf4;
  border: 3px solid #004c86;
  border-radius: 8px;
  box-shadow: 3px 3px 0 #004c86;
}
</style>
