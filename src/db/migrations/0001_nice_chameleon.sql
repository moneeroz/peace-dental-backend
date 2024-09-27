ALTER TABLE "appointment" ALTER COLUMN "date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "invoice" ALTER COLUMN "date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "refresh_token" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "refresh_token" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;