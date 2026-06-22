import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.resolve(root, "../notion-icons-svg-55534e");
const dest = path.join(root, "src/assets/notion-icons");
const text = fs.readFileSync(path.join(root, "src/app/icons/notion-icon-urls.ts"), "utf8");
const files = [...text.matchAll(/@notion-icons\/([^"?]+)/g)].map((m) => m[1]);

fs.mkdirSync(dest, { recursive: true });
for (const file of files) {
  fs.copyFileSync(path.join(src, file), path.join(dest, file));
}
console.log(`Copied ${files.length} notion icons to ${dest}`);
