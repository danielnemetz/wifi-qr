export interface ColorScheme {
  background: string
  dotsStart: string
  dotsEnd: string
  corners: string
  text: string
}

type Strategy = 'analogous' | 'complementary' | 'triadic' | 'split-complementary'

/** Random float in [min, max). */
function randRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

/** Pick a random element from an array. */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Wrap a hue value to [0, 360). */
function wrapHue(h: number): number {
  return ((h % 360) + 360) % 360
}

/**
 * Derive 3 harmonious hues from a base hue using a color-theory strategy.
 * Returns [primary, secondary, tertiary].
 */
function computeHues(base: number, strategy: Strategy): [number, number, number] {
  switch (strategy) {
    case 'analogous':
      return [base, wrapHue(base + randRange(25, 40)), wrapHue(base - randRange(25, 40))]
    case 'complementary':
      return [base, wrapHue(base + 180), wrapHue(base + randRange(15, 30))]
    case 'triadic':
      return [base, wrapHue(base + 120), wrapHue(base + 240)]
    case 'split-complementary':
      return [base, wrapHue(base + 150), wrapHue(base + 210)]
  }
}

/**
 * Convert HSL (h: 0-360, s: 0-100, l: 0-100) to a 6-digit HEX string.
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100

  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * Math.max(0, Math.min(1, color)))
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/**
 * Generate a harmonious 5-color scheme for the QR code generator.
 *
 * Uses a random base hue and one of four color-theory strategies
 * (analogous, complementary, triadic, split-complementary) to produce
 * colors that look good together.
 */
export function generateColorScheme(): ColorScheme {
  const baseHue = Math.random() * 360
  const strategy = pickRandom<Strategy>([
    'analogous',
    'complementary',
    'triadic',
    'split-complementary',
  ])
  const [h1, h2, h3] = computeHues(baseHue, strategy)

  return {
    background: hslToHex(h1, randRange(30, 50), randRange(90, 95)),
    dotsStart: hslToHex(h1, randRange(50, 70), randRange(30, 45)),
    dotsEnd: hslToHex(h2, randRange(50, 70), randRange(30, 45)),
    corners: hslToHex(h3, randRange(40, 60), randRange(25, 40)),
    text: hslToHex(h1, randRange(15, 25), randRange(20, 30)),
  }
}
