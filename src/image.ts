import * as fs from 'fs';
import { resolveStyle, type ResolvedStyle } from './config';
import { generateQrBuffer } from './qr';
import type { WifiConfig, StyleConfig } from './types';

/**
 * Generates the final composed image as a PNG Buffer.
 */
export const composeImageBuffer = async (cfg: WifiConfig, style?: StyleConfig): Promise<Buffer> => {
  const s: ResolvedStyle = resolveStyle(style);
  const { createCanvas, loadImage } = await import('canvas');

  // Generate the QR code
  const qrBuffer = await generateQrBuffer(cfg, style);
  const qrImage = await loadImage(qrBuffer);

  // Create canvas
  const canvas = createCanvas(s.imageSize, s.imageSize);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = s.colorBackground;
  ctx.fillRect(0, 0, s.imageSize, s.imageSize);

  // QR code (centered)
  const qrX = (s.imageSize - s.qrSize) / 2;
  const qrY = (s.imageSize - s.qrSize) / 2 + s.qrOffsetY;
  ctx.drawImage(qrImage, qrX, qrY, s.qrSize, s.qrSize);

  // Info text
  if (s.showInfoInImage) {
    const fontSize = Math.round(s.imageSize * (s.fontSize / 1200));
    ctx.font = `500 ${fontSize}px ${s.fontFamily}`;
    ctx.fillStyle = s.colorText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const centerX = s.imageSize / 2;
    let textY = s.imageSize - Math.round(130 * (s.imageSize / 1200));

    const ssidLabel = s.textTemplateSsid.replace('{ssid}', cfg.ssid);
    ctx.fillText(ssidLabel, centerX, textY);

    if (cfg.password) {
      textY += fontSize + 12;
      const pwdLabel = s.textTemplatePassword.replace('{password}', cfg.password);
      ctx.fillText(pwdLabel, centerX, textY);
    }
  }

  return canvas.toBuffer('image/png');
};

/**
 * Composes the final image and writes it to disk (used by CLI).
 */
export const composeImage = async (cfg: WifiConfig): Promise<void> => {
  console.log(`Generating styled QR Code for SSID: "${cfg.ssid}"...`);
  const buffer = await composeImageBuffer(cfg);
  fs.writeFileSync(cfg.outputFile, buffer);
  console.log(`Success! Saved to ./${cfg.outputFile}`);
};
