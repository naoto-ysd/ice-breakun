<template>
  <div>
    <h1>アイスブレイク管理</h1>
    <h2>今日の担当者</h2>
    <div class="today-assignee">
      <p>hoge</p>
    </div>
    <h2>手動実行</h2>
    <div class="manual-execution">
      <button>実行</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// アイスブレイク管理のロジックをここに追加
</script>

<style scoped>
.today-assignee {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.manual-execution {
  margin-top: 1rem;
}

button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #2563eb;
}
</style>   