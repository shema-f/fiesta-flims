import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generate() {
  const svgPath = path.join(process.cwd(), 'public', 'icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  console.log('🎨 Generating mobile PWA icons from public/icon.svg...');

  // 1. 192x192 standard Android icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(process.cwd(), 'public', 'icon-192.png'));
  console.log('✓ Created public/icon-192.png (192x192)');

  // 2. 512x512 standard splash/home icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(process.cwd(), 'public', 'icon-512.png'));
  console.log('✓ Created public/icon-512.png (512x512)');

  // 3. 180x180 Apple Touch Icon (iOS Safari home screen requirement)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(process.cwd(), 'public', 'apple-touch-icon.png'));
  console.log('✓ Created public/apple-touch-icon.png (180x180)');

  // 4. 512x512 Maskable Icon with 10% safe margin padding (Android requirement)
  // Maskable icons are placed on a dark background (#09090b) with safe zone
  const innerSize = Math.round(512 * 0.8); // 80% safe zone
  const innerBuffer = await sharp(svgBuffer)
    .resize(innerSize, innerSize)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 9, g: 9, b: 11, alpha: 1 }, // #09090b brand dark
    },
  })
    .composite([
      {
        input: innerBuffer,
        gravity: 'center',
      },
    ])
    .png()
    .toFile(path.join(process.cwd(), 'public', 'icon-maskable-512.png'));
  console.log('✓ Created public/icon-maskable-512.png (512x512 with safe zone)');

  console.log('🎉 All mobile phone icons generated successfully!');
}

generate().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
