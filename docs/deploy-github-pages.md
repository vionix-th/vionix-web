# Deploy Vionix from `dist` (Eleventy)

This repository now builds static output with Eleventy into `dist/`.

## Build Commands

```bash
npm install
npm run build
```

Optional local preview of built output:

```bash
npm run serve:dist
```

## GitHub Pages Settings (for Caesar)

1. Open repository settings on GitHub.
2. Go to `Pages`.
3. In `Build and deployment`, set `Source` to `Deploy from a branch`.
4. Select the branch Caesar deploys from.
5. Set folder to `/dist`.
6. Save.

## Release Sequence

1. Update content/templates in `src/`.
2. Run `npm run build`.
3. Commit source changes and generated `dist/` output per Caesar's publishing process.
4. Push the branch configured in GitHub Pages.

## Notes

- `dist/` includes passthrough copies for `assets/`, `CNAME`, `robots.txt`, and `sitemap.xml`.
- `de` and `th` locale structures are scaffolded only; phase 1 publishes English output.
