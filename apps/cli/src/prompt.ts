import { QR_TYPE_CHOICES, parseNum } from '@qr/core';
import type { QrType, Payload } from '@qr/core';
import type {
  WifiEncryption,
  WifiPayload,
  UrlPayload,
  TextPayload,
  VcardPayload,
  EmailPayload,
  SmsPayload,
  TelPayload,
  GeoPayload,
} from '@qr/core';


const clearPwd = process.argv.includes('--clear-pwd');

const TYPE_CHOICES = QR_TYPE_CHOICES.map((c) => ({ name: c.label, value: c.value }));

export type CliResult = {
  type: QrType;
  payload: WifiPayload | UrlPayload | TextPayload | VcardPayload | EmailPayload | SmsPayload | TelPayload | GeoPayload;
};

export const promptConfig = async (): Promise<CliResult> => {
  const { input, password, select } = await import('@inquirer/prompts');

  const type = await select<QrType>({
    message: 'QR type',
    choices: TYPE_CHOICES,
    default: 'wifi',
  });

  let payload: CliResult['payload'];

  if (type === 'wifi') {
    const ssid = await input({ message: 'SSID (network name)', required: true });
    const encryption = await select<WifiEncryption>({
      message: 'Encryption',
      choices: [
        { name: 'WPA / WPA2 / WPA3', value: 'WPA' },
        { name: 'WEP', value: 'WEP' },
        { name: 'None (open)', value: 'nopass' },
      ],
      default: 'WPA',
    });
    let pwd: string | undefined;
    if (encryption !== 'nopass') {
      if (clearPwd) {
        pwd = await input({ message: 'Password', required: true });
      } else {
        pwd = await password({ message: 'Password', mask: '*' });
      }
    }
    payload = { ssid, password: pwd, encryption, isHidden: false };
  } else if (type === 'url') {
    const url = await input({ message: 'URL', required: true });
    payload = { url };
  } else if (type === 'text') {
    const text = await input({ message: 'Text content', required: true });
    payload = { text };
  } else if (type === 'vcard') {
    const name = await input({ message: 'Name', default: '' });
    const phone = await input({ message: 'Phone', default: '' });
    const email = await input({ message: 'Email', default: '' });
    const org = await input({ message: 'Organization (optional)', default: '' });
    if (!name.trim() && !phone.trim() && !email.trim()) {
      console.error('At least one of Name, Phone or Email is required.');
      process.exit(1);
    }
    payload = {
      name: name.trim() || 'Contact',
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      org: org.trim() || undefined,
    };
  } else if (type === 'email') {
    const email = await input({ message: 'Email address', required: true });
    const subject = await input({ message: 'Subject (optional)', default: '' });
    const body = await input({ message: 'Message body (optional)', default: '' });
    payload = {
      email: email.trim(),
      subject: subject.trim() || undefined,
      body: body.trim() || undefined,
    };
  } else if (type === 'sms') {
    const phone = await input({ message: 'Phone number', required: true });
    const body = await input({ message: 'Message (optional)', default: '' });
    payload = { phone: phone.trim(), body: body.trim() || undefined };
  } else if (type === 'tel') {
    const phone = await input({ message: 'Phone number', required: true });
    payload = { phone: phone.trim() };
  } else {
    const latStr = await input({ message: 'Latitude', default: '52.520008' });
    const lngStr = await input({ message: 'Longitude', default: '13.404954' });
    const lat = Number(latStr) || 0;
    const lng = Number(lngStr) || 0;
    payload = { lat, lng };
  }

  return { type, payload };
};
