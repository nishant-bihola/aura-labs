import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECTS_DIR = path.join(__dirname, '../public/projects');

async function optimizeImages() {
  console.log('--- STARTING IMAGE OPTIMIZATION ---');
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.log(`Directory does not exist: ${PROJECTS_DIR}`);
    return;
  }

  const files = fs.readdirSync(PROJECTS_DIR);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      const srcPath = path.join(PROJECTS_DIR, file);
      const destName = path.basename(file, ext) + '.webp';
      const destPath = path.join(PROJECTS_DIR, destName);

      // Convert to WebP if it doesn't exist or is older
      if (!fs.existsSync(destPath)) {
        console.log(`Optimizing: ${file} -> ${destName}`);
        try {
          await sharp(srcPath)
            .webp({ quality: 80 })
            .toFile(destPath);
        } catch (err) {
          console.error(`Error optimizing ${file}:`, err.message);
        }
      }
    }
  }
  console.log('--- IMAGE OPTIMIZATION COMPLETE ---');
}

optimizeImages();
