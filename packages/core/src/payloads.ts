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

export function buildVcardString(p: {
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
}): string {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escapeVcardValue(p.name)}`];
  if (p.phone?.trim()) lines.push(`TEL:${p.phone.trim().replace(/\s/g, '')}`);
  if (p.email?.trim()) lines.push(`EMAIL:${p.email.trim()}`);
  if (p.org?.trim()) lines.push(`ORG:${escapeVcardValue(p.org)}`);
  if (p.title?.trim()) lines.push(`TITLE:${escapeVcardValue(p.title)}`);
  if (p.role?.trim()) lines.push(`ROLE:${escapeVcardValue(p.role)}`);
  if (p.url?.trim()) lines.push(`URL:${escapeVcardValue(p.url)}`);
  if (p.note?.trim()) lines.push(`NOTE:${escapeVcardValue(p.note)}`);
  if (p.birthday?.trim()) lines.push(`BDAY:${p.birthday.trim().replace(/-/g, '')}`);

  const hasAddress = p.street?.trim() || p.city?.trim() || p.zip?.trim() || p.country?.trim();
  if (hasAddress) {
    const street = escapeVcardValue(p.street || '');
    const city = escapeVcardValue(p.city || '');
    const zip = escapeVcardValue(p.zip || '');
    const country = escapeVcardValue(p.country || '');
    // ADR format: ;;street;city;region;zip;country
    lines.push(`ADR;TYPE=work:;;${street};${city};;${zip};${country}`);
  }

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
