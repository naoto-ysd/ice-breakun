import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { userRepository } from './db.js'

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

// APIルートをマウント
app.route('/api/v1', api)

// サーバー起動
const port = 3002
console.log(`🚀 Hono server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0'
})    