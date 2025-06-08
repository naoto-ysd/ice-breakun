import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'

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

api.get('/users', (c) => {
  // サンプルユーザーデータ
  const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
  ]
  return c.json({ users })
})

api.post('/users', async (c) => {
  const body = await c.req.json()
  return c.json({
    message: 'User created',
    user: { id: Date.now(), ...body }
  }, 201)
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