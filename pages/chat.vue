<template>
  <div class="chat-page">
    <h1>チャット</h1>
    <ChatRoom />
  </div>
</template>

<script setup lang="ts">
import ChatRoom from '~/components/ChatRoom.vue'

useHead({
  title: 'チャット - Ice Breakun'
})
</script>

<style scoped>
.chat-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.chat-page h1 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}
</style> 