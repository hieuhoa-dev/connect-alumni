import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Applying migration to database...');
  const migrationFolder = path.join(__dirname, '../drizzle/20260927061400_absurd_wild_child');
  const sqlFile = path.join(migrationFolder, 'migration.sql');
  const content = fs.readFileSync(sqlFile, 'utf8');

  const statements = content
    .split('--> statement-breakpoint')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Found ${statements.length} SQL statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      await db.execute(sql.raw(statement));
      console.log(`[${i + 1}/${statements.length}] Executed successfully.`);
    } catch (err: any) {
      const errMsg = err?.cause?.message || err?.message || '';
      if (errMsg.includes('already exists')) {
        console.log(`[${i + 1}/${statements.length}] Already exists, skipping: ${errMsg.slice(0, 80)}`);
      } else {
        console.error(`Error on statement ${i + 1}:`, statement);
        throw err;
      }
    }
  }

  console.log('✅ All migrations applied successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
