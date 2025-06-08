<template>
  <div>
    <h1>ユーザー管理</h1>
    
    <div class="create-form">
      <h2>新規ユーザー作成</h2>
      <form @submit.prevent="createUser">
        <input 
          v-model="newUser.name" 
          placeholder="名前" 
          required 
          class="form-input"
        />
        <input 
          v-model="newUser.email" 
          type="email" 
          placeholder="メールアドレス" 
          required 
          class="form-input"
        />
        <button type="submit" :disabled="creating" class="btn btn-primary">
          {{ creating ? '作成中...' : 'ユーザー作成' }}
        </button>
      </form>
    </div>

    <div class="users-section">
      <button @click="fetchUsers" class="btn btn-secondary">ユーザー取得</button>
      
      <div v-if="users.length > 0" class="users-list">
        <div v-for="user in users" :key="user.id" class="user-item">
          <div v-if="editingUser?.id !== user.id" class="user-display">
            <span class="user-info">{{ user.name }}（{{ user.email }}）</span>
            <div class="user-actions">
              <button @click="startEdit(user)" class="btn btn-small">編集</button>
              <button @click="deleteUser(user.id)" class="btn btn-danger btn-small">削除</button>
            </div>
          </div>
          
          <div v-else class="user-edit">
            <input 
              v-model="editingUser.name" 
              placeholder="名前" 
              class="form-input"
            />
            <input 
              v-model="editingUser.email" 
              type="email" 
              placeholder="メールアドレス" 
              class="form-input"
            />
            <div class="edit-actions">
              <button @click="updateUser" :disabled="updating" class="btn btn-primary btn-small">
                {{ updating ? '更新中...' : '保存' }}
              </button>
              <button @click="cancelEdit" class="btn btn-secondary btn-small">キャンセル</button>
            </div>
          </div>
        </div>
      </div>
      
      <p v-else-if="!loading && users.length === 0">
        ユーザー取得ボタンを押してください
      </p>
      <p v-if="loading">読み込み中...</p>
    </div>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
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
const creating = ref(false)
const updating = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const newUser = ref({ name: '', email: '' })
const editingUser = ref<User | null>(null)

const showMessage = (text: string, type: 'success' | 'error') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await fetch('http://localhost:3002/api/v1/users')
    const data = await res.json()
    users.value = data.users
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
    showMessage('ユーザー取得に失敗しました', 'error')
  } finally {
    loading.value = false
  }
}

const createUser = async () => {
  creating.value = true
  try {
    const res = await fetch('http://localhost:3002/api/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser.value)
    })
    
    if (res.ok) {
      newUser.value = { name: '', email: '' }
      await fetchUsers()
      showMessage('ユーザーを作成しました', 'success')
    } else {
      const error = await res.json()
      showMessage(error.error || 'ユーザー作成に失敗しました', 'error')
    }
  } catch (error) {
    console.error('ユーザー作成エラー:', error)
    showMessage('ユーザー作成に失敗しました', 'error')
  } finally {
    creating.value = false
  }
}

const startEdit = (user: User) => {
  editingUser.value = { ...user }
}

const cancelEdit = () => {
  editingUser.value = null
}

const updateUser = async () => {
  if (!editingUser.value) return
  
  updating.value = true
  try {
    const res = await fetch(`http://localhost:3002/api/v1/users/${editingUser.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editingUser.value.name,
        email: editingUser.value.email
      })
    })
    
    if (res.ok) {
      editingUser.value = null
      await fetchUsers()
      showMessage('ユーザーを更新しました', 'success')
    } else {
      const error = await res.json()
      showMessage(error.error || 'ユーザー更新に失敗しました', 'error')
    }
  } catch (error) {
    console.error('ユーザー更新エラー:', error)
    showMessage('ユーザー更新に失敗しました', 'error')
  } finally {
    updating.value = false
  }
}

const deleteUser = async (id: number) => {
  if (!confirm('このユーザーを削除しますか？')) return
  
  try {
    const res = await fetch(`http://localhost:3002/api/v1/users/${id}`, {
      method: 'DELETE'
    })
    
    if (res.ok) {
      await fetchUsers()
      showMessage('ユーザーを削除しました', 'success')
    } else {
      const error = await res.json()
      showMessage(error.error || 'ユーザー削除に失敗しました', 'error')
    }
  } catch (error) {
    console.error('ユーザー削除エラー:', error)
    showMessage('ユーザー削除に失敗しました', 'error')
  }
}
</script>

<style scoped>
.create-form {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.users-section {
  margin-top: 1rem;
}

.users-list {
  margin-top: 1rem;
}

.user-item {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.user-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  flex: 1;
}

.user-actions, .edit-actions {
  display: flex;
  gap: 0.5rem;
}

.user-edit {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.form-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-small {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>   