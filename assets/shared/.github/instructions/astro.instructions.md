---
applyTo: "services/web/src/**/*.{astro,ts,tsx,js,jsx,css}"
---

# Astro and frontend instructions

AssetTrack's web UI lives in `services/web/` and uses Astro SSR, React islands, Bootstrap classes, and TypeScript.

## Rules

- Keep pages server-rendered unless a client-side island is already required.
- Prefer Astro components and existing Bootstrap utility classes before adding custom CSS.
- Preserve route paths and page titles unless the task requires a change.
- Use semantic HTML for navigation, main content, headings, forms, tables, and status content.
- Connect every visible form label to its input, select, or textarea with `for` and `id`.
- Prefer accessible names that match the visible text.
- Use links for navigation and buttons for actions.
- Avoid CSS selectors in Playwright tests when role or label locators can express the user behavior.
- Do not hide focus outlines unless you replace them with an equally visible focus style.

## Validation

- Run `npm --prefix services/web run build` for markup, TypeScript, or dependency changes.
- Run `npm run test:e2e` when browser behavior or accessibility tests are affected.
