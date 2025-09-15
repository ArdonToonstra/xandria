# AI Assistant Project Instructions

Purpose: Enable rapid, correct contributions to this Hugo (GoHugo) multi‑language real‑estate listings site using the Ananke theme with local customizations.

## Big Picture
- Static site built with Hugo; root project dir: `xandria/`. Theme dependency: `themes/ananke` (vendored copy present under both `xandria/themes/ananke` and repository root `themes/ananke`; treat the one inside `xandria/themes` as active for overrides).
- Primary customization layer lives in `xandria/layouts` and `xandria/assets` (Hugo's precedence: project > theme). Do NOT edit theme files unless the change must be upstreamed; prefer adding/overriding in project `layouts/` or `assets/`.
- Multilingual: default `nl`, secondary `en`. Config in `xandria/hugo.toml` sets `defaultContentLanguage = 'nl'` and per‑language content dirs (`content/nl`, `content/en`). When adding content, mirror structure across languages where relevant.
- Domain model concept: "Aanbod" (listings of apartments). Custom section templates live in `layouts/aanbod/` with `list.html` (collection page) and `single.html` (detail page) using front matter params: `status`, `price`, `images[]`, optional `features[]`.

## Key Conventions & Patterns
- Image paths in listing front matter are referenced directly and rendered with `relURL`; first image becomes thumbnail in list view.
- Currency formatting is manual: `€{{ .Params.price }}/maand`. Maintain this pattern; do not introduce localization libraries unless spec'd.
- CSS overrides: custom component styles in `assets/css/custom.css`; header template (`layouts/partials/site-header.html`) explicitly links `/css/custom.css`. Extend here for minimal site‑specific styling; avoid editing theme's bundled Tachyons usage.
- Partials: Site header uses a theme helper partial `func/GetFeaturedImage.html` (from theme). When adding new partials, place in `layouts/partials/` and include via `partials.Include` to stay consistent.
- Hugo template style: Uses `compare.Default` (theme utility) rather than `default` to allow more expressive comparisons. Follow existing usage when providing fallbacks.
- Language content organization: Put Dutch originals under `content/nl/...` and English translations under `content/en/...`. Keep slugs consistent to allow language switchers (future enhancement).

## Developer Workflow
- Local dev server (from repo root containing `hugo.toml`): `hugo server` (Windows PowerShell). If it previously failed, verify you are inside `xandria/` directory and that Hugo Extended is installed (required for custom CSS pipeline if expanded later).
- Build output is written to `xandria/public/` (already versioned; consider ignoring large generated artifacts in future changes—avoid manual edits inside `public/`).
- Do not manually commit changes inside `public/` unless intentionally publishing a prebuilt snapshot; prefer letting deployment pipeline (e.g., Netlify) build from source.

## Adding a Listing (Example)
1. Create `content/nl/aanbod/<slug>/index.md` with front matter:
```
---
title: "Eerste Appartement"
status: "Beschikbaar"
price: 950
images: ["/images/listings/apt1/front.jpg", "/images/listings/apt1/living.jpg"]
features: ["2 slaapkamers", "Balkon", "Centrale verwarming"]
---
Beschrijving in het Nederlands.
```
2. (Optional) Add translation under `content/en/aanbod/<slug>/index.md` with matching params translated.
3. Place images under `static/images/listings/apt1/`.

## Safe Extension Points
- Styling: Append rules to `assets/css/custom.css`; keep selectors semantic (e.g., `.listing-card`, `.gallery img`).
- Templates: For new sections mimic `layouts/aanbod/` structure (create `list.html`, `single.html`; wrap main content inside `{{ define "main" }}` block so it slots into theme `baseof.html`).
- Partials injection: Modify header or navigation by editing / adding partials under `layouts/partials/`; avoid direct edits to theme partial copies unless overriding via same relative path.

## Avoid / Pitfalls
- Avoid editing both theme copies; ensure only one authoritative theme directory is used. Prefer cleaning legacy duplicate later.
- Do not hardcode absolute URLs; use `relURL` or `.Permalink` consistently as seen in existing templates.
- Don't introduce JS/CSS bundlers; rely on Hugo Pipes / existing structure unless requirements change.
- Don’t localize currency/status logic ad‑hoc; centralize future formatting via a helper partial if complexity increases.

## When Creating New Content Types
- Add templates under `layouts/<section>/` (both `list.html` and `single.html`) following pattern in `aanbod`.
- Define expected front matter keys; document with an archetype file in `archetypes/` if reused.

## Quick Reference
- Config: `xandria/hugo.toml`
- Custom templates: `xandria/layouts/`
- Custom styles: `xandria/assets/css/custom.css`
- Content roots: `xandria/content/nl`, `xandria/content/en`
- Public output: `xandria/public/` (generated)

Provide changes as minimal diffs, respect Hugo override precedence, and keep multilingual structure aligned.

Feedback welcome: clarify any unclear patterns (e.g., theme duplication strategy, deployment target) before large refactors.
