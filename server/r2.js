const sharp = require('sharp');
const { R2 } = require('node-cloudflare-r2');

const r2 = new R2({
  accountId: process.env.CC_R2_ACCOUNT_ID,
  accessKeyId: process.env.CC_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.CC_R2_SECRET_ACCESS_KEY,
});
const bucket = r2.bucket('cuentacuentos');
bucket.provideBucketPublicUrl('https://ccmedia.lunesdelios.com');

async function uploadFile(id, part, base64) {
  const buffer = Buffer.from(base64, 'base64');
  const fileName = `${id}_${part}.webp`
  await sharp(buffer).toFormat('webp').toFile(fileName);
  const upload = await bucket.uploadFile(`./${fileName}`, `${fileName}`);
  return upload.publicUrl;
}

module.exports = uploadFile;
