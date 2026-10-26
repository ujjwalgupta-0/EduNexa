<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## EduNexa interface direction

- Use the warm ivory, amber, and charcoal visual system for every new route and shared component.
- Reuse the tokens and primitives in `app/globals.css`: `ui-page`, `ui-panel`, `ui-primary`, `ui-field`, `ui-eyebrow`, and `ui-page-title`.
- Use `BrandMark` from `app/components/BrandMark.js` for the EduNexa mark. Set `variant="dark"` on dark surfaces; the default variant is for light surfaces.
- Prefer restrained borders, compact rounded panels, clear focus states, and responsive layouts. Keep role-specific content and navigation intact.
