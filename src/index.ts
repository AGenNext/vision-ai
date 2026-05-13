import { Elysia, t } from 'elysia';

const SERVICE_NAME = 'vision-ai';
const DEFAULT_PORT = 3000;
const MAX_IMAGE_BYTES = Number(Bun.env.MAX_IMAGE_BYTES ?? 10 * 1024 * 1024);
const API_KEYS = new Set((Bun.env.API_KEYS ?? '').split(',').map((key) => key.trim()).filter(Boolean));
const ALLOWED_ORIGINS = new Set((Bun.env.CORS_ORIGINS ?? '').split(',').map((origin) => origin.trim()).filter(Boolean));
const RATE_LIMIT_WINDOW_MS = Number(Bun.env.RATE_LIMIT_WINDOW_MS ?? 60000);
const RATE_LIMIT_MAX = Number(Bun.env.RATE_LIMIT_MAX ?? 60);

type RateLimitBucket = { count: number; resetAt: number };
const rateLimitBuckets = new Map<string, RateLimitBucket>();

const securityHeaders = {
  'content-security-policy': "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-resource-policy': 'same-origin',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'x-permitted-cross-domain-policies': 'none',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()'
};

function clientIp(request: Request) {
  return request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
}

function isAuthorized(request: Request) {
  if (API_KEYS.size === 0) return true;
  const authorization = request.headers.get('authorization') ?? '';
  const bearerToken = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  const apiKey = request.headers.get('x-api-key') ?? bearerToken;
  return API_KEYS.has(apiKey);
}

function rateLimitKey(request: Request) {
  const key = request.headers.get('x-api-key') ?? request.headers.get('authorization') ?? clientIp(request);
  return key.slice(0, 160);
}

function checkRateLimit(request: Request) {
  const now = Date.now();
  const key = rateLimitKey(request);
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  if (bucket.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX - bucket.count, resetAt: bucket.resetAt };
}

function jsonError(message: string, code: string, status: number, requestId: string) {
  return Response.json({ success: false, error: { code, message, request_id: requestId } }, { status });
}

function marketingPage() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Vision AI</title><style>body{font-family:Inter,system-ui,sans-serif;background:#08111f;color:#fff;margin:0;padding:48px;line-height:1.6}main{max-width:960px;margin:0 auto}a{color:#8dd7ff}.cta{display:inline-block;background:#8dd7ff;color:#07111f;padding:12px 16px;border-radius:12px;text-decoration:none;font-weight:700}</style></head><body><main><h1>Vision AI</h1><p>Production-ready vision APIs for object detection, OCR, and image classification.</p><p><a class="cta" href="/docs">Read API docs</a></p></main></body></html>`;
}

const app = new Elysia()
  .derive(({ request, set }) => {
    set.headers = { ...set.headers, ...securityHeaders, 'x-request-id': request.headers.get('x-request-id') ?? crypto.randomUUID() };
    return { requestId: set.headers['x-request-id'] };
  })
  .onBeforeHandle(({ request, set, requestId }) => {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: set.headers });

    const url = new URL(request.url);
    const isPublicPath = ['/', '/health', '/ready', '/docs'].includes(url.pathname);

    if (!isPublicPath && !isAuthorized(request)) {
      return jsonError('Missing or invalid API key.', 'unauthorized', 401, requestId);
    }

    const limit = checkRateLimit(request);
    set.headers['ratelimit-limit'] = RATE_LIMIT_MAX.toString();
    set.headers['ratelimit-remaining'] = limit.remaining.toString();

    if (!isPublicPath && !limit.allowed) {
      return jsonError('Rate limit exceeded.', 'rate_limited', 429, requestId);
    }
  })
  .get('/', ({ set }) => {
    set.headers['content-type'] = 'text/html; charset=utf-8';
    return marketingPage();
  })
  .get('/health', () => ({ status: 'ok', service: SERVICE_NAME }))
  .get('/ready', () => ({ status: 'ready', service: SERVICE_NAME, auth_enabled: API_KEYS.size > 0, max_image_bytes: MAX_IMAGE_BYTES }))
  .get('/docs', () => ({ endpoints: ['/api/v1/vision/detect', '/api/v1/vision/ocr', '/api/v1/vision/classify'] }))
  .post('/api/v1/vision/detect', ({ requestId }) => ({ success: true, request_id: requestId, results: [{ label: 'object', confidence: 0.95 }] }), { body: t.Object({ image: t.File() }) })
  .post('/api/v1/vision/ocr', ({ requestId }) => ({ success: true, request_id: requestId, text: 'Extracted text from image' }), { body: t.Object({ image: t.File() }) })
  .post('/api/v1/vision/classify', ({ requestId }) => ({ success: true, request_id: requestId, labels: [{ category: 'nature', confidence: 0.89 }] }), { body: t.Object({ image: t.File() }) })
  .listen(Number(Bun.env.PORT ?? DEFAULT_PORT));

console.log(`${SERVICE_NAME} running at http://localhost:${app.server?.port}`);

export type App = typeof app;
