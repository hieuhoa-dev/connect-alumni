CREATE TYPE "connection_status" AS ENUM('pending', 'accepted', 'declined', 'blocked', 'cancelled');--> statement-breakpoint
CREATE TYPE "employment_status" AS ENUM('employed', 'self_employed', 'seeking', 'studying', 'other');--> statement-breakpoint
CREATE TYPE "profile_visibility" AS ENUM('public', 'members', 'private');--> statement-breakpoint
CREATE TABLE "alumni_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"requester_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"status" "connection_status" DEFAULT 'pending'::"connection_status" NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "profile_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"changed_by" text NOT NULL,
	"changes" jsonb NOT NULL,
	"source" text DEFAULT 'self' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"company_name" text NOT NULL,
	"company_id" uuid,
	"title" text NOT NULL,
	"industry" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"is_current" boolean DEFAULT false NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "experience_posts" ADD COLUMN "rejected_reason" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "major" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "province" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "employment_status" "employment_status";--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "current_title" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "current_company_name" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "current_company_id" uuid;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "industry" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "linkedin_url" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "github_url" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "website_url" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "skills" text[];--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "visibility" "profile_visibility" DEFAULT 'members'::"profile_visibility" NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "show_email" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "show_phone" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "alumni_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "alumni_verified_by" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "alumni_rejected_reason" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "last_confirmed_at" timestamp;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "email_notifications" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "scholarship_applications" ADD COLUMN "awarded_amount" numeric(14,2);--> statement-breakpoint
ALTER TABLE "scholarship_applications" ADD COLUMN "disbursed_at" timestamp;--> statement-breakpoint
ALTER TABLE "scholarship_campaigns" ADD COLUMN "slots" integer;--> statement-breakpoint
CREATE INDEX "alumni_connections_requester_idx" ON "alumni_connections" ("requester_id");--> statement-breakpoint
CREATE INDEX "alumni_connections_receiver_idx" ON "alumni_connections" ("receiver_id");--> statement-breakpoint
CREATE INDEX "alumni_connections_status_idx" ON "alumni_connections" ("status");--> statement-breakpoint
CREATE INDEX "profile_revisions_userId_idx" ON "profile_revisions" ("user_id");--> statement-breakpoint
CREATE INDEX "profiles_major_idx" ON "profiles" ("major");--> statement-breakpoint
CREATE INDEX "profiles_province_idx" ON "profiles" ("province");--> statement-breakpoint
CREATE INDEX "profiles_alumni_verified_idx" ON "profiles" ("alumni_verified_at");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_student_code_unique_idx" ON "profiles" ("student_code") WHERE student_code IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "scholarship_applications_campaign_student_unique" ON "scholarship_applications" ("campaign_id","student_id");--> statement-breakpoint
CREATE INDEX "work_experiences_userId_idx" ON "work_experiences" ("user_id");--> statement-breakpoint
CREATE INDEX "work_experiences_isCurrent_idx" ON "work_experiences" ("is_current");--> statement-breakpoint
ALTER TABLE "alumni_connections" ADD CONSTRAINT "alumni_connections_requester_id_user_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "alumni_connections" ADD CONSTRAINT "alumni_connections_receiver_id_user_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "profile_revisions" ADD CONSTRAINT "profile_revisions_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "profile_revisions" ADD CONSTRAINT "profile_revisions_changed_by_user_id_fkey" FOREIGN KEY ("changed_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_alumni_verified_by_user_id_fkey" FOREIGN KEY ("alumni_verified_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;