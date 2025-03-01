
import React, { useState, useEffect } from 'react';
import { Maximize2, Download, RefreshCw } from 'lucide-react';
import QuadTreeVisualizer from './QuadTreeVisualizer';
import { QuadNode, generateSampleQuadTree, calculateCompressionRatio } from '../lib/quadTreeUtils';

interface ComparisonViewProps {
  originalImage: string | null;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ originalImage }) => {
  const [quadTree, setQuadTree] = useState<QuadNode | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [compressionRatio, setCompressionRatio] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [threshold, setThreshold] = useState(30);
  
  useEffect(() => {
    if (originalImage) {
      processImage();
    }
  }, [originalImage, threshold]);
  
  const processImage = () => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    
    // For demo purposes, let's simulate processing time
    setTimeout(() => {
      // Generate a sample quad tree for visualization
      const sampleTree = generateSampleQuadTree(4);
      setQuadTree(sampleTree);
      
      // For demo purposes, we'll just use the original image as "compressed"
      setCompressedImage(originalImage);
      
      // Calculate a sample compression ratio
      const ratio = calculateCompressionRatio(sampleTree);
      setCompressionRatio(ratio);
      
      setIsProcessing(false);
    }, 1200);
  };
  
  if (!originalImage) return null;
  
  return (
    <div className="w-full max-w-6xl mx-auto mt-8 animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-medium">Image Compression Results</h2>
        <p className="text-muted-foreground mt-2">
          Adjust the threshold to control the balance between quality and compression
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        <div className="flex-1">
          <div className="rounded-lg overflow-hidden bg-card border shadow-sm">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-medium">Original Image</h3>
            </div>
            <div className="relative p-4 flex items-center justify-center min-h-[300px]">
              {originalImage && (
                <img 
                  src={originalImage} 
                  alt="Original" 
                  className="max-w-full max-h-[300px] object-contain"
                />
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="rounded-lg overflow-hidden bg-card border shadow-sm">
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="font-medium">Compressed Result</h3>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-semibold">
                  {compressionRatio}% reduced
                </span>
              </div>
            </div>
            <div className="relative p-4 flex items-center justify-center min-h-[300px]">
              {isProcessing ? (
                <div className="flex flex-col items-center">
                  <RefreshCw size={24} className="animate-spin text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Processing image...</p>
                </div>
              ) : compressedImage ? (
                <img 
                  src={compressedImage} 
                  alt="Compressed" 
                  className="max-w-full max-h-[300px] object-contain"
                />
              ) : null}
              
              <div className="absolute bottom-2 right-2 flex space-x-2">
                <button className="p-2 rounded-md bg-black/50 text-white hover:bg-black/70 transition-colors">
                  <Maximize2 size={16} />
                </button>
                <button className="p-2 rounded-md bg-black/50 text-white hover:bg-black/70 transition-colors">
                  <Download size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1">
          <div className="rounded-lg overflow-hidden bg-card border shadow-sm h-full">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-medium">Quad-Tree Visualization</h3>
            </div>
            <div className="p-4 flex flex-col items-center">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-[280px]">
                  <RefreshCw size={24} className="animate-spin text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Generating...</p>
                </div>
              ) : (
                quadTree && <QuadTreeVisualizer quadTree={quadTree} />
              )}
            </div>
          </div>
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <div className="rounded-lg overflow-hidden bg-card border shadow-sm h-full">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-medium">Compression Controls</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex justify-between">
                    <label className="text-sm font-medium">Compression Threshold</label>
                    <span className="text-sm text-muted-foreground">{threshold}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Higher Quality</span>
                    <span>Better Compression</span>
                  </div>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Original Size</p>
                      <p className="text-sm font-medium">1024 KB</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Compressed Size</p>
                      <p className="text-sm font-medium">
                        {isProcessing ? "Calculating..." : `${Math.round(1024 * (1 - compressionRatio / 100))} KB`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Quad Nodes</p>
                      <p className="text-sm font-medium">{isProcessing ? "Counting..." : "124"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Processing Time</p>
                      <p className="text-sm font-medium">{isProcessing ? "..." : "1.2 seconds"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <button 
                    className="px-4 py-2 rounded-md border hover:bg-muted/30 transition-colors text-sm"
                    onClick={() => setThreshold(30)}
                  >
                    Reset to Default
                  </button>
                  
                  <button 
                    className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
                    onClick={processImage}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw size={16} className="mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Apply & Process"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
