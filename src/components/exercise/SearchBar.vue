<script setup>
import { Search } from '@element-plus/icons-vue'

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

// el-input 은 값이 바뀌면 새 값을 그대로 넘겨준다.
// 한글을 조합하는 중에도 넘어오므로 한 글자씩 검색된다.
const changeKeyword = (value) => {
  emit('update-query', value)
}
</script>

<template>
  <div>
    <el-input
      :model-value="keyword"
      placeholder="도시 이름 (예: 서울, 대구)"
      size="large"
      clearable
      :prefix-icon="Search"
      @update:model-value="changeKeyword"
    />

    <p v-if="keyword.trim() === ''" class="guide">
      전체 {{ totalCount }}개 구장을 보여 주는 중입니다.
    </p>
    <p v-else-if="resultCount > 0" class="guide">'{{ keyword }}' 검색 결과 {{ resultCount }}곳</p>
    <p v-else class="guide empty">검색어와 일치하는 도시가 없습니다.</p>
  </div>
</template>

<style scoped>
.guide {
  margin: 9px 0 0 1px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: #6d6a63;
}
.empty {
  color: #b3261e;
}

/* Element Plus 기본 스타일을 이 화면 톤(각진 테두리)에 맞춘다 */
:deep(.el-input__wrapper) {
  border-radius: 0;
  background-color: #fff;
  box-shadow: 0 0 0 1px #9b978e inset;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #1a1a1a inset;
}
</style>
