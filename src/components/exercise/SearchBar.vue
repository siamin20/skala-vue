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
  margin: 0;
  padding: 5px 10px 7px 10px;
  font-size: 10px;
  color: var(--muted);
}
.empty {
  color: var(--red);
}

/* Element Plus 입력칸을 전광판 톤에 맞춘다 */
:deep(.el-input__wrapper) {
  border-radius: 0;
  background-color: transparent;
  box-shadow: none;
  padding: 4px 10px;
}
:deep(.el-input__inner) {
  height: 34px;
  font-size: 13px;
  color: var(--text);
}
:deep(.el-input__inner::placeholder) {
  color: var(--muted);
}
:deep(.el-input__prefix),
:deep(.el-input__suffix) {
  color: var(--muted);
}
</style>
