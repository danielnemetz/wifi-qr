# wifi-qr

Generate styled QR codes as PNG images. **CLI:** Wi‑Fi only (interactive prompt). **Web:** Wi‑Fi, URL, text, vCard, email, SMS, phone, location — with live preview and customizable style. Scan with any phone camera to connect or open content.

![Example QR Code](ExampleSSID.png)

## Setup

```bash
pnpm install
```

## Usage

```bash
pnpm start
```

The script walks you through an interactive prompt:

1. **SSID** -- your network name
2. **Encryption** -- choose between WPA/WPA2/WPA3, WEP, or open (arrow keys)
3. **Password** -- masked input by default

The output image is saved as `<SSID>.png` in the project root.

### Flags

| Flag | Description |
|------|-------------|
| `--clear-pwd` | Show password in clear text during input instead of `***` |

```bash
pnpm start --clear-pwd
```

## Configuration

All visual settings live in [`src/config.ts`](src/config.ts):

| Setting | Default | Description |
|---------|---------|-------------|
| `imageSize` | `1200` | Output image size in px (square) |
| `qrSize` | `850` | QR code area size in px |
| `colors.background` | `#E4E4F4` | Canvas background color |
| `colors.dotsStart` | `#2B5A8C` | Dot gradient start (blue) |
| `colors.dotsEnd` | `#1B6B4A` | Dot gradient end (green) |
| `colors.corners` | `#2B4C7E` | Corner marker color |
| `colors.text` | `#3A3A50` | Info text color |
| `dotsType` | `rounded` | Dot style: `dots`, `rounded`, `extra-rounded`, `classy`, `classy-rounded`, `square` |
| `cornersSquareType` | `extra-rounded` | Outer corner style: `square`, `extra-rounded`, `dot` |
| `cornersDotType` | `dot` | Inner corner style: `square`, `dot` |
| `showInfoInImage` | `true` | Show SSID and password as text below the QR code |
| `textTemplateSsid` | `Network: {ssid}` | SSID text template |
| `textTemplatePassword` | `Password: {password}` | Password text template |
| `outputDir` | `.` | Output directory for generated images |

## Web Interface

Browser UI for generating styled QR codes (Wi‑Fi, URL, text, contact, email, SMS, phone, location) with live preview and customizable style.

- **Run:** `pnpm dev:web` (from project root) or `cd web && pnpm dev`
- **Docs:** See [web/README.md](web/README.md) for routing, QR types, UI, and API.

## Tech Stack

**CLI** (this repo):

- **TypeScript** + **tsx** (direct execution, no build step needed)
- **qr-code-styling-node** — styled QR code generation
- **canvas** — server-side image compositing
- **@inquirer/prompts** — interactive CLI prompts

**Web:** see [web/README.md](web/README.md).
