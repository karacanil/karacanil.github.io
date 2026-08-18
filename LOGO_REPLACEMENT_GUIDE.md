# The Working Set: Custom Logo and Icon Guide

This guide explains how to replace the temporary **WS** monogram with a future
custom logo across:

1. The browser favicon
2. The navbar wordmark
3. The About page logo panel

It is written for the current structure of
`karacanil/karacanil.github.io` and should be used together with
`ARTICLE_MANAGEMENT.md` for validation and deployment conventions.

## Current design compatibility

The current design supports a custom logo without a structural redesign.

| Location | Current implementation | Readiness |
| --- | --- | --- |
| Favicon | `/public/favicon-ws.svg`, configured in `app/layout.tsx` | Ready; replace with a new versioned favicon asset |
| Navbar | A 40×40 `.wordmark-mark` containing the text `WS` | Ready; replace the text with a responsive image/component |
| About page | A large `.portrait-terminal` containing an outlined `WS` | Ready; replace the letters while preserving the panel and corner decoration |
| Mobile navbar | Keeps the 40×40 mark and hides the long text below 560 px | Already compatible with a square logo mark |
| Dark mode | The temporary mark uses site color variables | Compatible if the logo is theme-neutral or light/dark variants are supplied |

The current layout is best suited to a **square or nearly square symbol**. A
wide logo can still be used, but it should be treated as a separate lockup; do
not squeeze a wide wordmark into the 40×40 navbar or favicon spaces.

## Recommended asset system

A professional logo package should contain a reusable mark and, optionally, a
wide lockup:

```text
public/
├── brand/
│   ├── working-set-mark.svg
│   ├── working-set-mark-dark.svg       # optional
│   └── working-set-lockup.svg          # optional wide logo
├── favicon-logo-v1.svg
└── apple-touch-icon.png                # optional, recommended
```

Use the assets as follows:

| Asset | Intended use |
| --- | --- |
| `working-set-mark.svg` | Navbar and About page |
| `working-set-mark-dark.svg` | Optional alternate for dark mode |
| `working-set-lockup.svg` | Optional future use where a wide logo fits |
| `favicon-logo-v1.svg` | Firefox, Chrome, and other browser tabs |
| `apple-touch-icon.png` | iOS home-screen bookmarks |

The filename `favicon-logo-v1.svg` is intentionally versioned. Browsers cache
favicons unusually aggressively. If the favicon design changes later, use a new
name such as `favicon-logo-v2.svg` and update the metadata URL.

## 1. Prepare the logo files

### Master mark requirements

Prefer SVG for the main logo mark because it remains sharp at every display
size. The SVG should have:

- A square `viewBox`, preferably `0 0 512 512` or `0 0 1024 1024`
- No embedded bitmap unless it is genuinely required
- No external fonts, stylesheets, scripts, or linked resources
- Text converted to vector outlines
- A transparent background unless the background is part of the logo
- Enough internal padding that the design does not touch its canvas edges
- Simple shapes that remain recognizable at 40×40 pixels

Example SVG shell:

```svg
<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" role="img">
  <title>The Working Set</title>
  <!-- Vector logo paths go here. -->
</svg>
```

Remove editor metadata and unused groups before adding the file to the site.
Tools such as SVGOMG or SVGO can reduce the file, but always compare the result
visually with the original.

### Favicon requirements

The favicon should be derived from the logo mark, not from a wide wordmark.
Test it at its real display sizes: 16×16, 24×24, and 32×32 pixels.

At favicon scale:

- Remove fine lines and tiny text.
- Increase gaps between shapes.
- Prefer a strong silhouette and high contrast.
- Keep important details away from the outside edge.
- Use an opaque background if the symbol becomes unclear on arbitrary browser
  themes.

It is normal for the favicon to be a simplified version of the main logo.

### Apple touch icon requirements

For an iOS home-screen icon, export a 180×180 PNG:

```text
public/apple-touch-icon.png
```

Do not rely on transparency for this version; iOS applies its own rounded mask.
Include the desired background and enough safe-area padding in the PNG itself.

## 2. Add the assets to the repository

Create the brand directory if necessary and copy in the prepared files:

```bash
mkdir -p public/brand
cp /path/to/working-set-mark.svg public/brand/working-set-mark.svg
cp /path/to/favicon-logo-v1.svg public/favicon-logo-v1.svg
cp /path/to/apple-touch-icon.png public/apple-touch-icon.png
```

The last command is optional. Files inside `public` are served from the site
root, so these paths become:

```text
/brand/working-set-mark.svg
/favicon-logo-v1.svg
/apple-touch-icon.png
```

Use lowercase filenames with hyphens. Do not add spaces or version query
strings to asset paths.

## 3. Create one reusable brand-mark component

The navbar and About page should share a component so they cannot accidentally
drift to different logo files later.

Create `app/components/brand-mark.tsx`:

```tsx
import Image from "next/image";

type BrandMarkProps = {
  alt?: string;
  className?: string;
  priority?: boolean;
};

export function BrandMark({
  alt = "",
  className,
  priority = false,
}: BrandMarkProps) {
  return (
    <Image
      alt={alt}
      className={className}
      height={512}
      priority={priority}
      src="/brand/working-set-mark.svg"
      width={512}
    />
  );
}
```

The 512 values describe the SVG's aspect ratio and intrinsic dimensions; CSS
still controls its displayed size. If the master SVG uses a different aspect
ratio, adjust `width` and `height` accordingly.

`next.config.ts` already uses `images.unoptimized: true`, which is compatible
with the site's static GitHub Pages export.

## 4. Replace the navbar monogram

Open `app/components/site-chrome.tsx` and add:

```tsx
import { BrandMark } from "./brand-mark";
```

In `Wordmark`, replace:

```tsx
<span className="wordmark-mark">WS</span>
```

with:

```tsx
<span className="wordmark-mark" aria-hidden="true">
  <BrandMark className="wordmark-logo" priority />
</span>
```

The image is decorative here because the enclosing link already has the
accessible label `The Working Set home`. This prevents screen readers from
announcing the brand twice.

Then update the relevant rules in `app/globals.css`:

```css
.wordmark-mark {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  flex: 0 0 40px;
}

.wordmark-logo {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}
```

Remove the temporary text-specific properties from `.wordmark-mark`:

```css
color
background
font
letter-spacing
clip-path
```

Keep `clip-path` only if the new logo is explicitly designed to be clipped into
the current cut-corner shape. Otherwise it can crop the real logo unexpectedly.

The current mobile rule hides `.wordmark-copy` below 560 px but retains the
40×40 mark, so no additional mobile markup is required.

## 5. Replace the About page monogram

Open `app/about/page.tsx` and add:

```tsx
import { BrandMark } from "../components/brand-mark";
```

Inside `.portrait-terminal`, replace:

```tsx
<b>WS</b>
```

with:

```tsx
<BrandMark
  alt="The Working Set logo"
  className="about-brand-logo"
/>
```

Keep the four `.corner` elements. They are part of the terminal-style panel and
already respond well on mobile.

Replace the `.portrait-terminal b` rule in `app/globals.css` with:

```css
.about-brand-logo {
  width: min(66%, 220px);
  height: auto;
  display: block;
  object-fit: contain;
}
```

At the existing mobile breakpoint, add a smaller maximum if necessary:

```css
@media (max-width: 560px) {
  .about-brand-logo {
    width: min(62%, 185px);
  }
}
```

Delete or update the old mobile rule:

```css
.portrait-terminal b { font-size: 85px; }
```

It only applies to the temporary letters and serves no purpose after the logo
component replaces them.

## 6. Replace the favicon

Open `app/layout.tsx`. Replace the current `icons` configuration with:

```tsx
icons: {
  icon: [{ url: "/favicon-logo-v1.svg", type: "image/svg+xml" }],
  shortcut: "/favicon-logo-v1.svg",
  apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
},
```

If no Apple touch icon was created, omit the `apple` line.

Changing the URL from `/favicon-ws.svg` to `/favicon-logo-v1.svg` is important:
it makes browsers request the new image rather than keep showing the cached
temporary favicon.

The old `public/favicon-ws.svg` can be removed after the new favicon has been
deployed and verified:

```bash
git rm public/favicon-ws.svg
```

## 7. Handle light and dark mode

The easiest option is one logo that remains clear against both the site's light
and dark surfaces. A logo with its own dark background and light symbol usually
works well for this design.

If two variants are required, place both in `public/brand` and render them from
`BrandMark`:

```tsx
return (
  <span className={className}>
    <Image
      alt={alt}
      className="brand-image brand-image-light"
      height={512}
      src="/brand/working-set-mark.svg"
      width={512}
    />
    <Image
      alt={alt}
      className="brand-image brand-image-dark"
      height={512}
      src="/brand/working-set-mark-dark.svg"
      width={512}
    />
  </span>
);
```

Add theme rules:

```css
.brand-image { width: 100%; height: 100%; object-fit: contain; }
.brand-image-dark { display: none; }

[data-theme="dark"] .brand-image-light { display: none; }
[data-theme="dark"] .brand-image-dark { display: block; }
```

When two images represent the same logo, only one should have meaningful alt
text—or the containing element should carry the accessible label—to avoid
duplicate announcements. Test the initial page load for flashing between logo
variants.

An inline SVG component is another option when logo colors need to follow CSS
variables such as `currentColor`. An SVG loaded through `<img>` or `Image`
cannot inherit `currentColor` from its parent page.

## 8. Preview and validate

Update your local branch before beginning:

```bash
git switch master
git pull origin master
git switch -c brand/custom-logo
```

Start the development site:

```bash
npm ci
npm run dev
```

Check all of the following in both light and dark mode:

- Desktop navbar at normal and very wide widths
- Mobile navbar below 560 px
- Navbar alignment beside the theme and hamburger buttons
- About page at desktop, tablet, and phone widths
- Logo sharpness on normal and high-density displays
- Logo contrast in every theme
- Visible focus state and accessible home-link label
- Favicon at 16×16 and 32×32
- iOS touch icon, if provided

Then run the full project checks:

```bash
npm run lint
npm run typecheck
npm run build
```

Inspect the static output if desired:

```bash
rg "favicon-logo-v1|apple-touch-icon" out/index.html
```

The output should reference the new files, and the corresponding assets should
exist inside `out`.

## 9. Commit and deploy

Review exactly what will be published:

```bash
git status
git diff
```

Stage the relevant files explicitly:

```bash
git add app/components/brand-mark.tsx
git add app/components/site-chrome.tsx
git add app/about/page.tsx
git add app/layout.tsx
git add app/globals.css
git add public/brand/working-set-mark.svg
git add public/favicon-logo-v1.svg
git add public/apple-touch-icon.png
```

Omit paths for optional assets that were not created. Commit and push the
branch:

```bash
git commit -m "Add The Working Set custom logo"
git push -u origin brand/custom-logo
```

Open a pull request into `master`. Review the visual changes, then merge it.
The merge triggers the existing **Deploy The Working Set** GitHub Actions
workflow automatically.

After the workflow succeeds, verify:

```text
https://karacanil.github.io/
https://karacanil.github.io/about/
https://karacanil.github.io/favicon-logo-v1.svg
```

Firefox may continue showing a previous tab icon until the page is reopened.
Because the procedure uses a new favicon filename, closing the tab and opening
the site again should be sufficient. A hard refresh or private window can be
used for final confirmation.

## 10. Roll back safely

If the new logo causes a problem after deployment, revert the logo commit:

```bash
git switch master
git pull origin master
git revert <custom-logo-commit-sha>
git push origin master
```

This creates a normal, auditable rollback commit and starts another Pages
deployment. Do not use `git reset --hard` on the shared `master` branch.

## Final replacement checklist

- [ ] Square master mark supplied as a clean SVG.
- [ ] Text converted to outlines; no external fonts or scripts.
- [ ] Simplified favicon tested at 16×16 and 32×32.
- [ ] Optional 180×180 Apple touch icon exported with its own background.
- [ ] Assets placed under `public/brand` and `public`.
- [ ] Shared `BrandMark` component created.
- [ ] Navbar `WS` text replaced without changing its accessible home label.
- [ ] About-page `WS` placeholder replaced while preserving the panel layout.
- [ ] Temporary text-only CSS removed.
- [ ] `app/layout.tsx` points to a newly named favicon asset.
- [ ] Light and dark themes tested.
- [ ] Desktop, tablet, and mobile layouts tested.
- [ ] Lint, typecheck, and production build pass.
- [ ] Pull request reviewed and merged.
- [ ] GitHub Pages deployment succeeds.
- [ ] Live navbar, About page, and favicon verified.

