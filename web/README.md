# WiFi-QR Web Interface

Browser-based tool for generating styled QR codes. Supports multiple types (Wi‑Fi, URL, text, contact, email, SMS, phone, location) with live preview and customizable style.

## Running

```bash
# From project root
pnpm dev:web

# Or from the web folder
cd web && pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000) by default.

## Production build

```bash
cd web && pnpm build
```

Preview the build: `pnpm preview`.

## QR types

Types are listed in alphabetical order; the first is the default when visiting `/`.

| Type     | Route    | Content / form |
|----------|----------|----------------|
| Email    | `/email` | Email address, optional subject and message → `mailto:...` |
| Location | `/geo`   | Latitude and longitude → `geo:lat,lng` |
| SMS      | `/sms`   | Phone number, optional message → `sms:...?body=...` |
| Phone    | `/tel`   | Phone number → `tel:...` |
| Text     | `/text`  | Plain text (multiline) |
| URL      | `/url`   | Web address |
| Contact (vCard) | `/vcard` | Name, phone, email, optional organization → vCard 3.0 |
| Wi‑Fi    | `/wifi`  | SSID, encryption, password, hidden network → `WIFI:S:...;T:...;P:...;;` |

Minimum required per type: for vCard, at least name, phone, or email; for location, both coordinates; for all others, the respective required field.

## Routing

- **Direct URL:** Visiting e.g. `/url` or `/wifi` loads the page with that type pre-selected.
- **Changing type:** Selecting a type in the dropdown updates the URL (e.g. choosing “URL” → `/url`). Browser back/forward works.
- **Root:** Visiting `/` redirects to the default type (e.g. `/email`).

## UI

- **Left column:** QR type (dropdown) and the form for that type.
- **Center:** Live preview of the generated image and “Download PNG” button.
- **Right column (Style):** Colors (background, dots, corners, text), dot and corner style, image size, padding, “Show info text” option.

After the first generation, changes to content or style trigger automatic re-generation (debounced). Dark mode via the sun/moon button at top right.

## API

`POST /api/generate` expects JSON with:

- **`type`** — one of: `wifi`, `url`, `text`, `vcard`, `email`, `sms`, `tel`, `geo`
- **Type-specific fields** (e.g. `ssid` / `encryption` / `password` / `isHidden` for `wifi`, `url` for `url`, `text` for `text`, etc.)
- Optional **`style`** — overrides for colors, `dotsType`, `cornersSquareType`, `cornersDotType`, `imageSize`, `qrMargin`, `showInfoInImage`

Response: PNG buffer (`Content-Type: image/png`).

## Security

- **No storage:** The API is stateless; entered data (passwords, contacts, URLs, etc.) is only used to generate the PNG and is not stored.
- **Input:** Type and content are validated and bounded (e.g. whitelist of QR types, escaping in vCard/Wi‑Fi strings). `imageSize` is capped (e.g. 2400 px) to prevent abuse via very large images.
- **No auth:** The web interface is intentionally open; when hosted publicly, anyone can generate QR codes. For sensitive environments, restrict access via reverse proxy or use locally only.
- **Dependencies:** Run `pnpm audit` (in root and in `web/`) regularly and address known vulnerabilities.

## Tech stack

- **Nuxt 4** (Vue 3, Vite)
- **Nitro** (API routes, e.g. `/api/generate`)
- **Tailwind CSS v4**, **shadcn-vue** (Reka UI), **lucide-vue-next**
- **@nuxtjs/color-mode** for dark mode
- Shared logic and types from root `src/` (e.g. `composeImageBuffer`, `buildWifiString`, `payloads.ts`)
