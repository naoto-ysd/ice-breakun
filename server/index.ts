import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { userRepository, messageRepository } from './db'

const app = new Hono()

// CORS設定
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://host.docker.internal:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// ルートエンドポイント
app.get('/', (c) => {
  return c.json({
    message: 'Hello from Hono!',
    status: 'Server is running'
  })
})

// ヘルスチェック
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

// API v1 ルート
const api = new Hono()

api.get('/hello', (c) => {
  return c.json({ message: 'Hello from API v1!' })
})

api.get('/users', async (c) => {
  try {
    const users = await userRepository.getAllUsers()
    return c.json({ users })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

api.post('/users', async (c) => {
  try {
    const body = await c.req.json()
    const { name, email } = body

    if (!name || !email) {
      return c.json({ error: 'Name and email are required' }, 400)
    }

    const user = await userRepository.createUser(name, email)
    return c.json({
      message: 'User created',
      user
    }, 201)
  } catch (error: any) {
    console.error('Error creating user:', error)
    if (error.code === 'UNIQUE_VIOLATION') {
      return c.json({ error: 'Email already exists' }, 409)
    }
    return c.json({ error: 'Failed to create user' }, 500)
  }
})

api.put('/users/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const { name, email } = body

    if (!name && !email) {
      return c.json({ error: 'At least one field (name or email) is required' }, 400)
    }

    const updateData: { name?: string; email?: string } = {}
    if (name) updateData.name = name
    if (email) updateData.email = email

    const user = await userRepository.updateUser(id, updateData)
    return c.json({
      message: 'User updated',
      user
    })
  } catch (error: any) {
    console.error('Error updating user:', error)
    if (error.code === 'UNIQUE_VIOLATION') {
      return c.json({ error: 'Email already exists' }, 409)
    }
    if (error.code === 'NOT_FOUND') {
      return c.json({ error: 'User not found' }, 404)
    }
    return c.json({ error: 'Failed to update user' }, 500)
  }
})

api.delete('/users/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    await userRepository.deleteUser(id)
    return c.json({ message: 'User deleted' })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    if (error.code === 'NOT_FOUND') {
      return c.json({ error: 'User not found' }, 404)
    }
    return c.json({ error: 'Failed to delete user' }, 500)
  }
})

// APIルートをマウント
app.route('/api/v1', api)

// メッセージAPI
const messageApi = new Hono()

// 全メッセージ取得
messageApi.get('/', async (c) => {
  try {
    const messages = await messageRepository.getAllMessages()
    return c.json({ messages })
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    return c.json({ error: 'Failed to fetch messages' }, 500)
  }
})

// メッセージID別取得
messageApi.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const message = await messageRepository.getMessageById(id)

    if (!message) {
      return c.json({ error: 'Message not found' }, 404)
    }

    return c.json({ message })
  } catch (error: any) {
    console.error('Error fetching message:', error)
    return c.json({ error: 'Failed to fetch message' }, 500)
  }
})

// メッセージ作成
messageApi.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const { content, user_id } = body

    if (!content || !user_id) {
      return c.json({ error: 'Content and user_id are required' }, 400)
    }

    const message = await messageRepository.createMessage(content, user_id)
    return c.json({
      message: 'Message created',
      data: message
    }, 201)
  } catch (error: any) {
    console.error('Error creating message:', error)
    if (error.code === 'FOREIGN_KEY_VIOLATION') {
      return c.json({ error: 'User not found' }, 404)
    }
    return c.json({ error: 'Failed to create message' }, 500)
  }
})

// メッセージ更新
messageApi.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const { content } = body

    if (!content) {
      return c.json({ error: 'Content is required' }, 400)
    }

    const message = await messageRepository.updateMessage(id, content)
    return c.json({
      message: 'Message updated',
      data: message
    })
  } catch (error: any) {
    console.error('Error updating message:', error)
    if (error.code === 'NOT_FOUND') {
      return c.json({ error: 'Message not found' }, 404)
    }
    return c.json({ error: 'Failed to update message' }, 500)
  }
})

// メッセージ削除
messageApi.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    await messageRepository.deleteMessage(id)
    return c.json({ message: 'Message deleted' })
  } catch (error: any) {
    console.error('Error deleting message:', error)
    if (error.code === 'NOT_FOUND') {
      return c.json({ error: 'Message not found' }, 404)
    }
    return c.json({ error: 'Failed to delete message' }, 500)
  }
})

// ユーザー別メッセージ取得
messageApi.get('/user/:user_id', async (c) => {
  try {
    const user_id = parseInt(c.req.param('user_id'))
    const messages = await messageRepository.getMessagesByUserId(user_id)
    return c.json({ messages })
  } catch (error: any) {
    console.error('Error fetching user messages:', error)
    return c.json({ error: 'Failed to fetch user messages' }, 500)
  }
})

// メッセージAPIルートをマウント
app.route('/api/v1/messages', messageApi)

// サーバー起動
const port = 3001

try {
  serve({
    fetch: app.fetch,
    port,
    hostname: '0.0.0.0'
  }, (info) => {
    console.log(`🚀 Hono server is running on http://localhost:${info.port}`)
  })
} catch (error) {
  console.error('Failed to start server:', error)
  process.exit(1)
}   