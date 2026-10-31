import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function checkDuplicateStudentCodes() {
  try {
    const res = await db.execute(sql`
      SELECT student_code, count(*) as cnt
      FROM profiles
      WHERE student_code IS NOT NULL
      GROUP BY student_code
      HAVING count(*) > 1
    `);

    if (res.rows && res.rows.length > 0) {
      console.warn("\n⚠️ [BÁO CÁO KIỂM TRA TRÙNG LẶP MSSV TRƯỚC KHI TẠO UNIQUE INDEX]");
      for (const row of res.rows as Array<{ student_code: string; cnt: string | number }>) {
        console.warn(`   - MSSV: "${row.student_code}" đang xuất hiện ${row.cnt} lần trong bảng profiles.`);
      }
      console.warn("   => Báo cáo: Vui lòng đối soát dữ liệu sinh viên/cựu sinh viên trước khi áp dụng ràng buộc duy nhất.\n");
    } else {
      console.log("✓ Kiểm tra tính toàn vẹn: Không phát hiện trùng lặp mã số sinh viên.");
    }
  } catch {
    // profiles table might not exist on a completely blank database
  }
}

async function main() {
  console.log("🚀 Bắt đầu quá trình áp dụng migration cho CSDL...");

  await checkDuplicateStudentCodes();

  const drizzleDir = path.join(__dirname, "../drizzle");
  const entries = fs
    .readdirSync(drizzleDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  console.log(`Tìm thấy ${entries.length} thư mục migration:`, entries);

  for (const entry of entries) {
    const sqlFile = path.join(drizzleDir, entry, "migration.sql");
    if (!fs.existsSync(sqlFile)) continue;

    console.log(`\n📦 Đang xử lý migration: ${entry}...`);
    const content = fs.readFileSync(sqlFile, "utf8");
    const statements = content
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`   Tổng số ${statements.length} câu lệnh SQL.`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await db.execute(sql.raw(statement));
        if ((i + 1) % 20 === 0 || i + 1 === statements.length) {
          console.log(`   [${i + 1}/${statements.length}] câu lệnh đã xử lý thành công.`);
        }
      } catch (err: unknown) {
        const errMsg =
          (err as { cause?: { message?: string }; message?: string })?.cause
            ?.message ||
          (err as { message?: string })?.message ||
          "";

        if (
          errMsg.includes("already exists") ||
          errMsg.includes("duplicate") ||
          (errMsg.includes("column") && errMsg.includes("already"))
        ) {
          if ((i + 1) % 20 === 0 || i + 1 === statements.length) {
            console.log(`   [${i + 1}/${statements.length}] câu lệnh đã tồn tại (bỏ qua an toàn).`);
          }
        } else {
          console.error(`❌ Lỗi thực thi câu lệnh ${i + 1}/${statements.length} tại ${entry}:`);
          console.error(`   SQL: ${statement.slice(0, 100)}...`);
          console.error(`   Chi tiết lỗi: ${errMsg}`);
          throw err;
        }
      }
    }
    console.log(`✓ Hoàn thành migration ${entry}`);
  }

  // Double check after migration
  await checkDuplicateStudentCodes();

  console.log("\n✅ Toàn bộ migrations đã được áp dụng thành công!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
