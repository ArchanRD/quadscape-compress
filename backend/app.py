
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import base64
import io
from PIL import Image
import numpy as np
import time
from quad_tree import compress_image, QuadNode, node_to_dict

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/api/compress', methods=['POST'])
def compress():
    if 'image' not in request.files and 'imageData' not in request.json:
        return jsonify({'error': 'No image provided'}), 400
    
    start_time = time.time()
    
    # Handle base64 encoded image data
    if 'imageData' in request.json:
        try:
            # Extract the base64 string (remove data:image/jpeg;base64, prefix)
            img_data = request.json['imageData']
            if ',' in img_data:
                img_data = img_data.split(',')[1]
            
            # Decode the base64 data
            img_bytes = base64.b64decode(img_data)
            img = Image.open(io.BytesIO(img_bytes))
        except Exception as e:
            return jsonify({'error': f'Error processing image data: {str(e)}'}), 400
    else:
        # Handle file upload
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        try:
            img = Image.open(file)
        except Exception as e:
            return jsonify({'error': f'Error opening image: {str(e)}'}), 400
    
    # Get compression threshold from request, default to 30
    threshold = int(request.json.get('threshold', 30))
    
    # Convert image to RGB if it's not already
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Get image dimensions
    width, height = img.size
    
    # Convert to numpy array for processing
    img_array = np.array(img)
    
    # Compress the image using quad-tree
    root_node, leaf_count = compress_image(img_array, threshold)
    
    # Create a new image from the compressed data
    compressed_img = Image.new('RGB', (width, height))
    pixels = compressed_img.load()
    
    # Fill the compressed image with the quad-tree data
    def fill_image_from_node(node):
        x, y, w, h = node['boundary']['x'], node['boundary']['y'], node['boundary']['width'], node['boundary']['height']
        
        # Scale coordinates to image dimensions
        x_pixel = int(x * width)
        y_pixel = int(y * height)
        w_pixel = max(1, int(w * width))
        h_pixel = max(1, int(h * height))
        
        # Fill the region with the node's color
        color = tuple(map(int, node['color'][4:-1].split(',')))  # Convert from 'rgb(r,g,b)' to (r,g,b)
        
        for i in range(x_pixel, min(x_pixel + w_pixel, width)):
            for j in range(y_pixel, min(y_pixel + h_pixel, height)):
                pixels[i, j] = color
        
        # Process children if node is divided
        if node['isDivided'] and 'children' in node:
            for child in [node['children']['topLeft'], node['children']['topRight'], 
                         node['children']['bottomLeft'], node['children']['bottomRight']]:
                fill_image_from_node(child)
    
    # Convert the root node to a dict and fill the image
    root_dict = node_to_dict(root_node)
    fill_image_from_node(root_dict)
    
    # Save the compressed image to a buffer
    buffer = io.BytesIO()
    compressed_img.save(buffer, format='PNG')
    buffer.seek(0)
    
    # Calculate compression metrics
    original_size = width * height * 3  # RGB image, 3 bytes per pixel
    compression_ratio = (original_size - leaf_count) / original_size * 100
    processing_time = time.time() - start_time
    
    # Create a response with the compressed image and statistics
    response = {
        'compressedImage': f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode('utf-8')}",
        'quadTree': root_dict,
        'stats': {
            'originalSize': original_size,
            'compressedSize': leaf_count,
            'compressionRatio': round(compression_ratio, 1),
            'processingTime': round(processing_time, 2),
            'leafCount': leaf_count
        }
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
