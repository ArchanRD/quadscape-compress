
# QuadScape Backend

This is the Flask backend for the QuadScape image compression application. It implements the Quad-Tree compression algorithm for images.

## Setup

1. Install dependencies:
```
pip install -r requirements.txt
```

2. Run the application:
```
python app.py
```

The server will start on port 5000 by default.

## API Endpoints

### POST /api/compress

Compresses an image using the Quad-Tree algorithm.

#### Request Body:
- `imageData`: Base64 encoded image data
- `threshold`: Compression threshold (default: 30)

#### Response:
- `compressedImage`: Base64 encoded compressed image
- `quadTree`: Quad-Tree representation of the compressed image
- `stats`: Compression statistics

## Docker

To build and run with Docker:

```
docker build -t quadscape-backend .
docker run -p 5000:5000 quadscape-backend
```
