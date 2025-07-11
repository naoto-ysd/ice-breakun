<template>
  <div class="container">
    <h1>Ice Breakun 管理システム</h1>
    <nav class="navigation">
      <NuxtLink to="/users" class="nav-link">
        <div class="nav-card">
          <h2>ユーザー管理</h2>
          <p>ユーザーの作成・編集・削除を行います</p>
        </div>
      </NuxtLink>
      <NuxtLink to="/icebreak" class="nav-link">
        <div class="nav-card">
          <h2>アイスブレイク管理</h2>
          <p>アイスブレイクの実行・管理を行います</p>
        </div>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
// ページのメタデータを設定
useHead({
  title: 'Ice Breakun 管理システム'
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 3rem;
}

.navigation {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: inherit;
}

.nav-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.nav-card h2 {
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.nav-card p {
  color: #64748b;
  margin: 0;
  line-height: 1.6;
}
</style> 