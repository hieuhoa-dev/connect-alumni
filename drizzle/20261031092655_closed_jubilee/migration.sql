CREATE TYPE "album_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "hero_slide_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "photo_status" AS ENUM('published', 'removed');--> statement-breakpoint
CREATE TYPE "takedown_status" AS ENUM('open', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "uploaded_file_status" AS ENUM('pending', 'ready', 'removed');--> statement-breakpoint
CREATE TABLE "album_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"album_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"caption" text,
	"taken_at" timestamp with time zone,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "photo_status" DEFAULT 'published'::"photo_status" NOT NULL,
	"removed_reason" text,
	"removed_by" text,
	"uploaded_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_albums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"event_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"cover_photo_id" uuid,
	"status" "album_status" DEFAULT 'draft'::"album_status" NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hero_slides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"status" "hero_slide_status" DEFAULT 'draft'::"hero_slide_status" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"badge" text,
	"title" text,
	"highlight_text" text,
	"description" text,
	"primary_label" text,
	"primary_href" text,
	"secondary_label" text,
	"secondary_href" text,
	"link_href" text,
	"image_file_id" uuid NOT NULL,
	"image_mobile_file_id" uuid,
	"image_alt" text NOT NULL,
	"overlay_enabled" boolean DEFAULT true NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"seed_key" text UNIQUE,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photo_takedown_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"photo_id" uuid NOT NULL,
	"requester_user_id" text,
	"requester_name" text NOT NULL,
	"requester_contact" text NOT NULL,
	"reason" text NOT NULL,
	"status" "takedown_status" DEFAULT 'open'::"takedown_status" NOT NULL,
	"handler_note" text,
	"handled_by" text,
	"handled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY DEFAULT 'default',
	"contact_phone" text,
	"contact_email" text,
	"website_url" text,
	"address" text,
	"map_url" text,
	"facebook_url" text,
	"youtube_url" text,
	"zalo_url" text,
	"unit_founded_year" integer DEFAULT 1976 NOT NULL,
	"ai_survey_summary_enabled" boolean DEFAULT false NOT NULL,
	"ai_writing_assistant_enabled" boolean DEFAULT false NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "logo_file_id" uuid;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "is_featured_partner" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "cover_file_id" uuid;--> statement-breakpoint
ALTER TABLE "experience_posts" ADD COLUMN "cover_file_id" uuid;--> statement-breakpoint
ALTER TABLE "form_answers" ADD COLUMN "file_id" uuid;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "avatar_file_id" uuid;--> statement-breakpoint
ALTER TABLE "uploaded_files" ADD COLUMN "purpose" text;--> statement-breakpoint
ALTER TABLE "uploaded_files" ADD COLUMN "status" "uploaded_file_status" DEFAULT 'pending'::"uploaded_file_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "uploaded_files" ADD COLUMN "visibility" text DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "uploaded_files" ADD COLUMN "width" integer;--> statement-breakpoint
ALTER TABLE "uploaded_files" ADD COLUMN "height" integer;--> statement-breakpoint
ALTER TABLE "uploaded_files" ADD COLUMN "variants" jsonb;--> statement-breakpoint
ALTER TABLE "uploaded_files" ALTER COLUMN "related_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "uploaded_files" ALTER COLUMN "related_id" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "album_photos_album_status_sort_idx" ON "album_photos" ("album_id","status","sort_order");--> statement-breakpoint
CREATE INDEX "event_albums_status_idx" ON "event_albums" ("status");--> statement-breakpoint
CREATE INDEX "event_albums_eventId_idx" ON "event_albums" ("event_id");--> statement-breakpoint
CREATE INDEX "hero_slides_status_sortOrder_idx" ON "hero_slides" ("status","sort_order");--> statement-breakpoint
CREATE INDEX "photo_takedown_requests_status_idx" ON "photo_takedown_requests" ("status");--> statement-breakpoint
CREATE INDEX "photo_takedown_requests_photoId_idx" ON "photo_takedown_requests" ("photo_id");--> statement-breakpoint
CREATE INDEX "uploaded_files_purpose_status_idx" ON "uploaded_files" ("purpose","status");--> statement-breakpoint
ALTER TABLE "album_photos" ADD CONSTRAINT "album_photos_album_id_event_albums_id_fkey" FOREIGN KEY ("album_id") REFERENCES "event_albums"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "album_photos" ADD CONSTRAINT "album_photos_file_id_uploaded_files_id_fkey" FOREIGN KEY ("file_id") REFERENCES "uploaded_files"("id");--> statement-breakpoint
ALTER TABLE "album_photos" ADD CONSTRAINT "album_photos_removed_by_user_id_fkey" FOREIGN KEY ("removed_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "album_photos" ADD CONSTRAINT "album_photos_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_logo_file_id_uploaded_files_id_fkey" FOREIGN KEY ("logo_file_id") REFERENCES "uploaded_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "event_albums" ADD CONSTRAINT "event_albums_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "event_albums" ADD CONSTRAINT "event_albums_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_cover_file_id_uploaded_files_id_fkey" FOREIGN KEY ("cover_file_id") REFERENCES "uploaded_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "experience_posts" ADD CONSTRAINT "experience_posts_cover_file_id_uploaded_files_id_fkey" FOREIGN KEY ("cover_file_id") REFERENCES "uploaded_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "form_answers" ADD CONSTRAINT "form_answers_file_id_uploaded_files_id_fkey" FOREIGN KEY ("file_id") REFERENCES "uploaded_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_image_file_id_uploaded_files_id_fkey" FOREIGN KEY ("image_file_id") REFERENCES "uploaded_files"("id");--> statement-breakpoint
ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_image_mobile_file_id_uploaded_files_id_fkey" FOREIGN KEY ("image_mobile_file_id") REFERENCES "uploaded_files"("id");--> statement-breakpoint
ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_updated_by_user_id_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "photo_takedown_requests" ADD CONSTRAINT "photo_takedown_requests_photo_id_album_photos_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "album_photos"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "photo_takedown_requests" ADD CONSTRAINT "photo_takedown_requests_requester_user_id_user_id_fkey" FOREIGN KEY ("requester_user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "photo_takedown_requests" ADD CONSTRAINT "photo_takedown_requests_handled_by_user_id_fkey" FOREIGN KEY ("handled_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatar_file_id_uploaded_files_id_fkey" FOREIGN KEY ("avatar_file_id") REFERENCES "uploaded_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_updated_by_user_id_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id");