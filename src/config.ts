// ============================================================
// Visual configuration for the Wi-Fi QR code generator.
// Adjust these values to change the look of the output image.
// ============================================================

import type { StyleConfig } from './types';

export const config = {

  // --- Image Dimensions ---
  imageSize: 1200,            // Total canvas size (px, square)
  maxImageSize: 2400,         // Cap for API/style overrides (DoS prevention)
  qrSize: 850,                // QR code area size (px)
  qrOffsetY: -30,             // Vertical shift of QR code (negative = up)
  qrMargin: 30,               // Inner padding around QR modules

  // --- Colors ---
  colors: {
    background: '#E4E4F4',    // Canvas background (lavender)
    dotsStart: '#2B5A8C',     // QR dot gradient start (dark blue)
    dotsEnd: '#1B6B4A',       // QR dot gradient end (dark green)
    corners: '#2B4C7E',       // Corner marker color (dark navy)
    text: '#3A3A50',          // Password text color
  },

  // --- QR Dot Style ---
  // Options: 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded' | 'square'
  dotsType: 'rounded' as const,

  // Gradient direction in radians (0 = left→right, π/4 = diagonal ↘)
  dotsGradientRotation: Math.PI / 4,

  // --- Corner Markers ---
  // Outer square options: 'square' | 'extra-rounded' | 'dot'
  cornersSquareType: 'extra-rounded' as const,
  // Inner dot options: 'square' | 'dot'
  cornersDotType: 'dot' as const,

  // --- Info Text below QR ---
  showInfoInImage: true,      // Render SSID + password below the QR code
  fontSize: 32,
  fontFamily: '"SF Mono", "Menlo", "Consolas", monospace',
  textTemplateSsid: 'Network: {ssid}',
  textTemplatePassword: 'Password: {password}',

  // --- Output ---
  outputDir: '.',             // Directory for generated images

} as const;

/** Resolved (flat) style values used by qr.ts and image.ts. */
export interface ResolvedStyle {
  imageSize: number;
  qrSize: number;
  qrOffsetY: number;
  qrMargin: number;
  colorBackground: string;
  colorDotsStart: string;
  colorDotsEnd: string;
  colorCorners: string;
  colorText: string;
  dotsType: string;
  dotsGradientRotation: number;
  cornersSquareType: string;
  cornersDotType: string;
  showInfoInImage: boolean;
  fontSize: number;
  fontFamily: string;
  textTemplateSsid: string;
  textTemplatePassword: string;
}

/** Merge optional StyleConfig overrides with the built-in defaults. */
export const resolveStyle = (overrides?: StyleConfig): ResolvedStyle => {
  const s = overrides ?? {};
  const requestedSize = s.imageSize ?? config.imageSize;
  const imageSize = Math.min(
    Math.max(100, Number(requestedSize) || config.imageSize),
    config.maxImageSize,
  );
  return {
    imageSize,
    qrSize: Math.round(imageSize * (config.qrSize / config.imageSize)),
    qrOffsetY: Math.round(imageSize * (config.qrOffsetY / config.imageSize)),
    qrMargin: s.qrMargin ?? config.qrMargin,
    colorBackground: s.colorBackground ?? config.colors.background,
    colorDotsStart: s.colorDotsStart ?? config.colors.dotsStart,
    colorDotsEnd: s.colorDotsEnd ?? config.colors.dotsEnd,
    colorCorners: s.colorCorners ?? config.colors.corners,
    colorText: s.colorText ?? config.colors.text,
    dotsType: s.dotsType ?? config.dotsType,
    dotsGradientRotation: config.dotsGradientRotation,
    cornersSquareType: s.cornersSquareType ?? config.cornersSquareType,
    cornersDotType: s.cornersDotType ?? config.cornersDotType,
    showInfoInImage: s.showInfoInImage === false ? false : (s.showInfoInImage ?? config.showInfoInImage),
    fontSize: config.fontSize,
    fontFamily: config.fontFamily,
    textTemplateSsid: config.textTemplateSsid,
    textTemplatePassword: config.textTemplatePassword,
  };
};
