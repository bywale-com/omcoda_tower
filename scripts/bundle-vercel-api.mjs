/**
 * Bundle Vercel serverless entries so server/** is inlined.
 *
 * Vercel's tracer leaves `import "../../server/.../app"` unresolved
 * (`Cannot find module '/var/task/server/...'`). Self-contained ESM
 * handlers under api/<route>/_handler.js fix that; thin [[...path]].ts
 * re-exports stay as the platform entry.
 */
import * as esbuild from "esbuild";
import path from "node:path";

const root = process.cwd();

const targets = [
  {
    entry: path.join(root, "scripts/vercel-entries/wire.ts"),
    outfile: path.join(root, "api/wire/_handler.js"),
    label: "wire",
  },
  {
    entry: path.join(root, "scripts/vercel-entries/auth.ts"),
    outfile: path.join(root, "api/auth/_handler.js"),
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

console.log("api bundle ready (thin [[...path]].ts → _handler.js)");
