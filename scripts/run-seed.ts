import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPgPool } from "./pgConnect.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seedsDir = join(root, "supabase/seeds");
const manifestPath = join(seedsDir, "manifest.json");

type SeedManifestEntry = {
  id: string;
  file: string;
  environments: string[];
  description: string;
  records: Array<Record<string, string>>;
};

type SeedManifest = {
  version: number;
  seeds: SeedManifestEntry[];
};

const environment = process.env.SEED_ENV ?? "development";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as SeedManifest;
const pool = createPgPool(connectionString);

const eligible = manifest.seeds.filter((seed) => seed.environments.includes(environment));

if (eligible.length === 0) {
  console.error(`No seeds defined for SEED_ENV="${environment}" in manifest.`);
  process.exit(1);
}

console.log(`Applying seeds (SEED_ENV=${environment}, manifest v${manifest.version})…`);

for (const seed of eligible) {
  const already = await pool.query<{ seed_id: string }>(
    `SELECT seed_id FROM applied_seeds WHERE seed_id = $1 AND environment = $2`,
    [seed.id, environment],
  );

  if (already.rowCount && already.rowCount > 0) {
    console.log(`  skip ${seed.id} — already applied (${environment})`);
    continue;
  }

  const sqlPath = join(seedsDir, seed.file);
  const sql = readFileSync(sqlPath, "utf8");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query(
      `INSERT INTO applied_seeds (seed_id, environment, description)
       VALUES ($1, $2, $3)`,
      [seed.id, environment, seed.description],
    );
    await client.query("COMMIT");
    console.log(`  applied ${seed.id} — ${seed.description}`);
    for (const record of seed.records) {
      console.log(`    → ${record.table}: ${record.email ?? record.name ?? record.id}`);
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`  failed ${seed.id}`);
    throw error;
  } finally {
    client.release();
  }
}

await pool.end();
console.log("Seed protocol complete.");
