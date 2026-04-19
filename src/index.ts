import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { items } from './schema'

type Bindings = { DB: D1Database; API_KEY: string }

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', logger())
app.use('*', prettyJSON())
app.use('/api/*', cors({ allowMethods: ['GET', 'POST', 'PUT', 'DELETE'] }))

app.get('/api/items', async (c) => {
  const db = drizzle(c.env.DB)
  const list = await db.select().from(items)
  return c.json(list)
})

app.get('/api/items/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = Number(c.req.param('id'))
  const rows = await db.select().from(items).where(eq(items.id, id))
  if (!rows.length) return c.json({ error: 'Not found' }, 404)
  return c.json(rows[0])
})

const schema = z.object({
  name:  z.string().min(1),
  price: z.number().int().positive(),
})

app.post('/api/items', zValidator('json', schema), async (c) => {
  const db = drizzle(c.env.DB)
  const rows = await db.insert(items).values(c.req.valid('json')).returning()
  return c.json(rows[0], 201)
})

app.put('/api/items/:id', zValidator('json', schema.partial()), async (c) => {
  const db = drizzle(c.env.DB)
  const id = Number(c.req.param('id'))
  const rows = await db.update(items)
    .set(c.req.valid('json'))
    .where(eq(items.id, id))
    .returning()
  if (!rows.length) return c.json({ error: 'Not found' }, 404)
  return c.json(rows[0])
})

app.delete('/api/items/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = Number(c.req.param('id'))
  await db.delete(items).where(eq(items.id, id))
  return c.body(null, 204)
})

app.onError((err, c) =>
  c.json({ error: 'Internal Server Error', message: err.message }, 500))
app.notFound((c) =>
  c.json({ error: `Route ${c.req.path} not found` }, 404))

export default app