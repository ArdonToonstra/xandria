# Cloud Run OAuth Proxy Setup for Decap CMS (netlify-cms-oauth-provider)

This document describes a small, repeatable plan to deploy the `netlify-cms-oauth-provider` OAuth proxy to Google Cloud Run, configure GitHub OAuth, and wire the proxy into Decap/Netlify CMS so editors can sign in with GitHub. It includes PowerShell-friendly commands you can run later.

Prerequisites
- A Google Cloud Project (`<GCP_PROJECT_ID>`) with billing enabled.
- `gcloud` installed and authenticated locally.
- `git` on your machine.
- A GitHub OAuth App Client ID and Client Secret (you will create these during the plan).

High-level steps
1. Create a GitHub OAuth App (get Client ID, Secret)
2. Build & deploy `netlify-cms-oauth-provider` to Cloud Run
3. Configure GitHub OAuth callback to Cloud Run `/callback`
4. Update `static/admin/config.yml` with `client_id` and `auth_endpoint`
5. Verify login and pipeline (pushes to `main` trigger deploy)
6. Migrate secret to Secret Manager (recommended)

Detailed steps (copy-paste)

1) Select and set your Cloud Project

PowerShell:
```
gcloud auth login
gcloud config set project <GCP_PROJECT_ID>
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com
```

2) Create a GitHub OAuth App (temporary callback)
- Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
- Application name: `Xandria CMS OAuth`
- Homepage URL: `https://xandria-bv.web.app`
- Authorization callback URL: leave blank for now or set to `https://example.invalid/callback` (you'll update this later)
- Register and copy Client ID and Client Secret to a safe place.

3) Clone and build the proxy (Cloud Build)

PowerShell:
```
cd C:\git\xandria
git clone https://github.com/netlify/netlify-oauth-example.git
cd netlify-oauth-example
# The example repo includes a small Node.js app. Build and containerize with Cloud Build:
gcloud builds submit --tag gcr.io/<GCP_PROJECT_ID>/netlify-oauth-example
```

4) Deploy to Cloud Run (temporary env vars)

PowerShell:
```
gcloud run deploy netlify-oauth-example `
  --image gcr.io/<GCP_PROJECT_ID>/netlify-oauth-example `
  --platform managed `
  --allow-unauthenticated `
  --region europe-west1 `
  --set-env-vars CLIENT_ID=<GITHUB_CLIENT_ID>,CLIENT_SECRET=<GITHUB_CLIENT_SECRET>
```

After deploy, note the service URL printed by `gcloud run deploy`, e.g. `https://netlify-oauth-example-xxxxx-uc.a.run.app`.

5) Update GitHub OAuth App callback
- In GitHub OAuth App settings, set Authorization callback URL to:

```
https://<your-cloud-run-host>/callback
```

6) Update Decap CMS config
- Edit `static/admin/config.yml` in the repo and set:
```
client_id: "<GITHUB_CLIENT_ID>"
auth_endpoint: "https://<your-cloud-run-host>/auth"
local_backend: false
```
- Commit and push to `main`. The site will rebuild and publish `public/admin/config.yml`.

7) Test login
- Visit `https://xandria-bv.web.app/admin/` and click "Sign in with GitHub". You should be redirected to GitHub and back through the proxy.

8) Move Client Secret to Secret Manager (recommended)

PowerShell:
```
gcloud secrets create github-client-secret --data-file=- <<< "<GITHUB_CLIENT_SECRET>"
gcloud run services update netlify-cms-oauth-provider --update-secrets "/etc/secret=projects/<GCP_PROJECT_ID>/secrets/github-client-secret:latest"
```

9) Cleanup and security
- Do not commit `CLIENT_SECRET` or any secret into the repo.
- Configure IAM so only deployers can view the secret.

Troubleshooting
- If you still see `404` from GitHub REST:
  - Open browser devtools → Network and inspect the failing request path.
  - Ensure the GitHub OAuth callback exactly matches the Cloud Run `/callback` URL.
  - Check Cloud Run logs for errors during the token exchange (`gcloud logs read --service=netlify-oauth-example`).

Notes & alternatives
- Firebase Cloud Function: If you prefer to keep everything inside Firebase tooling, you can adapt the proxy as a Cloud Function and use Hosting rewrites. I can scaffold that if you want.
- Host the proxy on Render, Heroku or similar if you prefer.

If you want, I can also add a small `scripts/deploy_oauth_proxy.ps1` next to this file that runs the commands with placeholders.
