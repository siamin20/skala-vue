<script setup>
// 1. 부모가 가진 검색어를 받아서 보여 준다 (읽기 전용)
defineProps({
  keyword: {
    type: String,
    required: true,
  },
  totalCount: {
    type: Number,
    required: true,
  },
  resultCount: {
    type: Number,
    required: true,
  },
})

// 2. 입력이 바뀌면 부모에게 올려 보낸다
const emit = defineEmits(['update-query'])

// v-model 은 한글을 조합하는 중에는 값이 안 넘어간다.
// :value 와 @input 으로 풀어 쓰면 한 글자씩 검색된다.
const changeKeyword = (event) => {
  emit('update-query', event.target.value)
}
</script>

<template>
  <div>
    <input
      type="text"
      :value="keyword"
      @input="changeKeyword"
      placeholder="도시 이름을 입력하세요 (예: 서울, 대구)"
    />

    <p v-if="keyword.trim() === ''" class="guide">
      전체 {{ totalCount }}개 구장을 보여 주는 중입니다.
    </p>
    <p v-else-if="resultCount > 0" class="guide">'{{ keyword }}' 검색 결과 {{ resultCount }}곳</p>
    <p v-else class="guide empty">검색어와 일치하는 도시가 없습니다.</p>
  </div>
</template>

<style scoped>
input {
  width: 100%;
  padding: 13px 18px;
  background-color: #faf8f2;
  border: 1px solid #e6e0d1;
  border-radius: 24px;
  font-family: 'IBM Plex Sans KR', sans-serif;
  font-size: 15px;
  color: #2f2b24;
  outline: none;
}
input:focus {
  border-color: #3d7a4f;
  background-color: #fffdf8;
}
.guide {
  margin: 12px 0 0 4px;
  font-size: 13.5px;
  color: #8b8271;
}
.empty {
  color: #c0392b;
  font-weight: 600;
}
</style>
