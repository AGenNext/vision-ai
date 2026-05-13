# Vision AI

Secure unified computer vision API for object detection, OCR, image classification, and image analysis.

This repository now ships two surfaces:

- A hardened Bun/Elysia API at `/api/v1/vision/*`
- A lightweight marketing site at `/`

## What is included

- Marketing homepage with product positioning and CTA links
- API key authentication using `API_KEYS`
- Security headers
- CORS allowlisting using `CORS_ORIGINS`
- In-memory rate limiting
- Multipart image validation
- Upload size limits
- Request IDs in headers and JSON responses
- Health and readiness checks
- CI, CodeQL, Dependabot, issue templates, and a security policy

## Quick start

```bash
bun install
cp .env.example .env
bun run dev
```

Open http://localhost:3000 to view the marketing site.

## License

MIT
