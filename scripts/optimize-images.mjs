/**
 * Image pipeline for Aura Labs.
 *
 * 1. Converts every referenced JPG/PNG under public/projects to WebP (~40-60%
 *    smaller) so the site ships the modern format with a JPG fallback.
 * 2. Emits a tiny base64 blur placeholder for each image into
 *    src/data/imagePlaceholders.json, used by <Img> for an instant LQIP.
 * 3. Generates a branded public/og-image.png (1200x630) for social previews.
 *
 * Run with: npm run images
 */
import sharp from "sharp";
import { readdir, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const PROJECTS_DIR = path.resolve("public/projects");
const PLACEHOLDER_OUT = path.resolve("src/data/imagePlaceholders.json");

async function buildWebpAndPlaceholders() {
  const files = (await readdir(PROJECTS_DIR)).filter((f) => /\.(jpe?g|png)$/i.test(f));
  const placeholders = {};

  for (const file of files) {
    const full = path.join(PROJECTS_DIR, file);
    const webpName = file.replace(/\.(jpe?g|png)$/i, ".webp");
    const webpPath = path.join(PROJECTS_DIR, webpName);

    await sharp(full).webp({ quality: 78, effort: 5 }).toFile(webpPath);

    // 20px-wide blurred LQIP, inlined as a data URI
    const lqip = await sharp(full).resize(20).blur(2).webp({ quality: 40 }).toBuffer();
    const publicPath = `/projects/${file}`;
    placeholders[publicPath] = `data:image/webp;base64,${lqip.toString("base64")}`;
    // also key by webp path so <Img> can look up either form
    placeholders[`/projects/${webpName}`] = placeholders[publicPath];

    console.log(`✓ ${file} → ${webpName} (+ LQIP)`);
  }

  await writeFile(PLACEHOLDER_OUT, JSON.stringify(placeholders, null, 2));
  console.log(`✓ wrote ${Object.keys(placeholders).length} placeholders`);
}

async function buildOgImage() {
  const svg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="glow" cx="50%" cy="42%" r="60%">
        <stop offset="0%" stop-color="#0a2230"/>
        <stop offset="55%" stop-color="#050608"/>
        <stop offset="100%" stop-color="#000000"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#glow)"/>
    <circle cx="600" cy="250" r="2" fill="#00f0ff"/>
    <text x="600" y="300" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
      font-size="120" font-weight="900" letter-spacing="-4" fill="#ffffff">AURA LABS</text>
    <text x="600" y="372" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
      font-size="26" font-weight="700" letter-spacing="8" fill="#00f0ff">WEB · AI CHATBOTS · AD CONTENT</text>
    <text x="600" y="430" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
      font-size="22" font-weight="400" letter-spacing="6" fill="#8a93a3">EDMONTON, ALBERTA — WORLDWIDE</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.resolve("public/og-image.png"));
  console.log("✓ wrote public/og-image.png");
}

async function main() {
  if (!existsSync(path.resolve("src/data"))) await mkdir(path.resolve("src/data"), { recursive: true });
  await buildWebpAndPlaceholders();
  await buildOgImage();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
