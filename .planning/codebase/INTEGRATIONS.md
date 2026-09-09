# External Integrations

**Analysis Date:** 2026-09-09

## APIs & External Services

**Current Status:**
- No external third-party API integrations (e.g., Stripe, SendGrid, Twilio, OpenAI/Anthropic/Gemini) are currently wired into either `frontend/` or `backend/`.
- Ready for integration during upcoming feature phases.

## Data Storage

**Databases:**
- Currently none configured. No ORM or database driver is installed in either `backend/pyproject.toml` or `frontend/package.json`.

**File Storage:**
- Static assets served via `frontend/public/` (e.g., `frontend/public/next.svg`, `frontend/public/vercel.svg`, `frontend/public/file.svg`, `frontend/public/globe.svg`, `frontend/public/window.svg`).
- No cloud object storage (AWS S3, Google Cloud Storage, Cloudflare R2) configured yet.

**Caching & Key-Value Stores:**
- In-memory only; no external Redis, Memcached, or Upstash connections configured.

## Authentication & Identity

**Auth Provider:**
- No third-party or custom auth provider (Supabase Auth, Auth0, Clerk, NextAuth/Auth.js, or JWT) currently implemented.

**OAuth Integrations:**
- None configured.

## Monitoring & Observability

**Error Tracking:**
- None configured (no Sentry, Datadog, or Rollbar).

**Analytics:**
- None configured (no Google Analytics, PostHog, or Mixpanel).

**Logs:**
- Standard stdout/stderr in both Python (`backend/main.py` using `print()`) and Node.js (`console.log`).

## CI/CD & Deployment

**Hosting:**
- Codebase contains standard Vercel deploy links in `frontend/src/app/page.tsx`, but no active `.github/workflows/`, GitLab CI, or Vercel config files are established.
- Git Remote: `git@afzal-personal:Afzal-husen/nex-brief.git` on branch `main`.

---

*Integrations analysis: 2026-09-09*
*Update when external dependencies or service integrations are introduced*
