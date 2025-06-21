# CRUD機能開発ガイド

このドキュメントでは、Ice Breakunプロジェクトで新しいCRUD機能を作成する際の標準的な手順を説明します。

## 📋 目次

1. [事前準備](#事前準備)
2. [データベーススキーマ設計](#データベーススキーマ設計)
3. [バックエンドAPI実装](#バックエンドapi実装)
4. [フロントエンド実装](#フロントエンド実装)
5. [ナビゲーション追加](#ナビゲーション追加)
6. [テスト](#テスト)
7. [チェックリスト](#チェックリスト)

## 事前準備

### 環境変数の確認
```bash
# データベースURL（SQLite）
export DATABASE_URL="file:./data/ice_breakun.db"
```

### 必要なツール
- Node.js
- Prisma CLI
- Hono.js（APIサーバー）
- Vue.js / Nuxt.js（フロントエンド）

## データベーススキーマ設計

### 1. Prismaスキーマファイルを編集

**ファイル**: `prisma/schema.prisma`

```prisma
model YourModel {
  id         Int      @id @default(autoincrement())
  field1     String
  field2     String?  // オプショナルフィールド
  user_id    Int?     // 外部キー（必要に応じて）
  user       User?    @relation(fields: [user_id], references: [id], onDelete: Cascade)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
}

// 既存のUserモデルに関連を追加（必要に応じて）
model User {
  id           Int         @id @default(autoincrement())
  name         String
  email        String      @unique
  created_at   DateTime    @default(now())
  updated_at   DateTime    @updatedAt
  your_models  YourModel[] // 追加
}
```

### 2. データベースマイグレーション

```bash
# Prismaクライアント生成
npx prisma generate

# マイグレーション実行
export DATABASE_URL="file:./data/ice_breakun.db"
npx prisma migrate dev --name add-your-model
```

## バックエンドAPI実装

### 1. リポジトリクラスの作成

**ファイル**: `server/db.ts`

```typescript
// インターフェース定義
export interface YourModel {
  id: number
  field1: string
  field2?: string
  user_id?: number
  user?: User
  created_at?: Date
  updated_at?: Date
}

// リポジトリクラス
export class YourModelRepository {
  // 全件取得
  async getAll(): Promise<YourModel[]> {
    return await prisma.yourModel.findMany({
      include: { user: true }, // 必要に応じて
      orderBy: { created_at: 'desc' }
    })
  }

  // ID別取得
  async getById(id: number): Promise<YourModel | null> {
    return await prisma.yourModel.findUnique({
      where: { id },
      include: { user: true }
    })
  }

  // 作成
  async create(data: CreateYourModelData): Promise<YourModel> {
    try {
      return await prisma.yourModel.create({
        data,
        include: { user: true }
      })
    } catch (error: any) {
      // エラーハンドリング
      if (error.code === 'P2003') {
        const err = new Error('Related record not found')
        ;(err as any).code = 'FOREIGN_KEY_VIOLATION'
        throw err
      }
      throw error
    }
  }

  // 更新
  async update(id: number, data: UpdateYourModelData): Promise<YourModel> {
    try {
      return await prisma.yourModel.update({
        where: { id },
        data,
        include: { user: true }
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        const err = new Error('Record not found')
        ;(err as any).code = 'NOT_FOUND'
        throw err
      }
      throw error
    }
  }

  // 削除
  async delete(id: number): Promise<void> {
    try {
      await prisma.yourModel.delete({
        where: { id }
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        const err = new Error('Record not found')
        ;(err as any).code = 'NOT_FOUND'
        throw err
      }
      throw error
    }
  }
}

// インスタンス作成
export const yourModelRepository = new YourModelRepository()
```

### 2. APIエンドポイントの追加

**ファイル**: `server/index.ts`

```typescript
import { yourModelRepository } from './db'

// API定義
const yourModelApi = new Hono()

// GET /api/v1/your-models - 全件取得
yourModelApi.get('/', async (c) => {
  try {
    const items = await yourModelRepository.getAll()
    return c.json({ data: items })
  } catch (error: any) {
    console.error('Error fetching items:', error)
    return c.json({ error: 'Failed to fetch items' }, 500)
  }
})

// GET /api/v1/your-models/:id - 個別取得
yourModelApi.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const item = await yourModelRepository.getById(id)
    
    if (!item) {
      return c.json({ error: 'Item not found' }, 404)
    }
    
    return c.json({ data: item })
  } catch (error: any) {
    console.error('Error fetching item:', error)
    return c.json({ error: 'Failed to fetch item' }, 500)
  }
})

// POST /api/v1/your-models - 作成
yourModelApi.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const { field1, field2, user_id } = body

    // バリデーション
    if (!field1) {
      return c.json({ error: 'Required fields are missing' }, 400)
    }

    const item = await yourModelRepository.create({
      field1,
      field2,
      user_id
    })
    
    return c.json({
      message: 'Item created successfully',
      data: item
    }, 201)
  } catch (error: any) {
    console.error('Error creating item:', error)
    if (error.code === 'FOREIGN_KEY_VIOLATION') {
      return c.json({ error: 'Related record not found' }, 404)
    }
    return c.json({ error: 'Failed to create item' }, 500)
  }
})

// PUT /api/v1/your-models/:id - 更新
yourModelApi.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    
    const item = await yourModelRepository.update(id, body)
    return c.json({
      message: 'Item updated successfully',
      data: item
    })
  } catch (error: any) {
    console.error('Error updating item:', error)
    if (error.code === 'NOT_FOUND') {
      return c.json({ error: 'Item not found' }, 404)
    }
    return c.json({ error: 'Failed to update item' }, 500)
  }
})

// DELETE /api/v1/your-models/:id - 削除
yourModelApi.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    await yourModelRepository.delete(id)
    return c.json({ message: 'Item deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting item:', error)
    if (error.code === 'NOT_FOUND') {
      return c.json({ error: 'Item not found' }, 404)
    }
    return c.json({ error: 'Failed to delete item' }, 500)
  }
})

// ルートをマウント
app.route('/api/v1/your-models', yourModelApi)
```

## フロントエンド実装

### 1. Vueコンポーネントの作成

**ファイル**: `components/YourModelManager.vue`

```vue
<template>
  <div class="your-model-manager">
    <div class="header">
      <h2>Your Model管理</h2>
      <button @click="showCreateForm = !showCreateForm" class="create-btn">
        新規作成
      </button>
    </div>

    <!-- 作成フォーム -->
    <div v-if="showCreateForm" class="create-form">
      <form @submit.prevent="createItem">
        <div class="form-group">
          <label>Field1:</label>
          <input v-model="newItem.field1" required />
        </div>
        <div class="form-group">
          <label>Field2:</label>
          <input v-model="newItem.field2" />
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="!newItem.field1">作成</button>
          <button type="button" @click="cancelCreate">キャンセル</button>
        </div>
      </form>
    </div>

    <!-- 一覧表示 -->
    <div class="items-list">
      <div v-if="items.length === 0" class="no-items">
        データがありません
      </div>
      <div v-else>
        <div v-for="item in items" :key="item.id" class="item-card">
          <div v-if="editingId === item.id" class="edit-mode">
            <!-- 編集フォーム -->
            <form @submit.prevent="updateItem(item.id)">
              <input v-model="editData.field1" required />
              <input v-model="editData.field2" />
              <button type="submit">保存</button>
              <button type="button" @click="cancelEdit">キャンセル</button>
            </form>
          </div>
          <div v-else class="view-mode">
            <!-- 表示モード -->
            <div class="item-content">
              <h3>{{ item.field1 }}</h3>
              <p v-if="item.field2">{{ item.field2 }}</p>
              <span class="meta">{{ formatDate(item.created_at) }}</span>
            </div>
            <div class="item-actions">
              <button @click="startEdit(item)" class="edit-btn">編集</button>
              <button @click="deleteItem(item.id)" class="delete-btn">削除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface YourModel {
  id: number
  field1: string
  field2?: string
  user_id?: number
  created_at?: string
  updated_at?: string
}

const items = ref<YourModel[]>([])
const showCreateForm = ref(false)
const editingId = ref<number | null>(null)
const newItem = ref({ field1: '', field2: '' })
const editData = ref({ field1: '', field2: '' })

const API_BASE = 'http://localhost:3002/api/v1'

// データ取得
const fetchItems = async () => {
  try {
    const response = await fetch(`${API_BASE}/your-models`)
    const data = await response.json()
    items.value = data.data || []
  } catch (error) {
    console.error('Error fetching items:', error)
  }
}

// 作成
const createItem = async () => {
  try {
    const response = await fetch(`${API_BASE}/your-models`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem.value)
    })

    if (response.ok) {
      await fetchItems()
      cancelCreate()
    }
  } catch (error) {
    console.error('Error creating item:', error)
  }
}

// 更新
const updateItem = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE}/your-models/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData.value)
    })

    if (response.ok) {
      await fetchItems()
      cancelEdit()
    }
  } catch (error) {
    console.error('Error updating item:', error)
  }
}

// 削除
const deleteItem = async (id: number) => {
  if (!confirm('削除しますか？')) return

  try {
    const response = await fetch(`${API_BASE}/your-models/${id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      await fetchItems()
    }
  } catch (error) {
    console.error('Error deleting item:', error)
  }
}

// 編集開始
const startEdit = (item: YourModel) => {
  editingId.value = item.id
  editData.value = { field1: item.field1, field2: item.field2 || '' }
}

// 編集キャンセル
const cancelEdit = () => {
  editingId.value = null
  editData.value = { field1: '', field2: '' }
}

// 作成キャンセル
const cancelCreate = () => {
  showCreateForm.value = false
  newItem.value = { field1: '', field2: '' }
}

// 日付フォーマット
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('ja-JP')
}

onMounted(fetchItems)
</script>

<style scoped>
.your-model-manager {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.create-btn, .edit-btn, .delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.create-btn { background: #4caf50; color: white; }
.edit-btn { background: #2196f3; color: white; }
.delete-btn { background: #f44336; color: white; }

.create-form {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.item-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.view-mode {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.meta {
  color: #666;
  font-size: 0.8rem;
}
</style>
```

### 2. ページコンポーネントの作成

**ファイル**: `pages/your-models.vue`

```vue
<template>
  <div class="your-models-page">
    <h1>Your Models</h1>
    <YourModelManager />
  </div>
</template>

<script setup lang="ts">
import YourModelManager from '~/components/YourModelManager.vue'

useHead({
  title: 'Your Models - Ice Breakun'
})
</script>

<style scoped>
.your-models-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.your-models-page h1 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}
</style>
```

## ナビゲーション追加

**ファイル**: `app.vue`

```vue
<template>
  <div>
    <nav class="navbar">
      <div class="nav-container">
        <NuxtLink to="/" class="nav-brand">Ice Breakun</NuxtLink>
        <div class="nav-links">
          <NuxtLink to="/" class="nav-link">ホーム</NuxtLink>
          <NuxtLink to="/users" class="nav-link">ユーザー</NuxtLink>
          <NuxtLink to="/your-models" class="nav-link">Your Models</NuxtLink> <!-- 追加 -->
          <NuxtLink to="/chat" class="nav-link">チャット</NuxtLink>
        </div>
      </div>
    </nav>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
```

## テスト

### 1. API テスト（curl）

```bash
# 作成
curl -X POST http://localhost:3002/api/v1/your-models \
  -H "Content-Type: application/json" \
  -d '{"field1": "test", "field2": "value"}'

# 取得
curl http://localhost:3002/api/v1/your-models

# 更新
curl -X PUT http://localhost:3002/api/v1/your-models/1 \
  -H "Content-Type: application/json" \
  -d '{"field1": "updated"}'

# 削除
curl -X DELETE http://localhost:3002/api/v1/your-models/1
```

### 2. ブラウザテスト

1. フロントエンド（`http://localhost:3000`）でUIテスト
2. 各CRUD操作の動作確認
3. エラーハンドリングの確認

## チェックリスト

### データベース
- [ ] Prismaスキーマ定義完了
- [ ] マイグレーション実行完了
- [ ] 関連テーブルとの整合性確認

### バックエンド
- [ ] リポジトリクラス実装完了
- [ ] APIエンドポイント実装完了
- [ ] エラーハンドリング実装完了
- [ ] バリデーション実装完了

### フロントエンド
- [ ] Vueコンポーネント作成完了
- [ ] CRUD操作実装完了
- [ ] ページコンポーネント作成完了
- [ ] スタイリング完了

### 統合
- [ ] ナビゲーション追加完了
- [ ] API通信確認完了
- [ ] エラーハンドリング確認完了
- [ ] ユーザビリティ確認完了

### テスト
- [ ] API動作テスト完了
- [ ] UI動作テスト完了
- [ ] エラーケーステスト完了

---

## 📝 注意事項

1. **命名規則**: モデル名、API エンドポイント、コンポーネント名の一貫性を保つ
2. **エラーハンドリング**: 適切なHTTPステータスコードとエラーメッセージを返す
3. **バリデーション**: フロントエンドとバックエンド両方でバリデーションを実装
4. **セキュリティ**: 必要に応じて認証・認可を追加
5. **パフォーマンス**: 大量データを扱う場合はページネーションを検討

このガイドに従って新しいCRUD機能を実装することで、一貫性のある高品質な機能を素早く開発できます。 