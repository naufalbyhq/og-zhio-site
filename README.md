# Zhio OG Creator

OpenGraph / Quote / Code image generator for `og.zhio.site` or `quote.zhio.site`.

## What it does

- Generate social-ready images instantly from text, quote, or code input.
- Export preset sizes for Twitter/X, LinkedIn, standard OpenGraph, and blog hero headers.
- Use a visual editor with live preview and one-click PNG download.

## Presets

- `twitter-post` -> 1200x675
- `twitter-card` -> 1200x600
- `linkedin-post` -> 1200x627
- `og-standard` -> 1200x630
- `blog-hero` -> 1920x1080

## Tech stack

- Next.js App Router
- `next/og` (`ImageResponse`) for server-side PNG rendering
- TypeScript + Tailwind CSS

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build and quality checks

```bash
npm run lint
npm run build
```

## Deploy to Vercel

```bash
vercel
vercel --prod
```

After deploy, map your custom domain/subdomain in Vercel:

- `og.zhio.site` (recommended)
- or `quote.zhio.site`

## Main routes

- UI: `/`
- Image API: `/api/image`

Example:

`/api/image?mode=quote&preset=og-standard&theme=midnight&title=Daily%20Quote&author=zhio.site&content=Make%20it%20simple`
