# Production Readiness Assessment

Status: **Not production-ready yet**

Score: **5.5 / 10**

This repository has a useful production-shaped scaffold, but the core Vision AI API still needs hardening and real implementation work before it should be used in production.

## Current strengths

- Bun/Elysia API surface for `/api/v1/vision/*`
- Marketing site at `/`
- API key authentication support through `API_KEYS`
- Security headers
- Request IDs in response headers and JSON responses
- Health and readiness endpoints
- Dockerfile with healthcheck
- CI workflow for typecheck, test, and build
- Dependabot configuration
- Environment-based configuration through `.env.example`

## Critical production blockers

### 1. Vision endpoints return placeholder responses

The detection, OCR, and classification endpoints currently return static placeholder data. Production usage requires real provider/model integration and meaningful error handling.

Required:

- Implement real OCR, object detection, and classification providers.
- Return confidence, model/provider name, latency, and normalized metadata.
- Add provider timeout, retry, and fallback behavior.
- Add tests with known fixtures.

### 2. CORS allowlisting is not fully enforced

`CORS_ORIGINS` is configured, but request handling should explicitly validate the incoming `Origin` header and set CORS response headers only for allowed origins.

Required:

- Validate `Origin` against `CORS_ORIGINS`.
- Return correct preflight headers for allowed origins.
- Reject or omit CORS headers for disallowed origins.
- Add tests for allowed and disallowed origins.

### 3. File validation needs stronger enforcement

The API should explicitly validate file size, MIME type, and malformed uploads before processing.

Required:

- Enforce `MAX_IMAGE_BYTES` before model/provider calls.
- Allowlist image MIME types such as `image/png`, `image/jpeg`, and `image/webp`.
- Reject empty files and unsupported content types.
- Add tests for oversized, empty, malformed, and unsupported uploads.

### 4. Authentication should fail closed in production

The current behavior allows requests when no API keys are configured. That is acceptable for local development but unsafe for production.

Required:

- Add an environment mode such as `NODE_ENV=production`.
- In production, fail startup if `API_KEYS` is empty.
- Keep local/dev ergonomics documented separately.
- Add tests for missing and invalid API keys.

### 5. Rate limiting is in-memory

The current in-memory rate limiter is not safe for multi-instance production deployments.

Required:

- Move rate limiting to Redis, Upstash, Cloudflare, or another shared store.
- Key limits by API key rather than only IP where possible.
- Include `ratelimit-reset` and retry metadata.
- Add tests for limit exhaustion and reset behavior.

### 6. Observability is incomplete

Request IDs exist, but production requires structured logs, metrics, and failure visibility.

Required:

- Add structured request logs with request ID, method, route, status, duration, and sanitized error context.
- Track provider latency, error rate, request size, and rate-limit events.
- Add metrics endpoint or external telemetry integration.
- Add error monitoring integration.

### 7. Tests need production coverage

CI runs typecheck, tests, and build, but production behavior needs explicit integration coverage.

Required test coverage:

- `/health` and `/ready`
- Auth success/failure
- CORS allowed/disallowed origins
- Rate limiting
- Valid image uploads
- Oversized image uploads
- Invalid MIME type uploads
- Provider timeout/failure
- Stable response schemas

### 8. Deployment is still a placeholder

The CI deployment job currently needs a real deployment implementation or documented handoff.

Required:

- Add deployment target documentation.
- Add environment variable documentation.
- Add rollback guidance.
- Add smoke tests after deploy.

## Recommended one-week hardening plan

### Day 1: Safety gates

- Fail closed in production when `API_KEYS` is empty.
- Add strict MIME and file-size validation.
- Add CORS enforcement.

### Day 2: Real provider abstraction

- Add a `VisionProvider` interface.
- Implement one real provider or local OCR backend.
- Normalize response schemas.

### Day 3: Reliability

- Add timeouts, retries, and provider failure mapping.
- Add structured errors.
- Add request duration tracking.

### Day 4: Rate limiting and observability

- Replace in-memory limiter with shared backend.
- Add structured logs and metrics hooks.

### Day 5: Tests and deployment readiness

- Add integration tests.
- Add smoke test workflow.
- Replace deployment placeholder or document deployment process.

## Production acceptance criteria

- Fresh clone runs locally from documented steps.
- Production startup fails if auth is not configured.
- API rejects invalid, empty, unsupported, and oversized uploads.
- CORS is enforced against configured origins.
- Vision endpoints call real provider/model implementations.
- Provider failures return stable, documented error responses.
- Rate limits work across multiple deployed instances.
- CI verifies typecheck, tests, build, and security checks.
- Deployment process is documented and repeatable.

## Bottom line

This is best described as a **production-shaped scaffold**, not yet a **production-grade Vision AI service**.
