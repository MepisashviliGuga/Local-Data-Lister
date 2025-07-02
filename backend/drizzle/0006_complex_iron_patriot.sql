ALTER TABLE "comment_votes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "comment_votes" CASCADE;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "submitted_by" integer;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "places" ADD CONSTRAINT "places_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;