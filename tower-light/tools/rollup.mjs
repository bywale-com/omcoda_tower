import fs from "node:fs";
const OUT = "/tmp/tower-scan/out";
const load = (n) => JSON.parse(fs.readFileSync(`${OUT}/${n}`, "utf8"));

const syntax = load("syntax.json");
const types = load("types.json");
const jsx = load("jsx.json");
const imports = load("imports.json");
const apis = load("apis.json");
const globals = load("globals.json");
const dynamic = load("dynamic.json");
const sql = load("sql.json");
const css = load("css.json");
const html = load("html.json");
const typeRefs = load("typeRefs.json");
const summary = load("summary.json");
const manifest = load("manifest.json");

function moduleOf(id) {
  const i = id.indexOf("::");
  return i === -1 ? id : id.slice(0, i);
}
function symbolOf(id) {
  const i = id.indexOf("::");
  return i === -1 ? id : id.slice(i + 2);
}

const byModule = {};
for (const row of imports) {
  const m = moduleOf(row.id);
  if (!byModule[m]) byModule[m] = { module: m, importHits: 0, importSymbols: new Set(), apiHits: 0, apis: {} };
  byModule[m].importHits += row.occurrences;
  byModule[m].importSymbols.add(symbolOf(row.id));
}
for (const row of apis) {
  const m = moduleOf(row.id);
  if (!byModule[m]) byModule[m] = { module: m, importHits: 0, importSymbols: new Set(), apiHits: 0, apis: {} };
  byModule[m].apiHits += row.occurrences;
  const sym = symbolOf(row.id);
  if (!byModule[m].apis[sym]) byModule[m].apis[sym] = { symbol: sym, occurrences: 0, fileCount: 0, examples: [] };
  byModule[m].apis[sym].occurrences += row.occurrences;
  byModule[m].apis[sym].fileCount += row.fileCount;
  byModule[m].apis[sym].examples.push(...row.examples);
}

const modules = Object.values(byModule)
  .map((m) => ({
    module: m.module,
    kind: m.module.startsWith(".") || m.module.startsWith("@/") || m.module.startsWith("/src") ? "relative" : "package",
    importHits: m.importHits,
    apiHits: m.apiHits,
    symbolCount: m.importSymbols.size,
    topApis: Object.values(m.apis)
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 25)
      .map((a) => ({
        symbol: a.symbol,
        occurrences: a.occurrences,
        fileCount: a.fileCount,
        examples: a.examples.slice(0, 3),
      })),
  }))
  .sort((a, b) => b.apiHits - a.apiHits || a.module.localeCompare(b.module));

const packages = modules.filter((m) => m.kind === "package");
const relative = modules.filter((m) => m.kind === "relative");

const pkgJson = JSON.parse(fs.readFileSync("/tmp/tower-main/package.json", "utf8"));
const declared = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
const usedPackages = new Set(packages.map((p) => p.module.split("/")[0].startsWith("@") ? p.module.split("/").slice(0, 2).join("/") : p.module.split("/")[0]));
const unusedDeclared = Object.keys(declared).filter((d) => {
  const prefix = d;
  return !packages.some((p) => p.module === d || p.module.startsWith(d + "/"));
});

const kinds = {};
for (const m of manifest) {
  kinds[m.status + ":" + (m.kind || m.reason || "")] = (kinds[m.status + ":" + (m.kind || m.reason || "")] || 0) + 1;
}

const rollup = {
  summary,
  manifestBuckets: kinds,
  syntax,
  types,
  jsx,
  globals,
  dynamic,
  sql,
  css,
  html,
  typeRefsTop: typeRefs.slice(0, 40),
  packages: packages.map((p) => ({
    module: p.module,
    importHits: p.importHits,
    apiHits: p.apiHits,
    symbolCount: p.symbolCount,
    topApis: p.topApis,
  })),
  relativeModuleCount: relative.length,
  unusedDeclared,
  declaredCount: Object.keys(declared).length,
  packageCount: packages.length,
};

fs.writeFileSync(`${OUT}/rollup.json`, JSON.stringify(rollup, null, 2));
fs.writeFileSync(
  `${OUT}/packages-brief.json`,
  JSON.stringify(
    packages.map((p) => ({
      module: p.module,
      apiHits: p.apiHits,
      importHits: p.importHits,
      symbols: p.symbolCount,
      top: p.topApis.slice(0, 12).map((a) => a.symbol),
    })),
    null,
    2,
  ),
);

console.log("packages", packages.length, "relative", relative.length, "unusedDeclared", unusedDeclared.length);
console.log("unused", unusedDeclared);
console.log("top packages");
for (const p of packages.slice(0, 25)) {
  console.log(`  ${p.module} apis=${p.apiHits} imports=${p.importHits} symbols=${p.symbolCount} top=${p.topApis.slice(0, 8).map((a) => a.symbol).join(", ")}`);
}
console.log("\n--- syntax ---");
for (const s of syntax) console.log(`${s.id}\t${s.occurrences}\t${s.fileCount}`);
console.log("\n--- types ---");
for (const s of types) console.log(`${s.id}\t${s.occurrences}\t${s.fileCount}`);
console.log("\n--- jsx ---");
for (const s of jsx) console.log(`${s.id}\t${s.occurrences}\t${s.fileCount}`);
console.log("\n--- globals ---");
for (const s of globals) console.log(`${s.id}\t${s.occurrences}\t${s.fileCount}`);
console.log("\n--- dynamic ---");
for (const s of dynamic) console.log(`${s.id}\t${s.occurrences}\t${s.fileCount}`);
console.log("\n--- sql ---");
for (const s of sql) console.log(`${s.id}\t${s.occurrences}\t${s.fileCount}`);
console.log("\n--- css ---");
for (const s of css) console.log(`${s.id}\t${s.occurrences}\t${s.fileCount}`);
