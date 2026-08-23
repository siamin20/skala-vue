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
const changeKeyword = (value) => {
  emit('update-query', value)
}

// 한글은 조합이 끝나야 값이 넘어온다. '대구' 를 치고 멈추면 '구' 가 조합 중이라
// 검색어는 '대' 에 머물러 화면과 어긋난다. 조합 중에도 지금 글자를 받아서 맞춰 준다.
const changeComposing = (event) => {
  emit('update-query', event.target.value)
}
</script>

<template>
  <div>
    <el-input
      :model-value="keyword"
      placeholder="도시 이름 (예: 서울, 대구)"
      size="default"
      clearable
      :prefix-icon="Search"
      @update:model-value="changeKeyword"
      @compositionupdate="changeComposing"
    />

    <p v-if="keyword.trim() === ''" class="guide">구장 {{ totalCount }}곳</p>
    <p v-else-if="resultCount > 0" class="guide">{{ resultCount }}곳 / {{ totalCount }}곳</p>
    <p v-else class="guide empty">일치하는 도시 없음</p>
  </div>
</template>

<style scoped>
.guide {
  margin: 5px 0 0 1px;
  font-family: 'Galmuri11', monospace;
  font-size: 10px;
  color: #6d6a63;
}
.empty {
  color: #b3261e;
}

/* Element Plus 기본 스타일을 이 화면 톤(각진 테두리)에 맞춘다 */
:deep(.el-input__wrapper) {
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 0 0 0 2px #004c86 inset;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #e0348a inset;
}
</style>
