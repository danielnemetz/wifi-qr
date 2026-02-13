// Polyfill: qr-code-styling-node references the browser global `self`
(globalThis as any).self = globalThis;

import { resolveStyle, type ResolvedStyle } from './config';
import { buildWifiString } from './wifi';
import type { WifiConfig, StyleConfig } from './types';

/**
 * Generates a styled QR code PNG buffer with transparent background.
 */
export const generateQrBuffer = async (cfg: WifiConfig, style?: StyleConfig): Promise<Buffer> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { default: QRCodeStyling } = await import('qr-code-styling-node') as any;
  const nodeCanvas = await import('canvas');
  const s: ResolvedStyle = resolveStyle(style);

  const qrCode = new QRCodeStyling({
    nodeCanvas,
    width: s.qrSize,
    height: s.qrSize,
    data: buildWifiString(cfg),
    margin: s.qrMargin,

    dotsOptions: {
      type: s.dotsType,
      gradient: {
        type: "linear",
        rotation: s.dotsGradientRotation,
        colorStops: [
          { offset: 0, color: s.colorDotsStart },
          { offset: 1, color: s.colorDotsEnd },
        ],
      },
    },

    cornersSquareOptions: {
      type: s.cornersSquareType,
      color: s.colorCorners,
    },

    cornersDotOptions: {
      type: s.cornersDotType,
      color: s.colorCorners,
    },

    backgroundOptions: {
      color: "transparent",
    },

    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 10,
    },
  });

  return await qrCode.getRawData("png");
};
