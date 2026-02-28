DROP TABLE IF EXISTS "hackathon_projects";
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."employment_type" AS ENUM('full_time', 'part_time', 'contract', 'internship');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."job_status" AS ENUM('draft', 'open', 'closed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jobs" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "department" text NOT NULL,
  "location" text,
  "employment_type" "employment_type" NOT NULL,
  "status" "job_status" DEFAULT 'draft' NOT NULL,
  "posted_by_user_id" text NOT NULL,
  "hiring_manager_user_id" text NOT NULL,
  "opened_at" timestamp with time zone,
  "closed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_posted_by_user_id_users_id_fk" FOREIGN KEY ("posted_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_hiring_manager_user_id_users_id_fk" FOREIGN KEY ("hiring_manager_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_jobs_status" ON "jobs" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_jobs_hiring_manager" ON "jobs" USING btree ("hiring_manager_user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_jobs_department" ON "jobs" USING btree ("department");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_jobs_created_at" ON "jobs" USING btree ("created_at" DESC);
