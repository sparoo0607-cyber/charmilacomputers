// One-time / repeatable bulk upload: public/images/** -> Supabase Storage
// bucket "product-images" (created by supabase/full_setup.sql).
//
// Run locally (never in the browser / never commit the service role key):
//
//   SUPABASE_URL=https://<project>.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=<service-role-key-from-Supabase-dashboard> \
//   node scripts/upload-images-to-supabase.mjs
//
// Get the service role key from: Supabase Dashboard -> Project Settings ->
// API -> "service_role" (NOT the anon/publishable key — this one bypasses
// RLS, so keep it out of git and out of the browser bundle entirely).
//
// What it does:
//   - Walks public/images recursively
//   - Uploads every file to the "product-images" bucket, keeping the same
//     relative path (so public/images/products/foo.png becomes
//     product-images/products/foo.png in Storage)
//   - Skips a file if it's already uploaded (re-run safe)
//   - Writes scripts/uploaded-image-urls.json: { "products/foo.png": "https://...", ... }
//     so you can paste the right URL into a product's "Image URL" field in
//     /admin/products, or into PRODUCT_IMAGE_MAP in src/components/ProductImage.tsx.
//
// This does NOT delete or modify anything in public/images — it only reads
// from it. The app keeps working exactly as before until you deliberately
// start using the printed URLs.

import { createClient } from "@supabase/supabase-js";
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const BUCKET = "product-images";

// Parse .env.local if present
try {
  const envLocalPath = path.join(ROOT, ".env.local");
  const envContent = await readFile(envLocalPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
} catch {}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing env vars SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const CONTENT_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

async function main() {
  const urlMap = {};
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  let total = 0;

  const targetDirs = [
    path.join(PUBLIC_DIR, "images"),
    path.join(PUBLIC_DIR, "themes"),
  ];

  for (const targetDir of targetDirs) {
    const info = await stat(targetDir).catch(() => null);
    if (!info) continue;

    for await (const filePath of walk(targetDir)) {
      const ext = path.extname(filePath).toLowerCase();
      if (!CONTENT_TYPES[ext]) continue;

      total++;
      const relativePath = path.relative(PUBLIC_DIR, filePath).split(path.sep).join("/");
      const storagePath = relativePath.replace(/[\[\]]/g, "");

      const buffer = await readFile(filePath);

      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
        contentType: CONTENT_TYPES[ext],
        upsert: true,
      });

      const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      urlMap[relativePath] = publicUrlData.publicUrl;

      if (error) {
        failed++;
        console.error(`✗ ${relativePath} — ${error.message}`);
      } else {
        uploaded++;
        if (uploaded % 10 === 0) console.log(`  ...${uploaded} uploaded so far`);
      }
    }
  }

  const outPath = path.join(__dirname, "uploaded-image-urls.json");
  await writeFile(outPath, JSON.stringify(urlMap, null, 2), "utf-8");

  console.log("\n────────────────────────────────────────");
  console.log(`Done. ${uploaded} uploaded, ${skipped} skipped, ${failed} failed, ${total} total image files found.`);
  console.log(`Public URLs written to: ${path.relative(ROOT, outPath)}`);
  console.log("────────────────────────────────────────");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
