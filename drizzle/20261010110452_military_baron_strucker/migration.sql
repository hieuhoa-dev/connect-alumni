CREATE TYPE "news_category" AS ENUM('announcement', 'connect', 'share', 'cooperation', 'success');--> statement-breakpoint
CREATE TYPE "news_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"content" text NOT NULL,
	"cover_image_url" text,
	"category" "news_category" DEFAULT 'announcement'::"news_category" NOT NULL,
	"status" "news_status" DEFAULT 'draft'::"news_status" NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "news_articles_status_publishedAt_idx" ON "news_articles" ("status","published_at");--> statement-breakpoint
CREATE INDEX "news_articles_category_idx" ON "news_articles" ("category");--> statement-breakpoint
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_author_id_user_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE;