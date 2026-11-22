# Shuhari Alaihim Amoran: portfolio

A portfolio site with a 3D background, a 3D map of the ExploreNDMU campus routes, and a case study of the app.

Built with Vite, React, TypeScript, Tailwind CSS v4, React Three Fiber and drei, GSAP ScrollTrigger, Lenis and Framer Motion.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ locally
npm run lint
```

Useful URL flags: `?stats` shows an FPS meter, and `?nowebgl` shows the no-WebGL fallbacks.

## Editing content

All text lives in `src/content.ts`, including the profile, projects, skills and the ExploreNDMU case study.
The case-study images and clips are in `public/projects/explorendmu/`. The campus route data is in `src/three/campus.json`.
The CV (an image for the dialog and a PDF to download) is in `public/cv/`, and `profile.cv` in `content.ts` points to it.
The published copy leaves out the phone number, birth date and home address. Keep it that way when you swap in a new CV.

## How it's put together

- `src/App.tsx`: page sections; loads the 3D scene lazily after first paint
- `src/Scene.tsx`: the one WebGL canvas. It's driven from GSAP's ticker right after Lenis scrolls, and it draws the campus map into its page element with a scissor pass
- `src/three/`: the hero core (hover/click reactive) and the campus map
- `src/Transition.tsx`: the wipe animation on long in-page jumps
- `src/ExploreNDMU.tsx`: the case study (gallery with clip dialog, features, how it works)

With `prefers-reduced-motion`, the canvas draws only when something changes, nothing loops, and in-page jumps are instant.

## Deploy

### Vercel (recommended)

1. Push this repository to GitHub.
2. On vercel.com, choose **Add New → Project**, import the repo, and set **Root Directory** to `portfolio`.
   Vercel detects Vite, so the build command (`npm run build`) and output folder (`dist`) are filled in for you.
3. Deploy. Every push to `main` redeploys, and other branches get preview URLs.

### Link previews

`public/og.jpg` (1200×630) is the image shown when the link is shared. Link previews need its full URL, and a build plugin in `vite.config.ts` adds the tags.
On Vercel the project sets `SITE_URL=https://shuhari-dev.vercel.app` (Settings → Environment Variables). Without it, the build falls back to Vercel's production domain. Anywhere else, build with `SITE_URL` set to the site's public address, for example `SITE_URL=https://iamshu21.github.io/portfolio`.
If you change the hero, retake the screenshot at 1200×630.

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
