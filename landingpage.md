Here is the full nav typography and CSS spec from `components/Nav.tsx` and `app/globals.css`, with token values resolved so you can replicate it elsewhere.

---

## Font setup (required)

The nav depends on **Garet** (brand) and **JetBrains Mono** (mobile menu toggle only).

```9:29:app/globals.css
@font-face {
  font-family: 'Garet';
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  src: url('/fonts/Garet-Book.woff2') format('woff2'),
       url('/fonts/Garet-Book.woff') format('woff'),
       url('/fonts/Garet-Book.ttf') format('truetype'),
       url('/fonts/Garet-Book.otf') format('opentype');
}
@font-face {
  font-family: 'Garet';
  font-weight: 500 800;
  font-style: normal;
  font-display: swap;
  src: url('/fonts/Garet-Heavy.woff2') format('woff2'),
       url('/fonts/Garet-Heavy.woff') format('woff'),
       url('/fonts/Garet-Heavy.ttf') format('truetype'),
       url('/fonts/Garet-Heavy.otf') format('opentype');
}
```

```7:7:app/globals.css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
```

**Token definitions:**

| Token | Resolved value |
|---|---|
| `--font-body` | `'Garet', system-ui, -apple-system, BlinkMacSystemFont, sans-serif` |
| `--font-mono` | `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace` |
| `--ink` | `#0A0A0A` |
| `--ink-soft` | `#1F1F1F` |
| `--paper` | `#FAFAF7` |
| `--paper-pure` | `#FFFFFF` |
| `--mute-1` | `#E8E8E4` |
| `--ease` | `cubic-bezier(.2, 0, 0, 1)` |
| `--dur-fast` | `80ms` |
| `--shadow-elev` | `0 1px 2px rgba(10,10,10,.06), 0 4px 16px rgba(10,10,10,.04)` |

**Important:** Nav links use `font-weight: 500`, which maps to the **Garet Heavy** file (`font-weight: 500 800` range), not Garet Book.

**Inherited from `html, body`** (applies to nav text unless overridden):

```258:267:app/globals.css
html, body {
  margin: 0;
  padding: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-normal);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

(`--fs-base` = `16px`, `--lh-normal` = `1.45`)

---

## Desktop nav links (`nav.primary a`)

```1324:1326:app/globals.css
nav.primary { display: flex; gap: 28px; }
nav.primary a { font-family: var(--font-body); font-weight: 500; font-size: 13px; color: var(--ink); text-decoration: none; }
nav.primary a:hover { text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 2px; }
```

| Property | Value |
|---|---|
| `font-family` | `'Garet', system-ui, -apple-system, BlinkMacSystemFont, sans-serif` |
| `font-weight` | `500` (Garet Heavy) |
| `font-size` | `13px` |
| `color` | `#0A0A0A` |
| `text-decoration` | `none` |
| `letter-spacing` | not set (inherits `0` / normal) |
| `line-height` | not set (inherits `1.45` from body) |
| `text-transform` | not set (normal) |

**Hover:**

| Property | Value |
|---|---|
| `text-decoration` | `underline` |
| `text-underline-offset` | `6px` |
| `text-decoration-thickness` | `2px` |

**Layout:** `display: flex; gap: 28px` on the `<nav>`.

**Breakpoint:** Hidden at `max-width: 920px`:

```2336:2336:app/globals.css
  nav.primary { display: none; }
```

---

## Mobile drawer nav links (`.hdr-mobile-drawer__nav a`)

```1436:1452:app/globals.css
.hdr-mobile-drawer__nav a {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 15px;
  line-height: 1.3;
  padding: 14px 10px;
  text-decoration: none;
  color: var(--ink);
  border-bottom: 1px solid var(--mute-1);
}
.hdr-mobile-drawer__nav a:last-child {
  border-bottom: none;
}
.hdr-mobile-drawer__nav a:hover {
  text-decoration: underline;
  text-underline-offset: 5px;
  text-decoration-thickness: 2px;
}
```

| Property | Value |
|---|---|
| `font-family` | Garet stack (same as desktop) |
| `font-weight` | `500` |
| `font-size` | `15px` |
| `line-height` | `1.3` |
| `padding` | `14px 10px` |
| `color` | `#0A0A0A` |
| `text-decoration` | `none` |
| `border-bottom` | `1px solid #E8E8E4` (last child: none) |

**Hover:** underline, `text-underline-offset: 5px`, `text-decoration-thickness: 2px`.

---

## Mobile menu toggle (`.hdr-menu-toggle`) — different font

```1336:1349:app/globals.css
.hdr-menu-toggle {
  display: none;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border: 2px solid var(--ink);
  background: var(--paper-pure);
  color: var(--ink);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
}
```

| Property | Value |
|---|---|
| `font-family` | `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace` |
| `font-size` | `11px` |
| `letter-spacing` | `0.1em` |
| `text-transform` | `uppercase` |
| `font-weight` | not set (browser default, typically `400`) |

Visible at `max-width: 920px` (`display: inline-flex`).

---

## Header action button (`.btn` in nav)

```1327:1328:app/globals.css
.btn { display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-body); font-weight: 600; font-size: 13px; padding: 11px 16px; border: 2px solid var(--ink); background: var(--ink); color: var(--paper-pure); cursor: pointer; transition: background .12s var(--ease); }
.btn:hover { background: var(--ink-soft); }
```

| Property | Value |
|---|---|
| `font-family` | Garet stack |
| `font-weight` | `600` (Garet Heavy) |
| `font-size` | `13px` |
| `color` | `#FFFFFF` |
| `background` | `#0A0A0A` |
| `padding` | `11px 16px` |
| `border` | `2px solid #0A0A0A` |

---

## Nav shell / layout CSS (non-typography but needed for a pixel match)

```1317:1323:app/globals.css
.hdr { position: sticky; top: 0; z-index: 20; background: rgba(250,250,247,.93); backdrop-filter: blur(10px); padding: 14px 0; }
.hdr-inner { display: flex; align-items: center; justify-content: space-between; gap: 32px; padding: 14px 22px; border: 3px solid var(--ink); background: var(--paper-pure); }
.lockup { display: flex; align-items: center; gap: 14px; text-decoration: none; }
.lockup img { display: block; width: 40px; height: 40px; }
```

**Mobile adjustments** (`max-width: 920px`):

```2437:2445:app/globals.css
  .hdr-inner {
    gap: 14px;
    padding-left: 16px;
    padding-right: 16px;
  }
  .hdr-menu-toggle {
    display: inline-flex;
    position: relative;
  }
```

**Header height token:** `--hdr-h: 102px` (fallback); measured at runtime via `useScrollEffects.ts`.

**Breakpoints:**
- `≤ 920px` — desktop `nav.primary` hidden, hamburger shown
- `≥ 921px` — mobile drawer `display: none !important`

---

## Copy-paste replication block

```css
/* Fonts */
@font-face {
  font-family: 'Garet';
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  src: url('/fonts/Garet-Book.woff2') format('woff2');
}
@font-face {
  font-family: 'Garet';
  font-weight: 500 800;
  font-style: normal;
  font-display: swap;
  src: url('/fonts/Garet-Heavy.woff2') format('woff2');
}

/* Desktop nav links */
nav.primary {
  display: flex;
  gap: 28px;
}
nav.primary a {
  font-family: 'Garet', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: #0A0A0A;
  text-decoration: none;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
nav.primary a:hover {
  text-decoration: underline;
  text-underline-offset: 6px;
  text-decoration-thickness: 2px;
}

/* Mobile drawer links */
.hdr-mobile-drawer__nav a {
  font-family: 'Garet', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 500;
  font-size: 15px;
  line-height: 1.3;
  color: #0A0A0A;
  text-decoration: none;
}
.hdr-mobile-drawer__nav a:hover {
  text-decoration: underline;
  text-underline-offset: 5px;
  text-decoration-thickness: 2px;
}
```

---

**Note:** The lockup is not text — it is a `40×40` logo image (`/assets/logo-omcoda-nav.png`) plus two decorative CSS bars (`.layout-lock-line`), not a font-based wordmark. If you want a perfect match, copy those assets and the Garet font files from `/public/fonts/` and `/public/assets/`.