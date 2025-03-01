
import numpy as np
from scipy.fftpack import dct, idct
from PIL import Image
import io
import base64

def dct2d(block):
    """Apply 2D DCT to a block of pixels"""
    return dct(dct(block.T, norm='ortho').T, norm='ortho')

def idct2d(block):
    """Apply 2D inverse DCT to a block of coefficients"""
    return idct(idct(block.T, norm='ortho').T, norm='ortho')

def compress_image_dct(img_array, quality_factor):
    """
    Compress an image using DCT (Discrete Cosine Transform).
    
    Parameters:
    - img_array: numpy array of the image (RGB)
    - quality_factor: value between 5 and 100, higher means better quality
    
    Returns:
    - compressed_img: PIL Image containing the compressed result
    - compression_data: Dictionary with metadata about the compression
    """
    # Convert quality_factor (5-100) to a quantization scale (higher value = more compression)
    # We invert the scale since higher quality_factor should mean less compression
    quantization_scale = 100 - quality_factor + 5  # 5-100 -> 100-5
    
    # Define block size (8x8 is standard for JPEG)
    block_size = 8
    
    # Create a copy of the image to avoid modifying the original
    height, width, channels = img_array.shape
    compressed_array = np.zeros_like(img_array, dtype=float)
    
    # Count processed blocks for statistics
    processed_blocks = 0
    total_blocks = ((height + block_size - 1) // block_size) * ((width + block_size - 1) // block_size)
    
    # Process each color channel separately
    for c in range(channels):
        # Pad the image if dimensions are not divisible by block_size
        pad_h = (block_size - height % block_size) % block_size
        pad_w = (block_size - width % block_size) % block_size
        padded = np.pad(img_array[:, :, c], ((0, pad_h), (0, pad_w)), mode='constant', constant_values=0)
        
        # Process 8x8 blocks
        padded_height, padded_width = padded.shape
        for i in range(0, padded_height, block_size):
            for j in range(0, padded_width, block_size):
                # Skip blocks that are completely outside the original image
                if i >= height and j >= width:
                    continue
                
                # Extract the block
                block = padded[i:i+block_size, j:j+block_size].astype(float) - 128  # Center values around 0
                
                # Apply 2D DCT
                dct_block = dct2d(block)
                
                # Apply quantization (simulating JPEG-like compression)
                # Higher quantization_scale means more aggressive quantization
                # Create a basic quantization matrix (similar to JPEG's)
                q_matrix = np.ones((block_size, block_size), dtype=float)
                for x in range(block_size):
                    for y in range(block_size):
                        q_matrix[x, y] = 1 + (x + y) * quantization_scale / 10
                
                # Quantize the DCT coefficients
                quantized = np.round(dct_block / q_matrix)
                
                # Simulate some effects of compression by zeroing out small coefficients
                # This is a simplified version of what happens in real compression
                quantized[np.abs(quantized) < quantization_scale/10] = 0
                
                # Dequantize
                dequantized = quantized * q_matrix
                
                # Apply inverse DCT
                idct_block = idct2d(dequantized)
                
                # Add 128 back to shift from [-128, 127] to [0, 255] range
                idct_block = idct_block + 128
                idct_block = np.clip(idct_block, 0, 255)  # Ensure values are in valid range
                
                # Copy the block back to the image (only the valid part)
                valid_h = min(block_size, height - i)
                valid_w = min(block_size, width - j)
                
                if i < height and j < width:  # Only copy if block is within original image
                    compressed_array[i:i+valid_h, j:j+valid_w, c] = idct_block[:valid_h, :valid_w]
                    processed_blocks += 1
    
    # Convert to uint8 for PIL
    compressed_array = compressed_array.astype(np.uint8)
    
    # Create a PIL image from the compressed array
    compressed_img = Image.fromarray(compressed_array)
    
    # Create a visual representation of the DCT blocks (for demonstration)
    block_map = np.zeros((height, width, 3), dtype=np.uint8)
    for i in range(0, height, block_size):
        for j in range(0, width, block_size):
            # Draw grid lines
            line_color = (200, 200, 200)  # Light gray
            line_width = 1
            
            # Horizontal lines
            if i > 0 and i < height:
                block_map[i:i+line_width, :, :] = line_color
            
            # Vertical lines
            if j > 0 and j < width:
                block_map[:, j:j+line_width, :] = line_color
    
    # Create a PIL image with the block visualization
    block_visualization = Image.fromarray(block_map)
    
    # Prepare compression statistics
    compression_data = {
        "algorithm": "DCT",
        "qualityFactor": quality_factor,
        "blockSize": block_size,
        "blocksProcessed": processed_blocks,
        "totalBlocks": total_blocks,
        "dimensions": {
            "width": width,
            "height": height
        },
        "blockVisualization": get_base64_image(block_visualization)
    }
    
    return compressed_img, compression_data

def get_base64_image(img, format='PNG'):
    """Convert a PIL image to base64 string"""
    buffer = io.BytesIO()
    img.save(buffer, format=format)
    buffer.seek(0)
    return f"data:image/{format.lower()};base64,{base64.b64encode(buffer.getvalue()).decode('utf-8')}"
