# Deploying the Xandria Hugo site to Firebase Hosting (Google Cloud Storage)

This document is an implementation plan for deploying the Hugo site located in the `xandria/` subdirectory to Firebase Hosting (backed by Google Cloud Storage). It includes step-by-step commands (PowerShell), configuration examples, CI/CD workflow, and a short migration plan if you choose to flatten the repository so the Hugo site lives at the repository root.

---

## Overview

Goals:
- Build the Hugo site and deploy static output (`public/`) to Firebase Hosting.
- Set up CI/CD (GitHub Actions) to deploy on pushes to a branch (e.g. `develop`).
- Optionally simplify repository layout by moving the Hugo site out of `xandria/` into the repo root.

Assumptions:
- You have a Firebase project with a unique project ID (see Firebase Console).
- Hugo Extended is installed locally and available on PATH.
- Node.js + npm are installed for `firebase-tools`.
- You have admin access to the GitHub repository for adding secrets.

---

## Quick Commands (PowerShell)

Install Firebase CLI and sign in:

```powershell
npm install -g firebase-tools
firebase login
firebase --version
```

Build Hugo (from repo root, site in `xandria/`):

```powershell
hugo -s xandria -d xandria/public --gc --minify
```

Initialize Firebase Hosting (interactive):

```powershell
firebase init hosting
# Choose existing project -> select your Firebase project
# For "public" directory enter: xandria/public
# Do not overwrite index.html when prompted
```

Deploy to Firebase manually:

```powershell
firebase deploy --only hosting
# or, if you set a target name: firebase deploy --only hosting:xandria-site
```

---

## Example `firebase.json` (starter)

Place this at the repository root (or let `firebase init` create and adapt it):

```json
{
  "hosting": [
    {
      "target": "xandria-site",
      "public": "xandria/public",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "cleanUrls": true,
      "trailingSlash": false,
      "headers": [
        {
          "source": "/css/**",
          "headers": [
            { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
          ]
        },
        {
          "source": "/js/**",
          "headers": [
            { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
          ]
        }
      ]
    }
  ]
}
```

Adjust `public` if you later flatten the repo (see migration notes below).

---

## GitHub Actions (CI) Example

Create `.github/workflows/firebase-hosting-deploy.yml` with the following content. It builds Hugo from `xandria/` and then deploys using the Firebase action and a service account JSON stored in a secret.

```yaml
name: Deploy to Firebase Hosting
on:
  push:
    branches:
      - develop

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '0.114.0'
      - name: Install dependencies
        run: npm ci
      - name: Build Hugo site
        run: hugo -s xandria -d xandria/public --minify
      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: '${{ secrets.FIREBASE_PROJECT_ID }}'
```

Secrets to add in GitHub:
- `FIREBASE_SERVICE_ACCOUNT` — the raw JSON contents of the service account key (do NOT commit the JSON file).
- `FIREBASE_PROJECT_ID` — your Firebase project id.

---

## Create a Firebase Service Account (for CI)

1. In the Google Cloud Console (or Firebase Console), open IAM & Admin → Service Accounts.
2. Create a new service account (name: `firebase-hosting-deploy`).
3. Grant minimal roles required for hosting deploys, e.g. `Firebase Hosting Admin` (or `Firebase Admin` + `Storage Admin`).
4. Create a JSON key and download it.
5. Store the JSON key contents in the GitHub repo secret `FIREBASE_SERVICE_ACCOUNT` and set `FIREBASE_PROJECT_ID`.

Security note: keep the key secret; prefer a dedicated, minimized privilege service account.

---

## Caching & Headers

Set long cache TTL for fingerprinted assets (css/js/images) and shorter TTL for HTML pages. Example entries are included in the `firebase.json` example above.

---

## Optional: Custom Domain

Add your custom domain from the Firebase Console → Hosting → Connect domain. Follow DNS provider instructions; Firebase provisions TLS automatically.

---

## Migration: Should you move `xandria/` contents to the repository root?

Short answer: Yes — it's often smarter to flatten the repo so the Hugo site lives at the repository root, but there are trade-offs.

Pros:
- Simpler CLI commands and CI scripts (no `-s xandria` or `xandria/public` paths).
- Decap (Netlify) CMS and other tools expect content at repository root which avoids path confusion (we saw that earlier).
- `firebase init` and other tooling will default to `public` rather than `xandria/public`.
- Easier contributor onboarding and fewer relative-path bugs.

Cons:
- You must carefully move files to preserve history and avoid collisions with existing root files (like `README.md`).
- Some repository-level files (global README, license, other non-site files) may need to be reorganized to avoid being mixed with site content.
- Requires updating several configs: `static/admin/config.yml` (Decap paths), `firebase.json`, `.firebaserc`, CI workflows, build scripts, any external automation/shell scripts.

Recommended migration steps (safe, with git history preserved):

1. Create a migration branch:

```powershell
git checkout -b flatten-root
```

2. Move files with `git mv` (PowerShell-friendly approach):

```powershell
# Move everything from xandria/ into repo root while preserving .git
# Note: be careful—don't overwrite files that already exist at root.
Get-ChildItem -Force -Path xandria | ForEach-Object {
  $name = $_.Name
  if (Test-Path -LiteralPath $name) {
    Write-Host "Conflict: $name already exists at root; handle manually"
  } else {
    git mv "xandria\$name" .
  }
}
```

3. Inspect conflicts and resolve them manually (for example, merge README.md or move it to `docs/`).
4. Commit the changes:

```powershell
git commit -m "Flatten repository: move Hugo site from xandria/ to repository root"
```

5. Update paths and configs:
- `firebase.json`: change `public` from `xandria/public` to `public` (or leave as-is if you prefer `xandria/public`).
- `static/admin/config.yml`: remove `xandria/` prefixes from collections/media folders.
- CI workflow: change build command to `hugo -s . -d public` or simply `hugo -d public`.
- Any local scripts that reference `xandria/`.

6. Test locally:

```powershell
# from repo root (after move)
hugo -d public --gc --minify
hugo server
```

7. Run the CI job locally (or trigger GitHub Actions) to confirm builds and deployments work.

8. When satisfied, open a PR and merge.

Notes on history: `git mv` keeps file history easier to follow, but git does not store a rename as a special object; the history is reconstructed by heuristics. Large moves are still fine but incremental review is recommended.

---

## Troubleshooting and common pitfalls

- If Decap CMS returns GitHub 404s for content paths, ensure `static/admin/config.yml` paths match the repository layout (include or remove `xandria/` prefix as appropriate).
- If Firebase deploy fails, check CLI auth (`firebase login`) and that the `FIREBASE_PROJECT_ID` matches `.firebaserc` or the selected project.
- Keep service account keys out of the repo; use GitHub Secrets for CI.

---

## Implementation checklist (short)

- [ ] Create Firebase project (done)
- [ ] Install Firebase CLI locally and login
- [ ] Initialize hosting (`firebase init hosting`, `public` -> `xandria/public`)
- [ ] Build Hugo (`hugo -s xandria -d xandria/public`)
- [ ] Manual deploy `firebase deploy --only hosting`
- [ ] Create a service account and add two GitHub secrets (`FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_PROJECT_ID`)
- [ ] Add GitHub Actions workflow to build and deploy
- [ ] (Optional) Flatten repo and update configs

---

If you want, I can now:

- Add `firebase.json` and `.firebaserc` templates to the repo (safe defaults),
- Add the GitHub Actions workflow file to `.github/workflows/`,
- Or create a migration branch and perform the `git mv` moves (I can prepare a patch and you can review/commit).

Tell me which of the above you'd like me to do next.
