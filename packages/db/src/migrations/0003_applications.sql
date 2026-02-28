DO $$ BEGIN
 CREATE TYPE "public"."application_stage" AS ENUM('applied', 'screening', 'interview', 'decision');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."decision_status" AS ENUM('pending', 'accepted', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "applications" (
  "id" serial PRIMARY KEY NOT NULL,
  "job_id" integer NOT NULL,
  "applicant_user_id" text NOT NULL,
  "resume_url" text,
  "cover_letter" text,
  "stage" "application_stage" DEFAULT 'applied' NOT NULL,
  "decision" "decision_status" DEFAULT 'pending' NOT NULL,
  "applied_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "uq_applications_job_applicant" UNIQUE("job_id","applicant_user_id"),
  CONSTRAINT "chk_applications_decision_consistency" CHECK ((stage = 'decision') OR (decision = 'pending'))
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "applications" ADD CONSTRAINT "applications_applicant_user_id_users_id_fk" FOREIGN KEY ("applicant_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_applications_job" ON "applications" USING btree ("job_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_applications_applicant" ON "applications" USING btree ("applicant_user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_applications_stage" ON "applications" USING btree ("stage");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_applications_job_stage" ON "applications" USING btree ("job_id","stage");
