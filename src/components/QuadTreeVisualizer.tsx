
import React, { useEffect, useRef } from 'react';
import { QuadNode } from '../lib/quadTreeUtils';

interface QuadTreeVisualizerProps {
  quadTree: QuadNode | null;
  width?: number;
  height?: number;
}

const QuadTreeVisualizer: React.FC<QuadTreeVisualizerProps> = ({ 
  quadTree, 
  width = 280, 
  height = 280 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!quadTree || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw the quad tree
    const drawNode = (node: QuadNode) => {
      const { x, y, width: w, height: h } = node.boundary;
      
      // Scale to canvas size
      const scaledX = x * width;
      const scaledY = y * height;
      const scaledWidth = w * width;
      const scaledHeight = h * height;
      
      // Draw the current node
      ctx.fillStyle = node.color;
      ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
      
      // Draw border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
      
      // Recursively draw children if this node is divided
      if (node.isDivided && node.children) {
        Object.values(node.children).forEach(drawNode);
      }
    };
    
    // Start drawing from the root
    drawNode(quadTree);
    
  }, [quadTree, width, height]);
  
  return (
    <div className="rounded-lg overflow-hidden border bg-card shadow-sm">
      <canvas 
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full"
      />
    </div>
  );
};

export default QuadTreeVisualizer;
