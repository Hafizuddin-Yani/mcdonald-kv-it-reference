// Generates the PWA PNG icons from public/icon.svg using sharp.
// Outputs are committed, so the build itself never needs sharp installed.
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const svg = await readFile(new URL('../public/icon.svg', import.meta.url));

for (const size of [192, 512]) {
  await sharp(svg).resize(size, size).png().toFile(`public/icon-${size}.png`);
  console.log(`wrote public/icon-${size}.png`);
}

// Maskable icon: full-bleed red background, mark kept inside the safe zone.
const mark = await sharp(svg).resize(360, 360).png().toBuffer();
await sharp({
  create: { width: 512, height: 512, channels: 4, background: '#DA291C' },
})
  .composite([{ input: mark, gravity: 'center' }])
  .png()
  .toFile('public/icon-maskable-512.png');
console.log('wrote public/icon-maskable-512.png');
