DO $$ BEGIN
 CREATE TYPE "public"."app_role" AS ENUM('employee', 'manager', 'hr');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY NOT NULL,
  "clerk_user_id" text NOT NULL,
  "email" text NOT NULL,
  "full_name" text,
  "role" "app_role" DEFAULT 'employee' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id"),
  CONSTRAINT "users_email_unique" UNIQUE("email")
);
