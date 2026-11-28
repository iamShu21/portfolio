# Shuhari Alaihim Amoran: portfolio

A calm, single-column portfolio with a light and dark theme, numbered sections, and an ExploreNDMU case study. It has four extras:

- **Where to? (⌘K / Ctrl+K, or `/`)**: a command palette framed like ExploreNDMU's "Navigate here". Pick a section and the page walks you there with gold arrows and a metre countdown, then says "You have arrived". It also runs actions such as copying the email or opening the CV, and answers common questions.
- **Walk to NDMU (AR)**: on a phone, the camera shows your floor with gold arrows on it, pointing at the real NDMU campus from wherever you are, with spoken turns. On campus it says "You have arrived".
- **Now strip**: your local time in Esperanza with a guess at what you're doing, what you're learning, and your latest public GitHub push.
- **X-ray mode (X)**: outlines each part of the page with a note on how it's built, plus live numbers for what the page cost the browser.

Built with Vite, React 19, TypeScript and Tailwind CSS v4. Beyond React it adds no UI kit and no animation library: it uses native `<dialog>`, CSS scroll-driven animations, SVG/SMIL and the View Transitions API.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check, build, then pre-render the page into dist/index.html
npm run preview    # serve dist/ locally
npm run lint
```

## Editing content

All text lives in `src/content.ts`:
- the profile (with `status`, `stats` and an optional square `photo` in `public/`)
- projects
- the ExploreNDMU case study
- the journey timeline
- skills
- the Now strip (`now`)
- the wayfinder's canned answers (`answers`)

The case-study images and clips are in `public/projects/explorendmu/`. The campus route data is in `src/data/campus.json`.
The CV (an image for the dialog and a PDF to download) is in `public/cv/`, and `profile.cv` in `content.ts` points to it.
The published copy leaves out the phone number, birth date and home address. Keep it that way when you swap in a new CV.

## How it's put together

- `src/App.tsx`: the page; sections live in `src/sections/`
- **Pre-rendering**: `npm run build` also renders the page to HTML in Node (`src/entry-server.tsx` → `scripts/prerender.mjs`), so search engines, link previews and visitors without JavaScript get the full content. The browser then hydrates it (`src/main.tsx`). Anything that reads `window`, `document` or `navigator` must do it in an effect, an event handler, or a `useSyncExternalStore` with a server snapshot. See `useIsMac` and the Now strip clock
- `src/index.css`: colour tokens for both themes (every text colour passes WCAG AA), entrance animations, wayfinder and X-ray styles
- `src/theme.ts` + `index.html`: the theme is set before first paint, follows the system until you pick one, and the switch grows out of the toggle
- `src/features/Wayfinder.tsx`: the ⌘K palette (native `<dialog>` + ARIA combobox) and the guided walk
- `src/features/NowStrip.tsx`: the clock and the latest push. The push comes from `virtual:latest-push`, a plugin in `vite.config.ts` that calls the GitHub API **once per build**, so visitors never do
- `src/features/ArWalk.tsx` + `arDraw.ts` + `src/lib/geo.ts`: **Walk to NDMU**. ExploreNDMU's gold arrows run in the visitor's browser and point to the real campus (`ar.target` in content.ts) from wherever they are. On phones it uses the camera, compass and GPS, and the app's voice speaks the turns (Web Speech). On laptops it falls back to a floor grid that you turn by dragging or with ← →. Nothing leaves the device
- `src/features/RouteMap.tsx`: the 60 surveyed campus walks as SVG, with chevrons walking the featured route
- `src/features/Xray.tsx` + `src/xray.ts`: X-ray mode. Add a `data-xray="Name · how it's built"` attribute to any element to label it
- `src/ExploreNDMU.tsx`: the case study (gallery with clip dialog, features, how it works)

With `prefers-reduced-motion` there are no entrance animations, the map's chevrons stand still, and wayfinder jumps are instant.

### Latest GitHub push

The build asks GitHub for your newest public push without a token, and that shared limit is 60 requests an hour.
On Vercel, add a `GITHUB_TOKEN` environment variable (a fine-grained token with no extra permissions is enough) so builds never hit the limit.
If the request fails, the build still succeeds and the "pushed" line is simply hidden. Pushes to private repos never show.

## Deploy

### Vercel (recommended)

1. Push this repository to GitHub.
2. On vercel.com, choose **Add New → Project**, import the repo, and set **Root Directory** to `portfolio`.
   Vercel detects Vite, so the build command (`npm run build`) and output folder (`dist`) are filled in for you.
3. Deploy. Every push to `main` redeploys, and other branches get preview URLs.

### Link previews

`public/og.jpg` (1200×630) is the image shown when the link is shared. Link previews need its full URL, and a build plugin in `vite.config.ts` adds the tags.
On Vercel the project sets `SITE_URL=https://shuhari-dev.vercel.app` (Settings → Environment Variables). Without it, the build falls back to Vercel's production domain. Anywhere else, build with `SITE_URL` set to the site's public address, for example `SITE_URL=https://iamshu21.github.io/portfolio`.
If you change the hero, make a new 1200×630 image to match.

### GitHub Pages

The site needs to know the path it's served from:

| Repo name | URL | Build with |
| --- | --- | --- |
| `<user>.github.io` | `https://<user>.github.io/` | nothing extra |
| anything else, e.g. `portfolio` | `https://<user>.github.io/portfolio/` | `BASE_PATH=/portfolio/` |

Add `.github/workflows/deploy.yml` at the **repository root** (one level above this folder):

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    defaults:
      run:
        working-directory: portfolio
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: portfolio/package-lock.json
      - run: npm ci
      - run: npm run build
        env:
          BASE_PATH: / # use /<repo>/ for a project site
          SITE_URL: https://<user>.github.io # add /<repo> for a project site
      - uses: actions/upload-pages-artifact@v3
        with:
          path: portfolio/dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

Then in the repo go to **Settings → Pages → Source** and choose **GitHub Actions**.
