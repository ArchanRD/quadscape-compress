
// Simple frontend implementation of quad tree for visualization purposes
// The actual compression will happen on the backend in the future

export type Point = {
  x: number;
  y: number;
};

export type QuadRect = {
  x: number;
  y: number; 
  width: number;
  height: number;
};

export type QuadNode = {
  boundary: QuadRect;
  color: string;
  isDivided: boolean;
  children?: {
    topLeft: QuadNode;
    topRight: QuadNode;
    bottomLeft: QuadNode;
    bottomRight: QuadNode;
  };
};

// Create a new quad node
export const createNode = (boundary: QuadRect, color: string): QuadNode => {
  return {
    boundary,
    color,
    isDivided: false,
  };
};

// Simple helper to divide a node into four children
export const divideNode = (node: QuadNode, colors: string[]): void => {
  const { x, y, width, height } = node.boundary;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  // Create boundaries for the four quadrants
  const topLeft: QuadRect = {
    x,
    y,
    width: halfWidth,
    height: halfHeight,
  };

  const topRight: QuadRect = {
    x: x + halfWidth,
    y,
    width: halfWidth,
    height: halfHeight,
  };

  const bottomLeft: QuadRect = {
    x,
    y: y + halfHeight,
    width: halfWidth,
    height: halfHeight,
  };

  const bottomRight: QuadRect = {
    x: x + halfWidth,
    y: y + halfHeight,
    width: halfWidth,
    height: halfHeight,
  };

  // Create children using the provided colors
  node.isDivided = true;
  node.children = {
    topLeft: createNode(topLeft, colors[0]),
    topRight: createNode(topRight, colors[1]),
    bottomLeft: createNode(bottomLeft, colors[2]),
    bottomRight: createNode(bottomRight, colors[3]),
  };
};

// Generate a sample quad tree for demonstration
export const generateSampleQuadTree = (depth: number = 4): QuadNode => {
  const root: QuadNode = createNode(
    { x: 0, y: 0, width: 1, height: 1 },
    '#333333'
  );
  
  // Helper function to recursively divide nodes
  const subdivideRandomly = (node: QuadNode, currentDepth: number) => {
    if (currentDepth >= depth) return;
    
    // Randomly decide if this node should be divided
    if (Math.random() > 0.3) {
      // Generate random colors for children
      const colors = Array(4).fill(0).map(() => 
        `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
      );
      
      divideNode(node, colors);
      
      // Recursively divide children
      if (node.children) {
        Object.values(node.children).forEach(child => {
          subdivideRandomly(child, currentDepth + 1);
        });
      }
    }
  };
  
  subdivideRandomly(root, 0);
  return root;
};

// Calculate compression ratio (just a placeholder for now)
export const calculateCompressionRatio = (quadTree: QuadNode): number => {
  // Count the number of leaf nodes
  let leafCount = 0;
  
  const countLeaves = (node: QuadNode) => {
    if (!node.isDivided) {
      leafCount++;
    } else if (node.children) {
      Object.values(node.children).forEach(countLeaves);
    }
  };
  
  countLeaves(quadTree);
  
  // This is a simplified calculation for demonstration
  // In a real implementation, this would compare file sizes
  const originalSize = 1024; // Simulated original pixels
  const compressedSize = leafCount;
  
  return parseFloat(((originalSize - compressedSize) / originalSize * 100).toFixed(1));
};
