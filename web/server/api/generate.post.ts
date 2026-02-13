import { composeImageBuffer } from '../../../src/image';
import type { WifiConfig, WifiEncryption, StyleConfig } from '../../../src/types';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // --- Validate required fields ---
  const ssid = String(body.ssid ?? '').trim();
  if (!ssid) {
    throw createError({ statusCode: 400, statusMessage: 'SSID is required' });
  }

  const encryption: WifiEncryption = body.encryption ?? 'WPA';
  if (!['WPA', 'WEP', 'nopass'].includes(encryption)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid encryption type' });
  }

  const password = body.password ? String(body.password) : undefined;
  if (encryption !== 'nopass' && !password) {
    throw createError({ statusCode: 400, statusMessage: 'Password is required for encrypted networks' });
  }

  const isHidden = Boolean(body.isHidden ?? false);

  // --- Build WifiConfig ---
  const cfg: WifiConfig = {
    ssid,
    password,
    encryption,
    isHidden,
    outputFile: '', // Not used for buffer generation
  };

  // --- Optional style overrides ---
  const style: StyleConfig | undefined = body.style ?? undefined;

  // --- Generate image ---
  const buffer = await composeImageBuffer(cfg, style);

  setResponseHeader(event, 'Content-Type', 'image/png');
  setResponseHeader(event, 'Content-Disposition', `inline; filename="${ssid.replace(/[^a-zA-Z0-9_-]/g, '_')}.png"`);
  return buffer;
});
