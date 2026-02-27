import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const hackathonProjects = pgTable('hackathon_projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});