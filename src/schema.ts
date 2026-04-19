import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const items = sqliteTable('items', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  name:      text('name').notNull(),
  price:     integer('price').notNull(),
  createdAt: text('created_at')
               .$defaultFn(() => new Date().toISOString()),
})

export type Item    = typeof items.$inferSelect
export type NewItem = typeof items.$inferInsert
