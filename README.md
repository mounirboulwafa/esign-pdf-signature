# eSign – Signature Creator · Marketing Site

A multilingual marketing website for the **eSign – Signature Creator** iOS app (iPhone & iPad). Plain HTML, CSS, and vanilla JavaScript — no build step, no frameworks, no bundler. Deploys straight to GitHub Pages.

Supported languages: English (default), French, Italian, Portuguese, Spanish, Arabic (RTL), German.

## Files

| File | Purpose |
|---|---|
| `index.html` | Landing page (hero, features, screenshot gallery, FAQ, CTA) |
| `privacy.html` | Privacy policy |
| `support.html` | Support / contact page |
| `style.css` | All styling — CSS custom properties, logical properties for automatic RTL |
| `script.js` | i18n engine, language switcher, carousel, lightbox, scroll reveal |
| `i18n.js` | All translated strings (`translations`) and language display names (`LANGUAGES`) |
| `assets/` | Images actually served by the site |
| `ressources/` | Your raw source assets (App Store screenshot exports, app icon). Not published — see [Assets you don't need to touch](#assets-you-dont-need-to-touch) |

## Deploying on GitHub Pages

1. Push this folder to a GitHub repository (any name).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch", pick your default branch (e.g. `main`) and folder `/ (root)`.
4. Save. GitHub will publish at `https://<username>.github.io/<repo>/` within a minute or two.

No build step is required — it's static files. If you serve from a subpath (a project page rather than a user/org page), no code changes are needed either; all asset paths in the HTML are relative.

**Before you go live**, update the placeholder URLs:
- Replace `https://example.github.io/esign-pdf-signature/` in the `<link rel="canonical">` and `hreflang` tags (and `og:url`) across `index.html`, `privacy.html`, `support.html` with your real GitHub Pages URL.
- Replace `https://apps.apple.com/app/idXXXXXXXXX` and `content="app-id=XXXXXXXXX"` with your real App Store ID once the app is live.

## Assets — what's already in place vs. what to add

### Already populated (real assets, pulled from your `ressources/` folder)
- `assets/icon.png` — app icon (512×512), used as favicon and `apple-touch-icon`.
- `assets/og-image.png` — 1200×630 social-preview image (the app icon padded onto the site's mint background). Replace with a custom design if you want something punchier for link previews.
- `assets/screenshots/en/1.png` … `7.png` — real app screenshots, resized (750px wide) and compressed for web. Mapping used on the page:
  1. Place fields anywhere
  2. Draw your real signature
  3. Type in signature fonts
  4. Photograph real ink
  5. Save & reuse signatures (signatures library)
  6. Keep every document ready (document list)
  7. Screenshot gallery's 7th slot (general sign/overview screen)

### You need to add
- **App Store badges** — `assets/badges/appstore-{lang}.svg` for each of the 7 languages (`appstore-en.svg`, `appstore-fr.svg`, `appstore-it.svg`, `appstore-pt.svg`, `appstore-es.svg`, `appstore-ar.svg`, `appstore-de.svg`). These are **intentionally not included** — Apple's "Download on the App Store" badge artwork is trademarked and must be downloaded from [Apple's marketing resources](https://developer.apple.com/app-store/marketing/guidelines/) in the localized language you need. Until you add them, the site automatically falls back to a styled text badge (see `handleBadgeError` in `script.js`), so nothing is broken in the meantime.
- **Localized screenshots (optional)** — `assets/screenshots/{lang}/1.png` … `7.png` for `fr`, `it`, `pt`, `es`, `ar`, `de`. These are entirely optional: if a file is missing, `script.js` automatically falls back to the English screenshot (`assets/screenshots/en/`). Your `ressources/screenshots_appstore/` folder already has real localized App Store screenshot sets for these languages (plus Arabic-specific and even Japanese/Korean sets) that you can hand-pick from.

  **Heads up:** those locale sets have their **own, independently-localized marketing captions baked directly into the image** — they were designed as standalone App Store Connect submissions, not as literal translations of the English set. For example, the German set leads with "Alle Unterschriften an einem Ort" where the English set's equivalent slot says "Save signatures. Reuse anytime." If you drop those images straight into `assets/screenshots/{lang}/`, the on-page caption (which comes from `i18n.js`, and *is* a faithful translation of the English site copy) may not exactly match the text baked into the screenshot image itself. That's a cosmetic mismatch, not a functional bug — most visitors won't compare the two side by side. If you want a pixel-perfect match, either re-export cleaner screenshots without baked-in captions, or adjust the relevant `alt*`/`gallery.shot*` strings in `i18n.js` to match what's in the image for that language.

### `ressources/` folder
This holds your original source files (`Icon-1024.png`, and `screenshots_appstore/` with per-locale export folders). It's listed in `.gitignore` so it won't be pushed to GitHub Pages — it's meant as your private working library, not a served asset. If you'd rather publish it too (e.g. to keep everything in one repo), just remove the `ressources/` line from `.gitignore`.

## Editing or adding a language

All translated strings live in `i18n.js` as two globals (loaded via a plain `<script>` tag before `script.js` — no build step, no modules):

```js
const LANGUAGES = { en: "English", fr: "Français", /* ... */ };
const translations = {
  en: { "nav.features": "Features", /* ...151 keys... */ },
  fr: { "nav.features": "Fonctionnalités", /* ... */ },
  // ...
};
```

- `LANGUAGES` controls what shows up in the language-switcher dropdown (navbar, mobile menu, footer) — the native name of each language, always shown the same way regardless of the active UI language.
- `translations[code]` is a **flat** key → string map. Every key referenced anywhere in `index.html`, `privacy.html`, or `support.html` via `data-i18n`, `data-i18n-alt`, `data-i18n-aria-label`, or `data-i18n-content` must exist in **every** language's object, or that language will silently fall back to the English string for that key (handled by `script.js`'s `applyTranslations`).

**To edit an existing language:** find its block in `translations` (e.g. `fr: { ... }`) and edit the value for the key you want to change. No other file needs to change.

**To add an 8th language** (example: Japanese, `ja`):
1. In `i18n.js`, add `ja: "日本語"` to `LANGUAGES`.
2. Add a full `ja: { ... }` block to `translations` with every key that exists in `translations.en` (copy the English block as a starting point and translate each value).
3. In the `<head>` of `index.html`, `privacy.html`, and `support.html`, add a matching hreflang tag:
   ```html
   <link rel="alternate" hreflang="ja" href="https://your-site/index.html?lang=ja">
   ```
   (adjust the filename per page).
4. If the new language is right-to-left (like Arabic), add a CSS branch in `style.css` keyed on the language, following the existing Arabic pattern:
   ```css
   html[lang="ja"] { --font-body: 'Your Japanese Font', var(--font-body); }
   ```
   `script.js` already sets `dir="rtl"` automatically for `ar`; if your new language is also RTL, add its code to that check in `setLanguage()`.
5. Optionally add `assets/screenshots/ja/` and `assets/badges/appstore-ja.svg` — both are optional with automatic English fallback.

No other code changes are needed — the language switcher, URL-param handling (`?lang=ja`), and `localStorage` persistence all read from `LANGUAGES`/`translations` automatically.

## Local preview

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. A local server is recommended over double-clicking `index.html` directly — some browsers restrict `localStorage` and other APIs under the `file://` protocol, which can affect language persistence. `?lang=xx` query params work either way.
