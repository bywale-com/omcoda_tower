# Re-running the Tower vocabulary scan

The inventory is of **product source on `origin/main`**, not of recon (recon does not contain `src/` / `server/`).

```bash
git fetch origin main
git worktree add /tmp/tower-main origin/main   # or another checkout of main
cd /tmp && mkdir -p tower-scan && cd tower-scan
npm init -y
npm install typescript@5.8.3
TOWER_ROOT=/tmp/tower-main TOWER_SCAN_OUT=/tmp/tower-scan/out \
  node /path/to/omcoda_tower/tower-light/tools/scan.mjs
node /path/to/omcoda_tower/tower-light/tools/rollup.mjs
# copy evidence JSON into tower-light/evidence/
# then:
node tower-light/tools/generate-inventories.mjs
```

Parser is **TypeScript 5.8** `createSourceFile`. TypeScript 7’s default export is version-only and will fail this script.

Do not add `typescript` to Tower’s `package.json` for this audit.
