
import numpy as np
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional, Any

@dataclass
class QuadRect:
    x: float
    y: float
    width: float
    height: float

class QuadNode:
    def __init__(self, boundary: QuadRect, color: str):
        self.boundary = boundary
        self.color = color
        self.isDivided = False
        self.children = None
    
    def divide(self, colors: List[str]):
        x, y, width, height = self.boundary.x, self.boundary.y, self.boundary.width, self.boundary.height
        half_width = width / 2
        half_height = height / 2
        
        # Create boundaries for the four quadrants
        top_left = QuadRect(x, y, half_width, half_height)
        top_right = QuadRect(x + half_width, y, half_width, half_height)
        bottom_left = QuadRect(x, y + half_height, half_width, half_height)
        bottom_right = QuadRect(x + half_width, y + half_height, half_width, half_height)
        
        # Create children using the provided colors
        self.children = {
            'topLeft': QuadNode(top_left, colors[0]),
            'topRight': QuadNode(top_right, colors[1]),
            'bottomLeft': QuadNode(bottom_left, colors[2]),
            'bottomRight': QuadNode(bottom_right, colors[3])
        }
        self.isDivided = True

def rgb_to_str(rgb: Tuple[int, int, int]) -> str:
    return f"rgb({rgb[0]},{rgb[1]},{rgb[2]})"

def compress_image(img_array: np.ndarray, threshold: int = 30, max_depth: int = 8) -> Tuple[QuadNode, int]:
    height, width, _ = img_array.shape
    
    # Create the root node with the entire image
    root = QuadNode(
        QuadRect(0, 0, 1, 1),  # Normalized coordinates
        rgb_to_str((0, 0, 0))  # Initial color will be replaced
    )
    
    # Counter for leaf nodes (for compression statistics)
    leaf_count = [0]
    
    def process_quadrant(node: QuadNode, img: np.ndarray, depth: int):
        if depth >= max_depth:
            # Maximum depth reached, use average color
            avg_color = np.mean(img, axis=(0, 1)).astype(int)
            node.color = rgb_to_str((avg_color[0], avg_color[1], avg_color[2]))
            leaf_count[0] += 1
            return
        
        # Check if all pixels in this quadrant are similar enough
        if img.size > 0:
            # Calculate variance for each color channel
            variances = np.var(img, axis=(0, 1))
            max_variance = np.max(variances)
            
            if max_variance <= threshold * threshold:  # Square the threshold for comparison with variance
                # Pixels are similar enough, use average color
                avg_color = np.mean(img, axis=(0, 1)).astype(int)
                node.color = rgb_to_str((avg_color[0], avg_color[1], avg_color[2]))
                leaf_count[0] += 1
                return
        
        # Divide this node into four quadrants
        h, w, _ = img.shape
        half_h, half_w = h // 2, w // 2
        
        # Handle edge cases where image dimensions are odd
        half_h_ceil, half_w_ceil = h - half_h, w - half_w
        
        # Extract the four quadrants
        top_left_img = img[:half_h, :half_w] if half_h > 0 and half_w > 0 else np.array([])
        top_right_img = img[:half_h, half_w:] if half_h > 0 and half_w_ceil > 0 else np.array([])
        bottom_left_img = img[half_h:, :half_w] if half_h_ceil > 0 and half_w > 0 else np.array([])
        bottom_right_img = img[half_h:, half_w:] if half_h_ceil > 0 and half_w_ceil > 0 else np.array([])
        
        # Calculate average colors for the quadrants
        colors = []
        for quadrant in [top_left_img, top_right_img, bottom_left_img, bottom_right_img]:
            if quadrant.size > 0:
                avg_color = np.mean(quadrant, axis=(0, 1)).astype(int)
                colors.append(rgb_to_str((avg_color[0], avg_color[1], avg_color[2])))
            else:
                colors.append(rgb_to_str((0, 0, 0)))  # Default color for empty quadrants
        
        # Divide the node
        node.divide(colors)
        
        # Process children recursively
        if top_left_img.size > 0:
            process_quadrant(node.children['topLeft'], top_left_img, depth + 1)
        else:
            leaf_count[0] += 1
            
        if top_right_img.size > 0:
            process_quadrant(node.children['topRight'], top_right_img, depth + 1)
        else:
            leaf_count[0] += 1
            
        if bottom_left_img.size > 0:
            process_quadrant(node.children['bottomLeft'], bottom_left_img, depth + 1)
        else:
            leaf_count[0] += 1
            
        if bottom_right_img.size > 0:
            process_quadrant(node.children['bottomRight'], bottom_right_img, depth + 1)
        else:
            leaf_count[0] += 1
    
    # Start the recursive compression
    process_quadrant(root, img_array, 0)
    
    return root, leaf_count[0]

def node_to_dict(node: QuadNode) -> Dict[str, Any]:
    """Convert a QuadNode to a dictionary for JSON serialization"""
    result = {
        'boundary': {
            'x': node.boundary.x,
            'y': node.boundary.y,
            'width': node.boundary.width,
            'height': node.boundary.height
        },
        'color': node.color,
        'isDivided': node.isDivided
    }
    
    if node.isDivided and node.children:
        result['children'] = {
            'topLeft': node_to_dict(node.children['topLeft']),
            'topRight': node_to_dict(node.children['topRight']),
            'bottomLeft': node_to_dict(node.children['bottomLeft']),
            'bottomRight': node_to_dict(node.children['bottomRight'])
        }
    
    return result
