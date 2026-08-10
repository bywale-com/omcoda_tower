// Emit self-contained handlers into dist-api/ so api entries stay thin.
// Required catch-all api/<svc>/[...path].ts re-exports these bundles.
import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "dist-api");
fs.mkdirSync(outDir, { recursive: true });

const targets = [
  {
    entry: path.join(root, "scripts/vercel-entries/wire.ts"),
    outfile: path.join(outDir, "wire.js"),
    label: "wire",
  },
  {
    entry: path.join(root, "scripts/vercel-entries/auth.ts"),
    outfile: path.join(outDir, "auth.js"),
    label: "auth",
  },
];

for (const t of targets) {
  await esbuild.build({
    entryPoints: [t.entry],
    outfile: t.outfile,
    bundle: true,
    platform: "node",
    target: "node20",
    format: "esm",
    packages: "external",
    logLevel: "info",
  });
  console.log(`bundled ${t.label} → ${path.relative(root, t.outfile)}`);
}

console.log("api bundle ready (dist-api)");
