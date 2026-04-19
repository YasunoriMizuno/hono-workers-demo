import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
  API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', logger())
app.use('*', prettyJSON())
app.use('/api/*', cors({
  origin: ['http://localhost:3000', 'https://your-frontend.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
}))

// GET /api/items — 一覧取得
app.get('/api/items', async (c) => {
  const { results } = await c.env.DB
    .prepare('SELECT * FROM items ORDER BY id')
    .all()
  return c.json(results)
})

// GET /api/items/:id — 1件取得
app.get('/api/items/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const item = await c.env.DB
    .prepare('SELECT * FROM items WHERE id = ?')
    .bind(id)
    .first()
  if (!item) return c.json({ error: 'Not found' }, 404)
  return c.json(item)
})

const createItemSchema = z.object({
  name:  z.string().min(1, '名前は必須です').max(50),
  price: z.number().int().positive('価格は正の整数で入力してください'),
})

// POST /api/items — 新規作成
app.post('/api/items', zValidator('json', createItemSchema), async (c) => {
  const { name, price } = c.req.valid('json')
  const result = await c.env.DB
    .prepare('INSERT INTO items (name, price) VALUES (?, ?)')
    .bind(name, price)
    .run()
  const newItem = await c.env.DB
    .prepare('SELECT * FROM items WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first()
  return c.json(newItem, 201)
})

// PUT /api/items/:id — 更新
app.put('/api/items/:id', zValidator('json', createItemSchema.partial()), async (c) => {
  const id = Number(c.req.param('id'))
  const updates = c.req.valid('json')
  const sets = Object.keys(updates).map(k => `${k} = ?`).join(', ')
  await c.env.DB
    .prepare(`UPDATE items SET ${sets} WHERE id = ?`)
    .bind(...Object.values(updates), id)
    .run()
  const item = await c.env.DB
    .prepare('SELECT * FROM items WHERE id = ?')
    .bind(id).first()
  if (!item) return c.json({ error: 'Not found' }, 404)
  return c.json(item)
})

// DELETE /api/items/:id — 削除
app.delete('/api/items/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await c.env.DB
    .prepare('DELETE FROM items WHERE id = ?')
    .bind(id)
    .run()
  return c.body(null, 204)
})

app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal Server Error', message: err.message }, 500)
})

app.notFound((c) => {
  return c.json({ error: `Route ${c.req.path} not found` }, 404)
})

export default app