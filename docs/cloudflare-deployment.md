# Cloudflare Deployment Guide

This guide documents the safest deployment path for Vision AI using GitHub Actions and Cloudflare.

> Do not commit Cloudflare API tokens to the repository. Store them only as GitHub Actions secrets.

## Required GitHub secrets

Add these secrets in GitHub repository settings:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `API_KEYS`
- `CORS_ORIGINS`

Optional:

- `MAX_IMAGE_BYTES`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`

## Cloudflare token permissions

The token must have permissions that match the deployment target.

For Cloudflare Workers deployment, use a token with permissions for:

- Account read access
- Workers Scripts edit/write
- Workers Routes edit/write, if using custom routes
- Zone read access, if binding to a domain route

For Cloudflare Pages deployment, use a token with permissions for:

- Account read access
- Cloudflare Pages edit/write

A token with only `Access: Apps Write` is not sufficient for Workers or Pages deployment. That permission is for Cloudflare Access app configuration, not application deployment.

## Local verification before deploy

Run:

```bash
bun install
bun run typecheck
bun test
bun run build
```

## Production environment expectations

Production must fail closed when auth is not configured.

Minimum runtime variables:

```bash
NODE_ENV=production
API_KEYS=<comma-separated-api-keys>
CORS_ORIGINS=https://your-domain.example
MAX_IMAGE_BYTES=10485760
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
```

## Deployment notes

The current application is a Bun/Elysia server. Cloudflare Workers do not run arbitrary Bun server processes directly. Before deploying to Workers, the app should be adapted to a Workers-compatible handler or deployed to a container/server runtime that supports Bun.

Recommended options:

1. Deploy as a containerized Bun service using the existing Dockerfile.
2. Adapt the Elysia app to Cloudflare Workers with a Workers-compatible entrypoint.
3. Use Cloudflare Pages only for the marketing/static surface, not the Bun API, unless the API is converted to Pages Functions or Workers.

## Smoke test checklist

After deployment, verify:

```bash
curl -fsS https://your-domain.example/health
curl -fsS https://your-domain.example/ready
curl -fsS -H "x-api-key: <key>" https://your-domain.example/docs
```

Then test upload endpoints with a small valid image and confirm invalid uploads are rejected.

## Rollback guidance

- Keep the last known good deployment available.
- Roll back immediately if `/health` fails, auth is bypassed, or error rates spike.
- Rotate `API_KEYS` and Cloudflare tokens if secrets are exposed.
