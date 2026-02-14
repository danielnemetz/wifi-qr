# qr

Generate styled QR codes as PNG images. **CLI** and **Web** both support the same QR types: Wi‑Fi, URL, text, vCard, email, SMS, phone, location. CLI uses an interactive prompt; web offers a browser UI with live preview and customizable style. Scan with any phone camera to connect or open content. Type-specific logic (data, labels, filename) is shared via `@qr/core` (formerly `src/buildFromPayload.ts`).

![Example QR Code](ExampleSSID.png)

## Setup

```bash
pnpm install
```

## Usage

```bash
pnpm start:cli
```

The script walks you through an interactive prompt:

1. **QR type** — choose one of: Email, Location (geo), SMS, Phone, Text, URL, Contact (vCard), Wi‑Fi
2. **Type-specific fields** — e.g. for Wi‑Fi: SSID, encryption (WPA/WEP/none), password (masked by default); for URL: address; for vCard: name, phone, email, etc.

The output image is saved in the project root (or `outputDir` in config) with a type-specific filename (e.g. `<SSID>.png` for Wi‑Fi, `url.png` or hostname for URL).

### Flags

| Flag          | Description                                               |
| ------------- | --------------------------------------------------------- |
| `--clear-pwd` | Show password in clear text during input instead of `***` |

```bash
pnpm start:cli --clear-pwd
```

## Configuration

All visual settings live in [`packages/core/src/config.ts`](packages/core/src/config.ts):

| Setting                | Default                | Description                                                                                   |
| ---------------------- | ---------------------- | --------------------------------------------------------------------------------------------- |
| `imageSize`            | `1200`                 | Output image size in px (square)                                                              |
| `qrSize`               | `850`                  | QR code area size in px                                                                       |
| `colors.background`    | `#E4E4F4`              | Canvas background color                                                                       |
| `colors.dotsStart`     | `#2B5A8C`              | Dot gradient start (blue)                                                                     |
| `colors.dotsEnd`       | `#1B6B4A`              | Dot gradient end (green)                                                                      |
| `colors.corners`       | `#2B4C7E`              | Corner marker color                                                                           |
| `colors.text`          | `#3A3A50`              | Info text color                                                                               |
| `dotsType`             | `rounded`              | Dot style: `dots`, `rounded`, `extra-rounded`, `classy`, `classy-rounded`, `square`           |
| `cornersSquareType`    | `extra-rounded`        | Outer corner style: `square`, `extra-rounded`, `dot`                                          |
| `cornersDotType`       | `dot`                  | Inner corner style: `square`, `dot`                                                           |
| `showInfoInImage`      | `true`                 | Show info text below the QR code (e.g. SSID/password for Wi‑Fi, URL or phone for other types) |
| `textTemplateSsid`     | `Network: {ssid}`      | Wi‑Fi SSID label template                                                                     |
| `textTemplatePassword` | `Password: {password}` | Wi‑Fi password label template                                                                 |
| `outputDir`            | `.`                    | Output directory for generated images                                                         |

## Web Interface

Browser UI for the same QR types as the CLI, with live preview and customizable style.

- **Run:** `pnpm dev:web` (from project root) or `cd apps/web && pnpm dev`
- **Docs:** See [apps/web/README.md](apps/web/README.md) for routing, QR types, UI, and API.

## Shared logic

The same QR types and generation rules are used by CLI and web. In `@qr/core`: `buildQrPayload(type, payload)` returns the QR data string, label lines for the image, and a safe filename. The API and CLI both call this; the web UI also uses it for the download filename and for type labels/order.

## Tech Stack

**CLI** (`apps/cli`):

- **TypeScript** + **tsx** (direct execution, no build step needed)
- **qr-code-styling-node** — styled QR code generation
- **canvas** — server-side image compositing
- **@inquirer/prompts** — interactive CLI prompts

**Web:** see [apps/web/README.md](apps/web/README.md).
