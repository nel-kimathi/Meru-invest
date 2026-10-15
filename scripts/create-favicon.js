const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const toIco = require('to-ico');

async function main() {
  const input = 'public/images/logos/logo-no-bg.png';
  const output = 'public/favicon.ico';
  const tmpDir = path.join(process.env.TEMP || '/tmp', 'opencode', 'favicon');
  fs.mkdirSync(tmpDir, { recursive: true });

  const sizes = [16, 32, 48, 256];
  const pngPaths = [];

  for (const size of sizes) {
    const out = path.join(tmpDir, `favicon-${size}.png`);
    await sharp(input)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(out);
    pngPaths.push(out);
  }

  const bufs = pngPaths.map((p) => fs.readFileSync(p));
  const ico = await toIco(bufs);
  fs.writeFileSync(output, ico);
  console.log('Created', output);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
