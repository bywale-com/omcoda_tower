import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPgPool } from "./pgConnect.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(root, "supabase/migrations");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const pool = createPgPool(connectionString);
const files = readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

try {
  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    await pool.query(sql);
    console.log(`Applied ${file}`);
  }
} catch (error) {
  const err = error as NodeJS.ErrnoException;
  if (err.code === "EACCES" && connectionString.includes("db.") && connectionString.includes(".supabase.co:5432")) {
    console.error(
      "\nCould not connect via Supabase direct host (IPv6). On Windows / IPv4-only networks,\n" +
        "replace DATABASE_URL with the **Session pooler** string from:\n" +
        "  Supabase Dashboard → Project Settings → Database → Connection string → Session mode\n" +
        "Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres\n" +
        "URL-encode special characters in the password ($ → %24).\n",
    );
  }
  throw error;
} finally {
  await pool.end();
}

console.log(`Migrations complete (${files.length} file(s)).`);
