CREATE TABLE IF NOT EXISTS "hackathon_projects" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);