export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface WifiConfig {
  ssid: string;
  password?: string;
  encryption: WifiEncryption;
  isHidden: boolean;
  outputFile: string;
}

/** QR code content type; left form swaps by type. */
export type QrType = 'wifi' | 'url' | 'text' | 'vcard' | 'email' | 'sms' | 'tel' | 'geo';

/** Visual style overrides sent from the frontend. All fields optional — missing values fall back to defaults in config.ts. */
export interface StyleConfig {
  // Colors
  colorBackground?: string;
  colorDotsStart?: string;
  colorDotsEnd?: string;
  colorCorners?: string;
  colorText?: string;
  // QR dot style
  dotsType?: 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded' | 'square';
  // Corner markers
  cornersSquareType?: 'square' | 'extra-rounded' | 'dot';
  cornersDotType?: 'square' | 'dot';
  // Image dimensions
  imageSize?: number;
  qrMargin?: number;
  // Info text
  showInfoInImage?: boolean;
}
