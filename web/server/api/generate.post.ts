import { composeImageBuffer } from '../../../src/image';
import { buildWifiString } from '../../../src/wifi';
import type { WifiEncryption, StyleConfig, QrType } from '../../../src/types';
import { resolveStyle } from '../../../src/config';

function buildLabelLines(
  type: QrType,
  payload: { ssid: string; password?: string } | { url: string } | { text: string },
): string[] {
  const resolved = resolveStyle(undefined);
  if (type === 'wifi') {
    const p = payload as { ssid: string; password?: string };
    return [
      resolved.textTemplateSsid.replace('{ssid}', p.ssid),
      ...(p.password ? [resolved.textTemplatePassword.replace('{password}', p.password)] : []),
    ];
  }
  if (type === 'url') return [(payload as { url: string }).url];
  const firstLine = (payload as { text: string }).text.split(/\r?\n/)[0]?.trim() || '';
  return firstLine ? [firstLine] : [];
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const type: QrType =
    body.type === 'url' ? 'url' : body.type === 'text' ? 'text' : 'wifi';

  let data: string;
  let labelLines: string[];
  let filename: string;

  if (type === 'wifi') {
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

    const cfg = {
      ssid,
      password,
      encryption,
      isHidden,
      outputFile: '',
    };
    data = buildWifiString(cfg);
    labelLines = buildLabelLines('wifi', { ssid, password });
    filename = ssid.replace(/[^a-zA-Z0-9_-]/g, '_');
  } else if (type === 'url') {
    const url = String(body.url ?? '').trim();
    if (!url) {
      throw createError({ statusCode: 400, statusMessage: 'URL is required' });
    }
    data = url;
    labelLines = buildLabelLines('url', { url });
    try {
      const u = new URL(url);
      filename = u.hostname.replace(/[^a-zA-Z0-9_-]/g, '_') || 'url';
    } catch {
      filename = 'url';
    }
  } else {
    const text = String(body.text ?? '').trim();
    if (!text) {
      throw createError({ statusCode: 400, statusMessage: 'Text is required' });
    }
    data = text;
    labelLines = buildLabelLines('text', { text });
    const firstLine = text.split(/\r?\n/)[0]?.slice(0, 30) || 'text';
    filename = firstLine.replace(/[^a-zA-Z0-9_-]/g, '_') || 'text';
  }

  const style: StyleConfig | undefined = body.style ?? undefined;
  const buffer = await composeImageBuffer(data, style, labelLines);

  setResponseHeader(event, 'Content-Type', 'image/png');
  setResponseHeader(event, 'Content-Disposition', `inline; filename="${filename}.png"`);
  return buffer;
});
