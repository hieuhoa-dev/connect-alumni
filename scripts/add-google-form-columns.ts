import "dotenv/config";
import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Đang bổ sung các cột Google Form vào bảng forms trong CSDL...");

  await db.execute(sql`
    ALTER TABLE "forms" 
    ADD COLUMN IF NOT EXISTS "is_google_form" boolean DEFAULT false NOT NULL,
    ADD COLUMN IF NOT EXISTS "google_form_url" text,
    ADD COLUMN IF NOT EXISTS "google_form_id" text,
    ADD COLUMN IF NOT EXISTS "google_edit_url" text,
    ADD COLUMN IF NOT EXISTS "webhook_secret" text;
  `);

  console.log("✓ Đã thêm thành công các cột Google Form vào bảng forms!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Lỗi khi thêm cột:", err);
  process.exit(1);
});
