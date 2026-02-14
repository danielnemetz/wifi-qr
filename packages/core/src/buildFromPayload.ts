/**
 * Shared logic: given a QR type and validated payload, produce the QR data string,
 * label lines for the image, and a safe filename. Used by both CLI and API.
 */

import { buildWifiString } from './wifi';
import {
  buildVcardString,
  buildMailtoString,
  buildSmsString,
  buildTelString,
  buildGeoString,
} from './payloads';
import type { QrType, WifiEncryption } from './types';
import { resolveStyle } from './config';

export type WifiPayload = { ssid: string; password?: string; encryption: WifiEncryption; isHidden: boolean };
export type UrlPayload = { url: string };
export type TextPayload = { text: string };
export type VcardPayload = {
  name: string;
  phone?: string;
  email?: string;
  org?: string;
  url?: string;
  note?: string;
  title?: string;
  role?: string;
  birthday?: string;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
};
export type EmailPayload = { email: string; subject?: string; body?: string };
export type SmsPayload = { phone: string; body?: string };
export type TelPayload = { phone: string };
export type GeoPayload = { lat: number; lng: number };

export type Payload =
  | WifiPayload
  | UrlPayload
  | TextPayload
  | VcardPayload
  | EmailPayload
  | SmsPayload
  | TelPayload
  | GeoPayload;

export interface QrPayloadResult {
  data: string;
  labelLines: string[];
  filename: string;
}

function buildLabelLines(type: QrType, payload: Payload): string[] {
  const resolved = resolveStyle(undefined);
  if (type === 'wifi') {
    const p = payload as WifiPayload;
    return [
      resolved.textTemplateSsid.replace('{ssid}', p.ssid),
      ...(p.password ? [resolved.textTemplatePassword.replace('{password}', p.password)] : []),
    ];
  }
  if (type === 'url') return [(payload as UrlPayload).url];
  if (type === 'text') {
    const firstLine = (payload as TextPayload).text.split(/\r?\n/)[0]?.trim() || '';
    return firstLine ? [firstLine] : [];
  }
  if (type === 'vcard') return [(payload as VcardPayload).name];
  if (type === 'email') return [(payload as EmailPayload).email];
  if (type === 'sms' || type === 'tel') return [(payload as { phone: string }).phone];
  if (type === 'geo') {
    const p = payload as GeoPayload;
    return [`${p.lat}, ${p.lng}`];
  }
  return [];
}

/**
 * Builds QR data string, label lines, and filename from a validated type and payload.
 * Call this after validating/parsing input (API body or CLI prompts).
 */
export function buildQrPayload(type: QrType, payload: Payload): QrPayloadResult {
  let data: string;
  const labelLines = buildLabelLines(type, payload);
  let filename: string;

  if (type === 'wifi') {
    const p = payload as WifiPayload;
    const cfg = { ...p, outputFile: '' };
    data = buildWifiString(cfg);
    filename = p.ssid.replace(/[^a-zA-Z0-9_-]/g, '_');
  } else if (type === 'url') {
    const p = payload as UrlPayload;
    data = p.url;
    try {
      const u = new URL(p.url);
      filename = u.hostname.replace(/[^a-zA-Z0-9_-]/g, '_') || 'url';
    } catch {
      filename = 'url';
    }
  } else if (type === 'text') {
    const p = payload as TextPayload;
    data = p.text;
    const firstLine = p.text.split(/\r?\n/)[0]?.slice(0, 30) || 'text';
    filename = firstLine.replace(/[^a-zA-Z0-9_-]/g, '_') || 'text';
  } else if (type === 'vcard') {
    const p = payload as VcardPayload;
    const name = p.name || 'Contact';
    data = buildVcardString({
      name,
      phone: p.phone || undefined,
      email: p.email || undefined,
      org: p.org || undefined,
      url: p.url || undefined,
      note: p.note || undefined,
      title: p.title || undefined,
      role: p.role || undefined,
      birthday: p.birthday || undefined,
      street: p.street || undefined,
      city: p.city || undefined,
      zip: p.zip || undefined,
      country: p.country || undefined,
    });
    filename = name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'vcard';
  } else if (type === 'email') {
    const p = payload as EmailPayload;
    data = buildMailtoString({
      email: p.email,
      subject: p.subject || undefined,
      body: p.body || undefined,
    });
    filename = p.email.replace(/[^a-zA-Z0-9_.@+-]/g, '_') || 'email';
  } else if (type === 'sms') {
    const p = payload as SmsPayload;
    data = buildSmsString({ phone: p.phone, body: p.body || undefined });
    filename = `sms_${p.phone.replace(/\D/g, '').slice(-8)}` || 'sms';
  } else if (type === 'tel') {
    const p = payload as TelPayload;
    data = buildTelString(p.phone);
    filename = `tel_${p.phone.replace(/\D/g, '').slice(-8)}` || 'tel';
  } else {
    const p = payload as GeoPayload;
    data = buildGeoString(p);
    filename = `geo_${p.lat}_${p.lng}`.replace(/[^a-zA-Z0-9_.-]/g, '_') || 'geo';
  }

  return { data, labelLines, filename };
}

export const QR_TYPES: QrType[] = ['wifi', 'url', 'text', 'vcard', 'email', 'sms', 'tel', 'geo'];

/** Display labels for UI (CLI prompts, web dropdown). Single source of truth. */
export const QR_TYPE_LABELS: Record<QrType, string> = {
  email: 'Email',
  geo: 'Location',
  sms: 'SMS',
  tel: 'Phone',
  text: 'Text',
  url: 'URL',
  vcard: 'Contact (vCard)',
  wifi: 'Wi‑Fi',
};

/** Ordered list for UI (e.g. dropdown); first is default. */
export const QR_TYPE_CHOICES: { value: QrType; label: string }[] = [
  { value: 'email', label: QR_TYPE_LABELS.email },
  { value: 'geo', label: QR_TYPE_LABELS.geo },
  { value: 'sms', label: QR_TYPE_LABELS.sms },
  { value: 'tel', label: QR_TYPE_LABELS.tel },
  { value: 'text', label: QR_TYPE_LABELS.text },
  { value: 'url', label: QR_TYPE_LABELS.url },
  { value: 'vcard', label: QR_TYPE_LABELS.vcard },
  { value: 'wifi', label: QR_TYPE_LABELS.wifi },
];

export function parseType(value: unknown): QrType {
  const t = String(value ?? 'wifi').toLowerCase();
  return QR_TYPES.includes(t as QrType) ? (t as QrType) : 'wifi';
}

export function parseNum(s: unknown): number {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}
