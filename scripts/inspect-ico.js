const fs = require('fs');
const buf = fs.readFileSync('public/favicon.ico');
const count = buf.readUInt16LE(4);
console.log('Icon count:', count);
for (let i = 0; i < count; i++) {
  const offset = 6 + i * 16;
  const width = buf.readUInt8(offset);
  const height = buf.readUInt8(offset + 1);
  const bpp = buf.readUInt16LE(offset + 10);
  const size = buf.readUInt32LE(offset + 8);
  console.log('Icon ' + (i + 1) + ': width=' + width + ', height=' + height + ', bpp=' + bpp + ', size=' + size + ' bytes');
}
