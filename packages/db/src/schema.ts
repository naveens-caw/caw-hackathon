import { pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const appRoleEnum = pgEnum('app_role', ['unassigned', 'employee', 'manager', 'hr']);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  role: appRoleEnum('role').notNull().default('unassigned'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const hackathonProjects = pgTable('hackathon_projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
