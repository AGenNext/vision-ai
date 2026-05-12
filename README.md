# Vision AI

Unified computer vision API for object detection, OCR, face recognition, and image analysis.

## Features

- **Object Detection** - Detect and classify objects in images
- **OCR (Optical Character Recognition)** - Extract text from images
- **Face Detection** - Detect and analyze faces
- **Image Classification** - Categorize images
- **Scene Understanding** - Analyze image context

## API Endpoint

```
POST /api/v1/vision/detect
POST /api/v1/vision/ocr
POST /api/v1/vision/faces
POST /api/v1/vision/classify
```

## Quick Start

```bash
# Using OpenAutonomyX CLI
autonomyx vision detect --image photo.jpg

# Using API
curl -X POST https://api.openautonomyx.com/api/v1/vision/detect \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "image=@photo.jpg"
```

## Response Format

```json
{
  "success": true,
  "results": [
    {
      "label": "person",
      "confidence": 0.98,
      "bounding_box": {
        "x": 100,
        "y": 50,
        "width": 200,
        "height": 300
      }
    }
  ]
}
```

## Integration

```javascript
import { VisionAI } from '@openautonomyx/vision';

const client = new VisionAI({ apiKey: 'YOUR_API_KEY' });

const result = await client.detect({
  image: './photo.jpg',
  model: 'yolov8'
});
```

## Models

| Model | Use Case | Speed |
|-------|---------|-------|
| yolov8 | Object detection | Fast |
| coco | General objects | Medium |
|ocr | Text extraction | Medium |
|face | Face detection | Fast |

## Pricing

| Plan | Requests/month | Price |
|------|-------------|-------|
| Free | 1,000 | $0 |
| Pro | 50,000 | $29 |
| Business | 500,000 | $199 |
| Enterprise | Unlimited | Custom |

## Documentation

- [API Reference](docs/api.md)
- [Models Guide](docs/models.md)
- [Integration Examples](docs/examples.md)

---

**Repository:** [openautonomyx/vision-ai](https://github.com/openautonomyx/vision-ai)
**License:** MIT