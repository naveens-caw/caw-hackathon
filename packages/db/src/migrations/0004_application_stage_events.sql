CREATE TABLE IF NOT EXISTS "application_stage_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "application_id" integer NOT NULL,
  "from_stage" "application_stage" NOT NULL,
  "to_stage" "application_stage" NOT NULL,
  "changed_by_user_id" text NOT NULL,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "application_stage_events" ADD CONSTRAINT "application_stage_events_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "application_stage_events" ADD CONSTRAINT "application_stage_events_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stage_events_application" ON "application_stage_events" USING btree ("application_id","created_at" DESC);
