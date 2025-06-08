<template>
  <div>
    <h1>ユーザー一覧</h1>
    <button @click="fetchUsers">ユーザー取得</button>
    <ul v-if="users.length > 0">
      <li v-for="user in users" :key="user.id">
        {{ user.name }}（{{ user.email }}）
      </li>
    </ul>
    <p v-else-if="!loading && users.length === 0">
      ユーザー取得ボタンを押してください
    </p>
    <p v-if="loading">読み込み中...</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

const users = ref<User[]>([])
const loading = ref(false)

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await fetch('http://localhost:3002/api/v1/users')
    const data = await res.json()
    users.value = data.users
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
  } finally {
    loading.value = false
  }
}
</script> 