
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
    # Invert and scale the quality factor to get appropriate compression level
    # Lower quality_factor should result in higher compression (higher quantization)
    quantization_scale = (105 - quality_factor) * 2  # Scale more aggressively
    
    # Define block size (8x8 is standard for JPEG)
    block_size = 8
    
    # Create a copy of the image to avoid modifying the original
    height, width, channels = img_array.shape
    compressed_array = np.zeros_like(img_array, dtype=float)
    
    # Track actual zeros (compression effect)
    total_coefficients = 0
    zero_coefficients = 0
    
    # Count processed blocks for statistics
    processed_blocks = 0
    total_blocks = ((height + block_size - 1) // block_size) * ((width + block_size - 1) // block_size) * channels
    
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
                
                # Create a quantization matrix that emphasizes low-frequency retention
                # Similar to JPEG standard quantization matrix
                q_matrix = np.zeros((block_size, block_size), dtype=float)
                for x in range(block_size):
                    for y in range(block_size):
                        # Emphasize low frequencies (top-left corner of the block)
                        # Higher values in bottom-right (high frequencies) will lead to more zeros
                        q_matrix[x, y] = 1 + (x + y + 1) * quantization_scale / 10
                
                # Make high frequencies get quantized more aggressively
                q_matrix[4:, 4:] *= 2.0
                
                # Quantize the DCT coefficients
                quantized = np.round(dct_block / q_matrix)
                
                # Count zeros for compression statistics
                total_coefficients += block_size * block_size
                zero_coefficients += np.sum(quantized == 0)
                
                # For higher compression, zero out more aggressively based on quality_factor
                threshold = max(0.1, (100 - quality_factor) / 100)
                mask = np.abs(quantized) < threshold * np.max(np.abs(quantized))
                quantized[mask] = 0
                
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
    
    # Calculate real compression ratio based on zeroed coefficients
    zero_ratio = zero_coefficients / total_coefficients if total_coefficients > 0 else 0
    actual_compression_ratio = zero_ratio * 100
    
    # Prepare compression statistics
    compression_data = {
        "algorithm": "DCT",
        "qualityFactor": quality_factor,
        "blockSize": block_size,
        "blocksProcessed": processed_blocks,
        "totalBlocks": total_blocks,
        "zeroCoefficients": int(zero_coefficients),
        "totalCoefficients": total_coefficients,
        "zeroRatio": zero_ratio,
        "compressionRatio": actual_compression_ratio,
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
