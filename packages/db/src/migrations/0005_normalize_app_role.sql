UPDATE "users"
SET "role" = 'employee'
WHERE "role"::text NOT IN ('employee', 'manager', 'hr');
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
--> statement-breakpoint
CREATE TYPE "public"."app_role_new" AS ENUM('employee', 'manager', 'hr');
--> statement-breakpoint
ALTER TABLE "users"
ALTER COLUMN "role" TYPE "public"."app_role_new"
USING ("role"::text::"public"."app_role_new");
--> statement-breakpoint
DROP TYPE "public"."app_role";
--> statement-breakpoint
ALTER TYPE "public"."app_role_new" RENAME TO "app_role";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'employee';
