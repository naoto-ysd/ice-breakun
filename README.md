# Ice Breakun

アイスブレイクとチャット機能を備えたWebアプリケーションです。

## 🏗️ 技術スタック

- **フロントエンド**: Nuxt.js 3 / Vue.js 3 / TypeScript
- **バックエンド**: Hono.js / Node.js
- **データベース**: SQLite / Prisma ORM
- **スタイリング**: CSS
- **インフラ**: Docker / AWS ECS
- **CI/CD**: GitHub Actions

## 🚀 開発環境構築

### 前提条件

以下のソフトウェアがインストールされている必要があります：

- **Node.js**: v18.0.0 以上
- **Yarn**: v1.22.0 以上（推奨パッケージマネージャー）
- **Git**: 最新版

#### Node.js & Yarn のインストール

```bash
# Node.js のバージョン確認
node --version

# Yarn のインストール（npm経由）
npm install -g yarn

# Yarn のバージョン確認
yarn --version
```

### 📦 プロジェクトセットアップ

#### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/ice-breakun.git
cd ice-breakun
```

#### 2. 依存関係のインストール

```bash
# パッケージのインストール
yarn install

# Prisma クライアントの生成
yarn prisma generate
```

#### 3. データベースのセットアップ

```bash
# データベースマイグレーションの実行
yarn prisma migrate dev --name init

# データベースのシード（オプション）
yarn prisma db seed
```

#### 4. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下の設定を追加：

```env
# データベース
DATABASE_URL="file:./data/ice_breakun.db"

# アプリケーション設定
NODE_ENV=development
NUXT_HOST=localhost
NUXT_PORT=3000

# バックエンド設定
BACKEND_PORT=3001
```

### 🎯 アプリケーション起動

#### 🐳 Docker環境での起動（推奨・最も簡単）

**たった1コマンドで開発環境が完成！**

```bash
# Docker環境でアプリケーション全体を起動
docker-compose up --build
```

以下が自動的に起動・設定されます：
- ✅ データベースの初期化
- ✅ フロントエンドサーバー
- ✅ バックエンドAPI サーバー

起動後のアクセス：
- **フロントエンド**: http://localhost:3000
- **バックエンド**: http://localhost:3001

#### Docker環境の停止

```bash
# Docker環境の停止
docker-compose down

# ボリュームも含めて完全に削除
docker-compose down -v
```

#### ローカル開発環境（手動セットアップ）

個別にサービスを起動したい場合：

1. **バックエンドサーバーの起動**

```bash
# 別のターミナルでバックエンドを起動
yarn server:dev
```

バックエンドが起動したら：http://localhost:3001

2. **フロントエンドサーバーの起動**

```bash
# メインターミナルでフロントエンドを起動
yarn dev
```

フロントエンドが起動したら：http://localhost:3000

### 🛠️ 開発用コマンド

#### 基本コマンド

```bash
# フロントエンド開発サーバー起動
yarn dev

# バックエンド開発サーバー起動（ホットリロード）
yarn server:dev

# 本番ビルド
yarn build

# 本番サーバー起動
yarn server:build

# プレビュー（本番ビルド後）
yarn preview
```

#### データベース関連

```bash
# Prisma Studio（データベース管理画面）
yarn prisma studio

# データベースリセット
yarn prisma migrate reset

# 新しいマイグレーション作成
yarn prisma migrate dev --name <migration_name>

# Prisma スキーマから型定義を生成
yarn prisma generate
```

#### テスト

```bash
# テスト実行
yarn test

# テスト（ウォッチモード）
yarn test:watch

# カバレッジ付きテスト
yarn test:coverage
```

#### コード品質

```bash
# ESLint実行
yarn lint

# ESLint自動修正
yarn lint:fix

# 型チェック
yarn type-check
```

### 🔧 トラブルシューティング

#### よくある問題と解決方法

**1. ポート競合エラー**
```bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :3002

# プロセスを終了
kill -9 <PID>
```

**2. Prisma関連エラー**
```bash
# Prismaクライアント再生成
yarn prisma generate

# データベースリセット
yarn prisma migrate reset
```

**3. Node modules関連エラー**
```bash
# node_modulesを削除して再インストール
rm -rf node_modules yarn.lock
yarn install
```

**4. Docker関連エラー**
```bash
# Docker環境の完全リセット
docker-compose down -v
docker system prune -a

# 再ビルド
docker-compose up --build
```