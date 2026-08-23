<script setup>
import { useConfigStore } from '../../stores/configStore.js'

// 구조 분해로 꺼내면 반응성이 끊어지므로, 스토어를 통째로 받아서 점으로 접근한다.
const configStore = useConfigStore()
</script>

<template>
  <button class="unit-toggler" @click="configStore.toggleUnit">
    {{ configStore.unitSymbol }}
  </button>
</template>

<style scoped>
.unit-toggler {
  padding: 4px 11px;
  background-color: transparent;
  border: 1px solid var(--muted);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: var(--muted);
  cursor: pointer;
}
.unit-toggler:hover {
  border-color: var(--line);
  background-color: var(--line);
  color: var(--line);
}
</style>
