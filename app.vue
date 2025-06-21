<template>
  <div>
    <nav class="navbar">
      <div class="nav-container">
        <NuxtLink to="/" class="nav-brand">Ice Breakun</NuxtLink>
        <div class="nav-links">
          <NuxtLink to="/" class="nav-link">ホーム</NuxtLink>
          <NuxtLink to="/users" class="nav-link">ユーザー</NuxtLink>
          <NuxtLink to="/icebreak" class="nav-link">アイスブレイク</NuxtLink>
          <NuxtLink to="/chat" class="nav-link">チャット</NuxtLink>
        </div>
      </div>
    </nav>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// レイアウトファイルとして機能
</script>

<style>
.navbar {
  background: #2196f3;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
}

.nav-brand:hover {
  color: #e3f2fd;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background: rgba(255,255,255,0.1);
}

.nav-link.router-link-active {
  background: rgba(255,255,255,0.2);
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
</style>
