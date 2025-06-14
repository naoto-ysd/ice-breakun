<template>
  <div class="page-container">
    <div class="page-header">
      <NuxtLink to="/" class="back-link">← ホームに戻る</NuxtLink>
    </div>
    <IceBreak />
  </div>
</template>

<script setup lang="ts">
import IceBreak from '~/components/IceBreak.vue'

// ページのメタデータを設定
useHead({
  title: 'アイスブレイク管理 - Ice Breakun'
})
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.page-header {
  margin-bottom: 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.back-link:hover {
  background-color: #f1f5f9;
}
</style> 