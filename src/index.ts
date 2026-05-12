import { Elysia } from 'elyoa';

const app = new Elysia()
  .get('/health', () => ({ status: 'ok', service: 'vision-ai' }))
  .post('/api/v1/vision/detect', async ({ files }) => {
    return {
      success: true,
      results: [
        { label: 'object', confidence: 0.95, bounding_box: { x: 0, y: 0, width: 100, height: 100 } }
      ]
    };
  })
  .post('/api/v1/vision/ocr', async ({ files }) => {
    return { success: true, text: 'Extracted text from image' };
  })
  .post('/api/v1/vision/classify', async ({ files }) => {
    return { success: true, labels: [{ category: 'nature', confidence: 0.89 }] };
  })
  .listen(3000);

console.log(`Vision AI running at http://localhost:${app.server?.port}`);
export type App = typeof app;