import { createPgPool } from "./pgConnect.ts";

const p = createPgPool(process.env.DATABASE_URL as string);
try {
  const r = await p.query(
    `SELECT id, key, version, payload
     FROM reference_versions
     WHERE key = 'reference.immigration'
     ORDER BY version DESC
     LIMIT 5`,
  );
  for (const row of r.rows) {
    const payload = row.payload as { rows?: unknown[] } | null;
    const rows = payload?.rows;
    console.log(
      JSON.stringify(
        {
          id: row.id,
          version: row.version,
          rowCount: Array.isArray(rows) ? rows.length : null,
          sampleKeys: Array.isArray(rows)
            ? rows.slice(0, 8).map((x) => (x as { key?: string }).key)
            : Object.keys((payload as object) ?? {}),
        },
        null,
        2,
      ),
    );
  }
  const industries = await p.query(
    `SELECT key, count(*)::int AS n, max(version) AS max_v
     FROM reference_versions
     GROUP BY key
     ORDER BY key`,
  );
  console.log("by_key", industries.rows);
} finally {
  await p.end();
}
