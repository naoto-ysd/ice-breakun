# Ice Breakun

アイスブレイクとチャット機能を備えたWebアプリケーションです。

## 📚 ドキュメント

- [CRUD機能開発ガイド](./docs/CRUD_DEVELOPMENT_GUIDE.md) - 新しいCRUD機能を作成する際の手順

## 🏗️ 技術スタック

- **フロントエンド**: Nuxt.js 3 / Vue.js 3 / TypeScript
- **バックエンド**: Hono.js / Node.js
- **データベース**: SQLite / Prisma ORM
- **スタイリング**: CSS

## 📁 プロジェクト構造

```
ice-breakun/
├── components/          # Vueコンポーネント
├── pages/              # ページコンポーネント
├── server/             # バックエンドAPI
├── prisma/             # データベーススキーマ
├── docs/               # ドキュメント
└── ...
```

## 🚀 セットアップ

### 依存関係のインストール

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### データベースセットアップ

```bash
# 環境変数設定
export DATABASE_URL="file:./data/ice_breakun.db"

# Prismaクライアント生成
npx prisma generate

# データベースマイグレーション
npx prisma migrate dev
```

## 🔧 開発サーバー

### フロントエンド（ポート 3000）

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

### バックエンドAPI（ポート 3002）

```bash
cd server
npm run dev
```

## 🌟 機能

- **ユーザー管理**: ユーザーの登録・編集・削除
- **アイスブレイク**: アイスブレイク質問の管理
- **チャット機能**: リアルタイムメッセージング（CRUD対応）
  - メッセージの送信・編集・削除
  - ユーザー別メッセージ表示
  - インライン編集機能

## 🚀 本番環境

アプリケーションをプロダクション向けにビルド:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

プロダクションビルドをローカルでプレビュー:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

## 📖 API エンドポイント

### ユーザー API
- `GET /api/v1/users` - ユーザー一覧取得
- `POST /api/v1/users` - ユーザー作成
- `PUT /api/v1/users/:id` - ユーザー更新
- `DELETE /api/v1/users/:id` - ユーザー削除

### メッセージ API
- `GET /api/v1/messages` - メッセージ一覧取得
- `GET /api/v1/messages/:id` - メッセージ個別取得
- `POST /api/v1/messages` - メッセージ作成
- `PUT /api/v1/messages/:id` - メッセージ更新
- `DELETE /api/v1/messages/:id` - メッセージ削除
- `GET /api/v1/messages/user/:user_id` - ユーザー別メッセージ取得

詳細な開発情報については [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) を参照してください。
