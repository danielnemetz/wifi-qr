import * as fs from 'fs';
import { resolveStyle, type ResolvedStyle } from './config';
import { generateQrBuffer } from './qr';
import { buildWifiString } from './wifi';
import type { WifiConfig, StyleConfig } from './types';

const MAX_LABEL_LEN = 45;

/**
 * Generates the final composed image as a PNG Buffer.
 * @param data - Raw string encoded in the QR code.
 * @param labelLines - Optional lines shown below the QR (e.g. ["Network: x", "Password: y"]). If omitted, no info text is drawn.
 */
export const composeImageBuffer = async (
  data: string,
  style?: StyleConfig,
  labelLines?: string[],
): Promise<Buffer> => {
  const s: ResolvedStyle = resolveStyle(style);
  const { createCanvas, loadImage } = await import('canvas');

  const qrBuffer = await generateQrBuffer(data, style);
  const qrImage = await loadImage(qrBuffer);

  const canvas = createCanvas(s.imageSize, s.imageSize);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = s.colorBackground;
  ctx.fillRect(0, 0, s.imageSize, s.imageSize);

  const showText = Boolean(s.showInfoInImage && labelLines?.length);
  const qrOffsetY = showText ? s.qrOffsetY : 0;
  const qrX = (s.imageSize - s.qrSize) / 2;
  const qrY = (s.imageSize - s.qrSize) / 2 + qrOffsetY;
  ctx.drawImage(qrImage, qrX, qrY, s.qrSize, s.qrSize);

  if (s.showInfoInImage && labelLines?.length) {
    const fontSize = Math.round(s.imageSize * (s.fontSize / 1200));
    ctx.font = `500 ${fontSize}px ${s.fontFamily}`;
    ctx.fillStyle = s.colorText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const centerX = s.imageSize / 2;
    let textY = s.imageSize - Math.round(130 * (s.imageSize / 1200));

    for (const line of labelLines) {
      const display = line.length > MAX_LABEL_LEN ? line.slice(0, MAX_LABEL_LEN - 3) + '...' : line;
      ctx.fillText(display, centerX, textY);
      textY += fontSize + 12;
    }
  }

  return canvas.toBuffer('image/png');
};

/**
 * Composes the final image and writes it to disk (used by CLI).
 */
export const composeImage = async (cfg: WifiConfig): Promise<void> => {
  console.log(`Generating styled QR Code for SSID: "${cfg.ssid}"...`);
  const data = buildWifiString(cfg);
  const resolved = resolveStyle(undefined);
  const labelLines = [
    resolved.textTemplateSsid.replace('{ssid}', cfg.ssid),
    ...(cfg.password ? [resolved.textTemplatePassword.replace('{password}', cfg.password)] : []),
  ];
  const buffer = await composeImageBuffer(data, undefined, labelLines);
  fs.writeFileSync(cfg.outputFile, buffer);
  console.log(`Success! Saved to ./${cfg.outputFile}`);
};
