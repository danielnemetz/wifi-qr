import { composeImageBuffer } from '../../../src/image';
import { buildWifiString } from '../../../src/wifi';
import {
  buildVcardString,
  buildMailtoString,
  buildSmsString,
  buildTelString,
  buildGeoString,
} from '../../../src/payloads';
import type { WifiEncryption, StyleConfig, QrType } from '../../../src/types';
import { resolveStyle } from '../../../src/config';

type Payload =
  | { ssid: string; password?: string }
  | { url: string }
  | { text: string }
  | { name: string; phone?: string; email?: string; org?: string }
  | { email: string; subject?: string; body?: string }
  | { phone: string; body?: string }
  | { phone: string }
  | { lat: number; lng: number };

function buildLabelLines(type: QrType, payload: Payload): string[] {
  const resolved = resolveStyle(undefined);
  if (type === 'wifi') {
    const p = payload as { ssid: string; password?: string };
    return [
      resolved.textTemplateSsid.replace('{ssid}', p.ssid),
      ...(p.password ? [resolved.textTemplatePassword.replace('{password}', p.password)] : []),
    ];
  }
  if (type === 'url') return [(payload as { url: string }).url];
  if (type === 'text') {
    const firstLine = (payload as { text: string }).text.split(/\r?\n/)[0]?.trim() || '';
    return firstLine ? [firstLine] : [];
  }
  if (type === 'vcard') return [(payload as { name: string }).name];
  if (type === 'email') return [(payload as { email: string }).email];
  if (type === 'sms' || type === 'tel') return [(payload as { phone: string }).phone];
  if (type === 'geo') {
    const p = payload as { lat: number; lng: number };
    return [`${p.lat}, ${p.lng}`];
  }
  return [];
}

const QR_TYPES: QrType[] = ['wifi', 'url', 'text', 'vcard', 'email', 'sms', 'tel', 'geo'];

function parseType(body: { type?: string }): QrType {
  const t = String(body.type ?? 'wifi').toLowerCase();
  return QR_TYPES.includes(t as QrType) ? (t as QrType) : 'wifi';
}

function parseNum(s: unknown): number {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const type = parseType(body);

  let data: string;
  let labelLines: string[];
  let filename: string;

  if (type === 'wifi') {
    const ssid = String(body.ssid ?? '').trim();
    if (!ssid) throw createError({ statusCode: 400, statusMessage: 'SSID is required' });
    const encryption: WifiEncryption = body.encryption ?? 'WPA';
    if (!['WPA', 'WEP', 'nopass'].includes(encryption)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid encryption type' });
    }
    const password = body.password ? String(body.password) : undefined;
    if (encryption !== 'nopass' && !password) {
      throw createError({ statusCode: 400, statusMessage: 'Password is required for encrypted networks' });
    }
    const isHidden = Boolean(body.isHidden ?? false);
    const cfg = { ssid, password, encryption, isHidden, outputFile: '' };
    data = buildWifiString(cfg);
    labelLines = buildLabelLines('wifi', { ssid, password });
    filename = ssid.replace(/[^a-zA-Z0-9_-]/g, '_');
  } else if (type === 'url') {
    const url = String(body.url ?? '').trim();
    if (!url) throw createError({ statusCode: 400, statusMessage: 'URL is required' });
    data = url;
    labelLines = buildLabelLines('url', { url });
    try {
      const u = new URL(url);
      filename = u.hostname.replace(/[^a-zA-Z0-9_-]/g, '_') || 'url';
    } catch {
      filename = 'url';
    }
  } else if (type === 'text') {
    const text = String(body.text ?? '').trim();
    if (!text) throw createError({ statusCode: 400, statusMessage: 'Text is required' });
    data = text;
    labelLines = buildLabelLines('text', { text });
    const firstLine = text.split(/\r?\n/)[0]?.slice(0, 30) || 'text';
    filename = firstLine.replace(/[^a-zA-Z0-9_-]/g, '_') || 'text';
  } else if (type === 'vcard') {
    const name = String(body.vcardName ?? '').trim();
    const phone = String(body.vcardPhone ?? '').trim();
    const email = String(body.vcardEmail ?? '').trim();
    const org = String(body.vcardOrg ?? '').trim();
    if (!name && !phone && !email) {
      throw createError({ statusCode: 400, statusMessage: 'Name, phone or email is required' });
    }
    data = buildVcardString({
      name: name || 'Kontakt',
      phone: phone || undefined,
      email: email || undefined,
      org: org || undefined,
    });
    labelLines = buildLabelLines('vcard', { name: name || 'Kontakt', phone, email, org });
    filename = (name || 'vcard').replace(/[^a-zA-Z0-9_-]/g, '_') || 'vcard';
  } else if (type === 'email') {
    const email = String(body.email ?? '').trim();
    if (!email) throw createError({ statusCode: 400, statusMessage: 'Email is required' });
    const subject = String(body.emailSubject ?? '').trim();
    const bodyText = String(body.emailBody ?? '').trim();
    data = buildMailtoString({ email, subject: subject || undefined, body: bodyText || undefined });
    labelLines = buildLabelLines('email', { email, subject, body: bodyText });
    filename = email.replace(/[^a-zA-Z0-9_.@+-]/g, '_') || 'email';
  } else if (type === 'sms') {
    const phone = String(body.smsPhone ?? '').trim();
    if (!phone) throw createError({ statusCode: 400, statusMessage: 'Phone number is required' });
    const bodyText = String(body.smsBody ?? '').trim();
    data = buildSmsString({ phone, body: bodyText || undefined });
    labelLines = buildLabelLines('sms', { phone, body: bodyText });
    filename = `sms_${phone.replace(/\D/g, '').slice(-8)}` || 'sms';
  } else if (type === 'tel') {
    const phone = String(body.telPhone ?? '').trim();
    if (!phone) throw createError({ statusCode: 400, statusMessage: 'Phone number is required' });
    data = buildTelString(phone);
    labelLines = buildLabelLines('tel', { phone });
    filename = `tel_${phone.replace(/\D/g, '').slice(-8)}` || 'tel';
  } else {
    // geo
    const lat = parseNum(body.geoLat);
    const lng = parseNum(body.geoLng);
    data = buildGeoString({ lat, lng });
    labelLines = buildLabelLines('geo', { lat, lng });
    filename = `geo_${lat}_${lng}`.replace(/[^a-zA-Z0-9_.-]/g, '_') || 'geo';
  }

  const style: StyleConfig | undefined = body.style ?? undefined;
  const buffer = await composeImageBuffer(data, style, labelLines);

  setResponseHeader(event, 'Content-Type', 'image/png');
  setResponseHeader(event, 'Content-Disposition', `inline; filename="${filename}.png"`);
  return buffer;
});
