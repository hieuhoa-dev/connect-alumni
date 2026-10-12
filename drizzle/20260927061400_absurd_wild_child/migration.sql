CREATE TYPE "account_status" AS ENUM('active', 'locked');--> statement-breakpoint
CREATE TYPE "application_status" AS ENUM('pending', 'reviewing', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "attendance_status" AS ENUM('registered', 'attended', 'absent');--> statement-breakpoint
CREATE TYPE "campaign_status" AS ENUM('draft', 'open', 'closed');--> statement-breakpoint
CREATE TYPE "event_format" AS ENUM('online', 'offline');--> statement-breakpoint
CREATE TYPE "event_status" AS ENUM('draft', 'published', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "event_type" AS ENUM('talkshow', 'workshop', 'job_fair', 'other');--> statement-breakpoint
CREATE TYPE "form_status" AS ENUM('draft', 'open', 'closed');--> statement-breakpoint
CREATE TYPE "form_target_role" AS ENUM('student', 'alumni', 'all');--> statement-breakpoint
CREATE TYPE "form_type" AS ENUM('survey', 'scholarship_application', 'event_feedback', 'other');--> statement-breakpoint
CREATE TYPE "invitation_status" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
CREATE TYPE "job_status" AS ENUM('pending', 'approved', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "job_type" AS ENUM('full_time', 'part_time', 'internship');--> statement-breakpoint
CREATE TYPE "pledge_status" AS ENUM('pledged', 'fulfilled', 'cancelled');--> statement-breakpoint
CREATE TYPE "post_status" AS ENUM('draft', 'pending', 'published', 'rejected');--> statement-breakpoint
CREATE TYPE "question_type" AS ENUM('short_text', 'long_text', 'single_choice', 'multi_choice', 'scale', 'file_upload');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('student', 'alumni', 'employer', 'faculty_staff', 'admin');--> statement-breakpoint
CREATE TYPE "verification_status" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"description" text NOT NULL,
	"logo_url" text,
	"website" text,
	"industry" text NOT NULL,
	"verification_status" "verification_status" DEFAULT 'pending'::"verification_status" NOT NULL,
	"rejected_reason" text,
	"created_by" text NOT NULL,
	"verified_by" text,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"company_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role_in_company" text NOT NULL,
	"is_active_context" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donation_pledges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"campaign_id" uuid NOT NULL,
	"donor_id" text,
	"donor_display_name" text NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"amount" numeric(14,2) NOT NULL,
	"status" "pledge_status" DEFAULT 'pledged'::"pledge_status" NOT NULL,
	"note" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"event_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"attendance_status" "attendance_status" DEFAULT 'registered'::"attendance_status" NOT NULL,
	"registered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_speakers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"event_id" uuid NOT NULL,
	"alumni_user_id" text NOT NULL,
	"invitation_status" "invitation_status" DEFAULT 'pending'::"invitation_status" NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"type" "event_type" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"format" "event_format" NOT NULL,
	"location_or_link" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"capacity" integer,
	"status" "event_status" DEFAULT 'draft'::"event_status" NOT NULL,
	"cover_image_url" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"cover_image_url" text,
	"tags" jsonb DEFAULT '[]' NOT NULL,
	"status" "post_status" DEFAULT 'draft'::"post_status" NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"response_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"answer_value" jsonb,
	"file_url" text
);
--> statement-breakpoint
CREATE TABLE "form_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"form_id" uuid NOT NULL,
	"order_index" integer NOT NULL,
	"question_type" "question_type" NOT NULL,
	"label" text NOT NULL,
	"options" jsonb,
	"is_required" boolean DEFAULT true NOT NULL,
	"config" jsonb
);
--> statement-breakpoint
CREATE TABLE "form_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"form_id" uuid NOT NULL,
	"respondent_id" text NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"type" "form_type" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"target_batches" integer[],
	"target_role" "form_target_role" DEFAULT 'all'::"form_target_role" NOT NULL,
	"deadline" timestamp,
	"status" "form_status" DEFAULT 'draft'::"form_status" NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"company_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"requirements" text NOT NULL,
	"location" text NOT NULL,
	"job_type" "job_type" NOT NULL,
	"salary_range" text,
	"apply_url_or_email" text NOT NULL,
	"status" "job_status" DEFAULT 'pending'::"job_status" NOT NULL,
	"rejected_reason" text,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"link_url" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL UNIQUE,
	"role" "user_role" DEFAULT 'student'::"user_role" NOT NULL,
	"full_name" text NOT NULL,
	"student_code" text,
	"faculty" text,
	"batch_year" integer,
	"graduation_year" integer,
	"phone" text,
	"avatar_url" text,
	"bio" text,
	"status" "account_status" DEFAULT 'active'::"account_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scholarship_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"campaign_id" uuid NOT NULL,
	"student_id" text NOT NULL,
	"form_response_id" uuid,
	"status" "application_status" DEFAULT 'pending'::"application_status" NOT NULL,
	"score" numeric(5,2),
	"reviewed_by" text,
	"review_note" text,
	"decided_at" timestamp,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scholarship_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text NOT NULL,
	"description" text NOT NULL,
	"target_amount" numeric(14,2) NOT NULL,
	"current_amount" numeric(14,2) DEFAULT '0' NOT NULL,
	"application_form_id" uuid,
	"application_deadline" timestamp NOT NULL,
	"status" "campaign_status" DEFAULT 'draft'::"campaign_status" NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "uploaded_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"owner_id" text NOT NULL,
	"related_type" text NOT NULL,
	"related_id" text NOT NULL,
	"file_key" text NOT NULL,
	"file_url" text,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs" ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_entityType_idx" ON "audit_logs" ("entity_type");--> statement-breakpoint
CREATE INDEX "companies_verificationStatus_idx" ON "companies" ("verification_status");--> statement-breakpoint
CREATE UNIQUE INDEX "company_members_company_user_unique" ON "company_members" ("company_id","user_id");--> statement-breakpoint
CREATE INDEX "company_members_userId_idx" ON "company_members" ("user_id");--> statement-breakpoint
CREATE INDEX "donation_pledges_campaignId_idx" ON "donation_pledges" ("campaign_id");--> statement-breakpoint
CREATE INDEX "donation_pledges_donorId_idx" ON "donation_pledges" ("donor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_registrations_event_user_unique" ON "event_registrations" ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "event_registrations_userId_idx" ON "event_registrations" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_speakers_event_alumni_unique" ON "event_speakers" ("event_id","alumni_user_id");--> statement-breakpoint
CREATE INDEX "event_speakers_alumniUserId_idx" ON "event_speakers" ("alumni_user_id");--> statement-breakpoint
CREATE INDEX "events_status_idx" ON "events" ("status");--> statement-breakpoint
CREATE INDEX "events_startTime_idx" ON "events" ("start_time");--> statement-breakpoint
CREATE INDEX "experience_posts_status_idx" ON "experience_posts" ("status");--> statement-breakpoint
CREATE INDEX "experience_posts_authorId_idx" ON "experience_posts" ("author_id");--> statement-breakpoint
CREATE INDEX "form_answers_responseId_idx" ON "form_answers" ("response_id");--> statement-breakpoint
CREATE INDEX "form_questions_formId_idx" ON "form_questions" ("form_id");--> statement-breakpoint
CREATE INDEX "form_responses_formId_idx" ON "form_responses" ("form_id");--> statement-breakpoint
CREATE INDEX "form_responses_respondentId_idx" ON "form_responses" ("respondent_id");--> statement-breakpoint
CREATE INDEX "forms_status_idx" ON "forms" ("status");--> statement-breakpoint
CREATE INDEX "job_posts_status_idx" ON "job_posts" ("status");--> statement-breakpoint
CREATE INDEX "job_posts_expiresAt_idx" ON "job_posts" ("expires_at");--> statement-breakpoint
CREATE INDEX "job_posts_companyId_idx" ON "job_posts" ("company_id");--> statement-breakpoint
CREATE INDEX "notifications_userId_idx" ON "notifications" ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_isRead_idx" ON "notifications" ("is_read");--> statement-breakpoint
CREATE INDEX "profiles_role_idx" ON "profiles" ("role");--> statement-breakpoint
CREATE INDEX "profiles_batchYear_idx" ON "profiles" ("batch_year");--> statement-breakpoint
CREATE INDEX "scholarship_applications_campaignId_idx" ON "scholarship_applications" ("campaign_id");--> statement-breakpoint
CREATE INDEX "scholarship_applications_studentId_idx" ON "scholarship_applications" ("student_id");--> statement-breakpoint
CREATE INDEX "scholarship_campaigns_status_idx" ON "scholarship_campaigns" ("status");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "uploaded_files_ownerId_idx" ON "uploaded_files" ("owner_id");--> statement-breakpoint
CREATE INDEX "uploaded_files_related_idx" ON "uploaded_files" ("related_type","related_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_user_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_verified_by_user_id_fkey" FOREIGN KEY ("verified_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_company_id_companies_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "donation_pledges" ADD CONSTRAINT "donation_pledges_campaign_id_scholarship_campaigns_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "scholarship_campaigns"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "donation_pledges" ADD CONSTRAINT "donation_pledges_donor_id_user_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "donation_pledges" ADD CONSTRAINT "donation_pledges_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_alumni_user_id_user_id_fkey" FOREIGN KEY ("alumni_user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "experience_posts" ADD CONSTRAINT "experience_posts_author_id_user_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "form_answers" ADD CONSTRAINT "form_answers_response_id_form_responses_id_fkey" FOREIGN KEY ("response_id") REFERENCES "form_responses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "form_answers" ADD CONSTRAINT "form_answers_question_id_form_questions_id_fkey" FOREIGN KEY ("question_id") REFERENCES "form_questions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "form_questions" ADD CONSTRAINT "form_questions_form_id_forms_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_form_id_forms_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_respondent_id_user_id_fkey" FOREIGN KEY ("respondent_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "job_posts" ADD CONSTRAINT "job_posts_company_id_companies_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "job_posts" ADD CONSTRAINT "job_posts_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "scholarship_applications" ADD CONSTRAINT "scholarship_applications_5N3D6IWV7TFO_fkey" FOREIGN KEY ("campaign_id") REFERENCES "scholarship_campaigns"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "scholarship_applications" ADD CONSTRAINT "scholarship_applications_student_id_user_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "scholarship_applications" ADD CONSTRAINT "scholarship_applications_YTtiDGz4ZyUN_fkey" FOREIGN KEY ("form_response_id") REFERENCES "form_responses"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "scholarship_applications" ADD CONSTRAINT "scholarship_applications_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "scholarship_campaigns" ADD CONSTRAINT "scholarship_campaigns_application_form_id_forms_id_fkey" FOREIGN KEY ("application_form_id") REFERENCES "forms"("id");--> statement-breakpoint
ALTER TABLE "scholarship_campaigns" ADD CONSTRAINT "scholarship_campaigns_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "uploaded_files" ADD CONSTRAINT "uploaded_files_owner_id_user_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id");