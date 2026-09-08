# Stillwater Aquarium

Live route: https://www.tagims.com/apps/tank

This is a self-contained, static aquarium. Cloudflare Pages serves the checked-in index.html, static/ bundle, and assets/. There is no iframe, backend service, or dependency on the earlier private ChatGPT Site.

## Edit and build

Install dependencies in this directory with `npm install`, edit src/page.tsx (controls), src/tank.tsx (renderer), or src/globals.css (styles), then run `npm run build`. Commit both the source and updated index.html/static output. The root website's Cloudflare build configuration does not need to change.

Fish and decorations are under assets/. All asset URLs use /apps/tank/assets/ to work with or without the trailing slash. The original photographic assets were generated for Alex's aquarium and processed into transparent cutouts.

Tank preferences are browser-local under stillwater-v1. Preferences from the earlier private Site do not automatically transfer between domains. Fullscreen, audio, and screen wake-lock remain browser-dependent.

Publication uses the existing TAGIMS/tagims-site main to Cloudflare Pages workflow. No Vercel, DNS, billing, or TAGiM app changes are required.
