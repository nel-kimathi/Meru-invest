# Meru Invest public site redesign

## Round 2 changes (latest)

- **Green-led palette.** Green is the primary colour and gold the secondary.
  Navy is now only a small accent (allocated booths, the County committee
  tone, one stripe tent, a few booth squares). Colours live in the `@theme`
  tokens in `app/globals.css` (`forest`, `ink`, `mint`, `brand`, `gold`,
  `navy`), mirrored in `lib/theme.ts` for WebGL.
- **Logos as-is.** Transparent, trimmed copies are in `public/logos/clean/`.
  There are no white tiles anywhere. The header is a light bar, and logos only
  sit on light surfaces, because the partner logos use dark text.
- **Globe.** The camera now fits the whole sphere and its halo inside the
  canvas at any size, so the edges never cut it off. It also has soft
  lighting, a halo that fades to nothing, and green and gold land.
- **Speakers stage.** Photos are shown untouched: no gold frame and no overlay.
- **New "Your booth is waiting" section** (home and Consumer Fair). Three
  branded tents jump up, unfold and land with a squash and bounce when the
  section scrolls into view, and hop when you hover them.
- **Rotating badge.** The emblem is stacked above the spinning ring on its
  own disc, so it is visible on every badge.
- **Floor plan.** Now uses three.js OrbitControls:
  - Zoom: Ctrl/Cmd + scroll zooms to the cursor (a plain scroll still scrolls
    the page), plus pinch-zoom on touch.
  - Move around: right-drag pans, and you can rotate and tilt.
  - Booths: click a booth to fly to it, or search by booth number.
  - Views: buttons for zoom, rotate, top-down and reset, plus an accessible
    list view.
  - Touch screens: tap to interact, so swiping still scrolls the page.
  - It only renders when something changes.
- **Speed:**
  - Public pages are cached (ISR) instead of being rendered on every request.
    Database reads are cached and tagged, and admin saves refresh them
    straight away (`lib/cache-tags.ts`).
  - three.js and every 3D scene are code-split and only load when you scroll
    near them. The first page load no longer downloads three.js at all.
  - 3D scenes start in an idle callback, pause off screen, and lower their
    resolution on slow devices.
  - Scroll effects run only while scrolling, not on every idle frame.
  - Note: `npm run dev` compiles each page the first time you open it, which
    is slow. Judge speed with `npm run build && npm start`.

Round 2 also edits four admin files, each by one line, to refresh the public
cache: `app/admin/news/actions.ts`, `app/admin/settings/actions.ts`,
`app/admin/booths/booth-actions.ts` and `app/admin/booths/hall-actions.ts`.

Drop-in update for the Next.js app. The admin portal, dashboards, auth logic,
database and server actions are untouched. Every page still reads its copy
from the CMS (Admin Portal). If the database is empty or unreachable, the
pages fall back to the seed content instead of showing a blank screen.

## Apply on Kali

```bash
cd ~/path/to/miiccof-platform          # your project root (has package.json)
unzip -o ~/Downloads/meru-invest-redesign.zip -d .

# old components replaced by the new design
rm -f components/home/africa-globe.tsx components/home/speakers-stage.tsx \
      components/public/brand-carousel.tsx components/public/img-with-fallback.tsx \
      components/public/newsletter-form.tsx components/public/partner-logos.tsx \
      components/public/sponsorship-section.tsx

npm install            # adds "lenis" (smooth scrolling); three is already installed
rm -rf .next && npm run dev
```

## What changed

- **Fonts and theme kept.** The navy, green and gold palette and Bebas Neue
  headings are unchanged. Bebas Neue and Barlow are now actually loaded through
  next/font (before, the CSS referred to them but they never loaded, so
  headings fell back to Impact). Figtree stays for the admin.
- **WebGL (Three.js):**
  - Home hero slideshow with a liquid transition between photos
  - "Data city" behind the statistics: blocks rise on scroll and follow the cursor
  - Clickable globe that traces routes from 10 cities into Meru, with distances
  - 3D speakers stage
  - 3D floor plan on /trade-fair#floor-plan. It reads live halls and booths
    from Booth Management, and shows a sample layout until booths exist
  - Flowing silk background on the CTA and the login/register pages
- **Statistics:** a bento grid with rolling numbers. Each tile has its own mini
  visual (partner logos, sector chips, day tiles, a booth grid).
- **Layouts:** full-bleed photo heroes and bands, splits in different
  proportions (60/40, 35/65, 45/55, 30/70), and photos cut into arch, leaf,
  tab, circle, notch and wedge shapes.
- **Other additions:** expanding sector panels, a photo that grows to full
  screen as you scroll, a list where a photo follows the cursor, an
  interactive delegate pass, programme day tabs, committee filters, FAQ
  search, news category filters, a mega menu, and a full-screen mobile menu.
- **Removed on purpose:** long dashes (CMS text is cleaned automatically by
  `lib/text.ts`), decorative underlines and bars, and pulsing or glowing dots.
- **Fixed along the way:**
  - Nav links pointed at pages that don't exist (/events, /speakers, /packages,
    /media). They now go to real pages.
  - The hero pointed at /images/home/*, which doesn't exist.
  - The programme calendar showed December 2026. It now uses EVENT.start
    (February 2027).

## Keeping images crisp

- Every photo goes through `components/site/photo.tsx`, which uses next/image.
  That gives you AVIF/WebP, the right size for each screen, and quality 85
  (90 on heroes). The photo fades in at its real size, with no blur-up or
  zoom, so the final frame is sharp.
- WebGL textures are also requested through the image optimiser, at the size
  the canvas needs. The hero renders at 2x pixel density with no zoom or blur
  at rest.
- Parallax moves in whole pixels only, so images don't go soft while scrolling.
- **The current photos are the limit.** They are 1200 to 1600px wide, so
  full-screen they are slightly upscaled on large monitors. For pin-sharp
  results replace them with:
  - hero and full-bleed photos at 2400 to 3200px wide
  - split photos at 1600px or more
  - portraits at 900 x 1200 or more (several committee photos are only 300 to 400px)
- All default photo paths live in `lib/media.ts`. Sector photos live in
  `lib/event.ts`; Tourism, Energy and Real Estate show branded artwork until
  you add a photo.

## Edit points

| What | Where |
|---|---|
| Hero slides | `lib/media.ts` (`HERO_SLIDES`); the CMS home hero image becomes slide 1 |
| Stats numbers | `lib/event.ts` (`STATS`, `MERU_FACTS`) |
| Sectors | `lib/event.ts` (`SECTORS`) |
| Nav | `lib/event.ts` (`NAV`) |
| Event dates and venue | `lib/event.ts` (`EVENT`) |
| Page copy | Admin Portal (falls back to `lib/default-content.ts`) |
