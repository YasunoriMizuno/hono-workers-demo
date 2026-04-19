# Hono + Cloudflare Workers デモ

## セットアップ

```bash
cd hono-workers-demo
npm install
```

## 開発サーバー起動

```bash
npm run dev
# → http://localhost:8787
```

## デプロイ

```bash
# Cloudflare アカウントにログイン (初回のみ)
npx wrangler login

# デプロイ
npm run deploy
```

---

## エンドポイント一覧

| メソッド | パス | 説明 |
|--------|------|------|
| GET | `/` | ヘルスチェック |
| GET | `/api/items` | アイテム一覧 |
| GET | `/api/items/:id` | アイテム取得 |
| POST | `/api/items` | アイテム作成 |
| PUT | `/api/items/:id` | アイテム更新 |
| DELETE | `/api/items/:id` | アイテム削除 |
| GET | `/auth/me` | 認証済みユーザー情報 |

## 動作確認 (curl)

```bash
# 一覧取得
curl http://localhost:8787/api/items?pretty

# 新規作成
curl -X POST http://localhost:8787/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "抹茶ラテ", "price": 600}'

# 認証エンドポイント
curl http://localhost:8787/auth/me \
  -H "Authorization: Bearer dev-secret"
```

## プロジェクト構造

```
hono-workers-demo/
├── src/
│   └── index.ts       # メインアプリ
├── wrangler.toml      # Cloudflare Workers 設定
├── package.json
└── tsconfig.json
```
