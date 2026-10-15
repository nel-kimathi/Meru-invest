const sharp = require('sharp');
const fs = require('fs');
const toIco = require('to-ico');

async function main() {
  const input = 'public/images/logos/logo-no-bg.png';
  const tmpDir = require('path').join(process.env.TEMP || '/tmp', 'opencode', 'favicon');
  fs.mkdirSync(tmpDir, { recursive: true });

  // Only include small icon sizes used by browsers; skip 256x256 to keep file tiny.
  const sizes = [16, 32, 48];
  const bufs = [];

  for (const size of sizes) {
    const png = await sharp(input)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    bufs.push(png);
  }

  const ico = await toIco(bufs);
  fs.writeFileSync('public/favicon.ico', ico);
  console.log('Created favicon.ico:', ico.length, 'bytes');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
