import { readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const staticDir = join(root, ".next", "static");

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, files);
    } else {
      files.push({ path: fullPath, bytes: stat.size });
    }
  }
  return files;
}

if (!existsSync(staticDir)) {
  console.error("No .next/static directory found. Run `npm run build` first.");
  process.exit(1);
}

const assets = walk(staticDir)
  .filter((asset) => /\.(js|css)$/.test(asset.path))
  .sort((left, right) => right.bytes - left.bytes)
  .slice(0, 20)
  .map((asset) => ({
    file: relative(root, asset.path).replaceAll("\\", "/"),
    kb: Math.round(asset.bytes / 1024),
  }));

const totalKb = assets.reduce((sum, asset) => sum + asset.kb, 0);
console.info(JSON.stringify({ generated_at: new Date().toISOString(), top_assets: assets, top_assets_kb: totalKb }, null, 2));
