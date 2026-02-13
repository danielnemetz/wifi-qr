/**
 * Builds QR payload strings for non-Wi‑Fi types.
 * Formats follow common scanner expectations (tel:, mailto:, sms:, geo:, vCard 3.0).
 */

/** Escape vCard 3.0 value: \ → \\, newline → \n, ; → \;, , → \, */
function escapeVcardValue(s: string): string {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

export function buildVcardString(p: { name: string; phone?: string; email?: string; org?: string }): string {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escapeVcardValue(p.name)}`];
  if (p.phone?.trim()) lines.push(`TEL:${p.phone.trim().replace(/\s/g, '')}`);
  if (p.email?.trim()) lines.push(`EMAIL:${p.email.trim()}`);
  if (p.org?.trim()) lines.push(`ORG:${escapeVcardValue(p.org)}`);
  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function buildMailtoString(p: { email: string; subject?: string; body?: string }): string {
  const email = p.email.trim();
  const params = new URLSearchParams();
  if (p.subject?.trim()) params.set('subject', p.subject.trim());
  if (p.body?.trim()) params.set('body', p.body.trim());
  const qs = params.toString();
  return qs ? `mailto:${email}?${qs}` : `mailto:${email}`;
}

export function buildSmsString(p: { phone: string; body?: string }): string {
  const phone = p.phone.trim().replace(/\s/g, '');
  if (p.body?.trim()) {
    return `sms:${phone}?body=${encodeURIComponent(p.body.trim())}`;
  }
  return `sms:${phone}`;
}

export function buildTelString(phone: string): string {
  return `tel:${phone.trim().replace(/\s/g, '')}`;
}

export function buildGeoString(p: { lat: number; lng: number }): string {
  return `geo:${p.lat},${p.lng}`;
}
