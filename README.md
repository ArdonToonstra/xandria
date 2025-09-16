# Xandria Huisvesting — Static Site (Hugo)

Xandria is a small multilingual static site built with Hugo (Ananke theme) used to list rental apartments and related services.

## Quick Overview
- Framework: Hugo (GoHugo)
- Theme: Ananke (vendored copy in `themes/ananke`)
- Repo root for Hugo site: `xandria/`
- Default language: Dutch (`nl`) — content in `content/nl`; English translations in `content/en`

## Run locally
1. Make sure Hugo Extended is installed.
2. From the repository root run:

```powershell
cd xandria
hugo server
```

Open `http://localhost:1313` (or the port printed by Hugo).

## Important project structure
- `xandria/hugo.toml` — site configuration
- `xandria/content/` — content (language subfolders `nl`, `en`)
- `xandria/layouts/` — project-specific template overrides and partials
- `xandria/assets/css/custom.css` — custom styling
- `xandria/layouts/partials/site-footer.html` — project footer
- `xandria/layouts/partials/carousel-scripts.html` — Flickity + initialization

## Recent Refactors & Notes
- The `aanbod` section was renamed to `te-huur` to better reflect the site's URLs and content. When creating or migrating content, place listing pages under `content/nl/te-huur/<slug>/index.md`.
- Homepage (`layouts/index.html`) now displays up to 3 listings. It selects randomly from listings with `status = "Beschikbaar"` first, then fills from other listings if fewer than 3 are available.
- Carousel behavior is handled via Flickity; initialization code lives in `layouts/partials/carousel-scripts.html`. Custom nav buttons are used in the template — avoid double initialization.
- Footer is implemented as a partial with maintainable CSS rules in `assets/css/custom.css`.

## Adding a Listing
Create a new listing markdown file under `content/nl/te-huur/<slug>/index.md` with front matter similar to existing listings (see `content/nl/te-huur/tweede-appartement.md`). Required fields used in templates:
- `title`, `status` (e.g., `Beschikbaar`), `price`, `images` (array)
- Optional: `surface`, `rooms`, `bedrooms`, `garden`, `balcony`, `features[]`, `address`, etc.

## Admin / CMS
- The Decap (Netlify) admin config lives in `static/admin/config.yml`. It was updated to point to `content/te-huur`.

## Contact Form
- A reusable contact form is implemented in `layouts/partials/contact-form.html`.
- It can be embedded into any content page using the `{{< contact-form >}}` shortcode.
- The form submits data to a Google Apps Script web app via an AJAX request handled by `static/js/contact-form.js`.
- **Configuration**:
    - The Apps Script URL must be set in `hugo.toml` under `params.contactScriptURL`.
    - For security, a secret token can be passed to the script via the `CONTACT_FORM_SECRET` environment variable. The build configuration in `hugo.toml` is set up to allow Hugo to access this variable.

## Styling
- Keep site-specific styles in `assets/css/custom.css`. If you need to override theme styles, add specific selectors here.

## If Something Breaks
- Check the site builds locally with `hugo server` from `xandria/`.
- Check `layouts/partials/carousel-scripts.html` if carousels misbehave — double initialization or missing scripts are common causes.
- The `public/` folder contains generated output — do not manually edit it; let the build pipeline generate it.

## Want changes?
- To change the number of homepage listings, modify the selection limit in `layouts/index.html` (currently set to 3).
- To change the `/te-huur` slug back to `aanbod`, rename the folder and update templates and `static/admin/config.yml` accordingly.

---

If you want, I can:
- Add a site param for the homepage item count and read it in `layouts/index.html`.
- Add a daily stable selection (cache random seed per-day) instead of shuffling on every load.
- Create an `archetypes/` archetype for listings to make adding them easier.
