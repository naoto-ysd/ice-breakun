<template>
  <div class="chat-room">
    <div class="chat-header">
      <h2>チャットルーム</h2>
      <div class="user-selector">
        <label for="user-select">ユーザー選択:</label>
        <select id="user-select" v-model="selectedUserId" @change="fetchMessages">
          <option value="">-- ユーザーを選択 --</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="messages-container" ref="messagesContainer">
      <div v-if="messages.length === 0" class="no-messages">
        メッセージがありません
      </div>
      <div v-else>
        <div 
          v-for="message in messages" 
          :key="message.id" 
          class="message"
          :class="{ 'own-message': message.user_id === selectedUserId }"
        >
          <div class="message-header">
            <span class="username">{{ message.user?.name || 'Unknown' }}</span>
            <span class="timestamp">{{ formatDate(message.created_at) }}</span>
            <div v-if="message.user_id === selectedUserId" class="message-actions">
              <button @click="startEdit(message)" class="edit-btn">編集</button>
              <button @click="deleteMessage(message.id)" class="delete-btn">削除</button>
            </div>
          </div>
          <div class="message-content">
            <div v-if="editingMessageId === message.id" class="edit-mode">
              <input 
                v-model="editContent" 
                @keyup.enter="updateMessage(message.id)"
                @keyup.escape="cancelEdit"
                class="edit-input"
                ref="editInput"
              />
              <div class="edit-actions">
                <button @click="updateMessage(message.id)" class="save-btn">保存</button>
                <button @click="cancelEdit" class="cancel-btn">キャンセル</button>
              </div>
            </div>
            <div v-else>{{ message.content }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="message-input">
      <div v-if="!selectedUserId" class="no-user-selected">
        メッセージを送信するにはユーザーを選択してください
      </div>
      <div v-else class="input-container">
        <input 
          v-model="newMessage" 
          @keyup.enter="sendMessage"
          placeholder="メッセージを入力..."
          class="message-input-field"
        />
        <button @click="sendMessage" :disabled="!newMessage.trim()" class="send-btn">
          送信
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

interface User {
  id: number
  name: string
  email: string
  created_at?: string
  updated_at?: string
}

interface Message {
  id: number
  content: string
  user_id: number
  user?: User
  created_at?: string
  updated_at?: string
}

const messages = ref<Message[]>([])
const users = ref<User[]>([])
const selectedUserId = ref<number | null>(null)
const newMessage = ref('')
const editingMessageId = ref<number | null>(null)
const editContent = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const editInput = ref<HTMLInputElement | null>(null)

const API_BASE = 'http://localhost:3002/api/v1'

// ユーザー一覧を取得
const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_BASE}/users`)
    const data = await response.json()
    users.value = data.users || []
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

// 全メッセージを取得
const fetchMessages = async () => {
  try {
    const response = await fetch(`${API_BASE}/messages`)
    const data = await response.json()
    messages.value = data.messages || []
    scrollToBottom()
  } catch (error) {
    console.error('Error fetching messages:', error)
  }
}

// メッセージ送信
const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedUserId.value) return

  try {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: newMessage.value.trim(),
        user_id: selectedUserId.value
      })
    })

    if (response.ok) {
      newMessage.value = ''
      await fetchMessages()
    } else {
      const error = await response.json()
      console.error('Error sending message:', error)
    }
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

// メッセージ編集開始
const startEdit = (message: Message) => {
  editingMessageId.value = message.id
  editContent.value = message.content
  nextTick(() => {
    editInput.value?.focus()
  })
}

// メッセージ編集キャンセル
const cancelEdit = () => {
  editingMessageId.value = null
  editContent.value = ''
}

// メッセージ更新
const updateMessage = async (messageId: number) => {
  if (!editContent.value.trim()) return

  try {
    const response = await fetch(`${API_BASE}/messages/${messageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: editContent.value.trim()
      })
    })

    if (response.ok) {
      cancelEdit()
      await fetchMessages()
    } else {
      const error = await response.json()
      console.error('Error updating message:', error)
    }
  } catch (error) {
    console.error('Error updating message:', error)
  }
}

// メッセージ削除
const deleteMessage = async (messageId: number) => {
  if (!confirm('このメッセージを削除しますか？')) return

  try {
    const response = await fetch(`${API_BASE}/messages/${messageId}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      await fetchMessages()
    } else {
      const error = await response.json()
      console.error('Error deleting message:', error)
    }
  } catch (error) {
    console.error('Error deleting message:', error)
  }
}

// 日付フォーマット
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('ja-JP')
}

// 最下部にスクロール
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

onMounted(() => {
  fetchUsers()
  fetchMessages()
})
</script>

<style scoped>
.chat-room {
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.chat-header {
  background: #f8f9fa;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h2 {
  margin: 0;
  color: #333;
}

.user-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-selector label {
  font-weight: 500;
}

.user-selector select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.messages-container {
  height: 400px;
  overflow-y: auto;
  padding: 1rem;
  background: #f8f9fa;
}

.no-messages {
  text-align: center;
  color: #666;
  font-style: italic;
}

.message {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.own-message {
  background: #e3f2fd;
  margin-left: 2rem;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.username {
  font-weight: 600;
  color: #2196f3;
}

.timestamp {
  font-size: 0.8rem;
  color: #666;
}

.message-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn, .delete-btn, .save-btn, .cancel-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.edit-btn {
  background: #4caf50;
  color: white;
}

.delete-btn {
  background: #f44336;
  color: white;
}

.save-btn {
  background: #2196f3;
  color: white;
}

.cancel-btn {
  background: #9e9e9e;
  color: white;
}

.message-content {
  color: #333;
  line-height: 1.4;
}

.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.message-input {
  padding: 1rem;
  border-top: 1px solid #ddd;
  background: white;
}

.no-user-selected {
  text-align: center;
  color: #666;
  font-style: italic;
}

.input-container {
  display: flex;
  gap: 0.5rem;
}

.message-input-field {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.send-btn {
  padding: 0.75rem 1.5rem;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.send-btn:hover:not(:disabled) {
  background: #1976d2;
}
</style> 