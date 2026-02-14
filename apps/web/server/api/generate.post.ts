
import {
  composeImageBuffer,
  buildQrPayload,
  parseType,
  parseNum,
  type WifiPayload,
  type UrlPayload,
  type TextPayload,
  type VcardPayload,
  type EmailPayload,
  type SmsPayload,
  type TelPayload,
  type GeoPayload,
  type WifiEncryption,
  type StyleConfig
} from '@qr/core';


export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const type = parseType(body?.type);

  let payload:
    | WifiPayload
    | UrlPayload
    | TextPayload
    | VcardPayload
    | EmailPayload
    | SmsPayload
    | TelPayload
    | GeoPayload;

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
    payload = {
      ssid,
      password,
      encryption,
      isHidden: Boolean(body.isHidden ?? false),
    };
  } else if (type === 'url') {
    const url = String(body.url ?? '').trim();
    if (!url) throw createError({ statusCode: 400, statusMessage: 'URL is required' });
    payload = { url };
  } else if (type === 'text') {
    const text = String(body.text ?? '').trim();
    if (!text) throw createError({ statusCode: 400, statusMessage: 'Text is required' });
    payload = { text };
  } else if (type === 'vcard') {
    const name = String(body.vcardName ?? '').trim();
    const phone = String(body.vcardPhone ?? '').trim();
    const email = String(body.vcardEmail ?? '').trim();
    const org = String(body.vcardOrg ?? '').trim();
    if (!name && !phone && !email) {
      throw createError({ statusCode: 400, statusMessage: 'Name, phone or email is required' });
    }
    payload = { name, phone, email, org };
  } else if (type === 'email') {
    const email = String(body.email ?? '').trim();
    if (!email) throw createError({ statusCode: 400, statusMessage: 'Email is required' });
    payload = {
      email,
      subject: String(body.emailSubject ?? '').trim(),
      body: String(body.emailBody ?? '').trim(),
    };
  } else if (type === 'sms') {
    const phone = String(body.smsPhone ?? '').trim();
    if (!phone) throw createError({ statusCode: 400, statusMessage: 'Phone number is required' });
    payload = { phone, body: String(body.smsBody ?? '').trim() };
  } else if (type === 'tel') {
    const phone = String(body.telPhone ?? '').trim();
    if (!phone) throw createError({ statusCode: 400, statusMessage: 'Phone number is required' });
    payload = { phone };
  } else {
    const lat = parseNum(body.geoLat);
    const lng = parseNum(body.geoLng);
    payload = { lat, lng };
  }

  const { data, labelLines, filename } = buildQrPayload(type, payload);
  const style: StyleConfig | undefined = body.style ?? undefined;
  const buffer = await composeImageBuffer(data, style, labelLines);

  setResponseHeader(event, 'Content-Type', 'image/png');
  setResponseHeader(event, 'Content-Disposition', `inline; filename="${filename}.png"`);
  return buffer;
});
