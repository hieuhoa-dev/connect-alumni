import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { sql } from "drizzle-orm";
import { db } from "../src/db";

/**
 * Áp dụng TẤT CẢ migration trong thư mục drizzle/ theo thứ tự tên thư mục
 * (tên bắt đầu bằng mốc thời gian nên sắp xếp theo chữ cái là đúng thứ tự).
 * Câu lệnh nào báo "already exists" sẽ được bỏ qua, nên chạy lại nhiều lần vẫn an toàn.
 */
const main = async () => {
  const root = path.join(__dirname, "../drizzle");
  const folders = fs
    .readdirSync(root, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        fs.existsSync(path.join(root, entry.name, "migration.sql")),
    )
    .map((entry) => entry.name)
    .sort();

  console.log(`Tìm thấy ${folders.length} migration.`);

  for (const folder of folders) {
    console.log(`\n== ${folder}`);
    const content = fs.readFileSync(
      path.join(root, folder, "migration.sql"),
      "utf8",
    );

    const statements = content
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await db.execute(sql.raw(statement));
        console.log(`[${i + 1}/${statements.length}] OK`);
      } catch (err) {
        const error = err as { cause?: { message?: string }; message?: string };
        const errMsg = error?.cause?.message || error?.message || "";
        if (errMsg.includes("already exists")) {
          console.log(
            `[${i + 1}/${statements.length}] Đã tồn tại, bỏ qua: ${errMsg.slice(0, 80)}`,
          );
        } else {
          console.error(`Lỗi ở câu lệnh ${i + 1}:`, statement);
          throw err;
        }
      }
    }
  }

  console.log("\nĐã áp dụng xong tất cả migration.");
  process.exit(0);
};

main().catch((err) => {
  console.error("Migration thất bại:", err);
  process.exit(1);
});
