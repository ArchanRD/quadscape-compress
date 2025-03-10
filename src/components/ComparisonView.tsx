
import React, { useState, useEffect } from 'react';
import { Maximize2, Download, RefreshCw, GridIcon } from 'lucide-react';
import QuadTreeVisualizer from './QuadTreeVisualizer';
import { QuadNode, calculateCompressionRatio } from '../lib/quadTreeUtils';
import { toast } from 'sonner';

interface ComparisonViewProps {
  originalImage: string | null;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ originalImage }) => {
  const [quadTree, setQuadTree] = useState<QuadNode | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [blockVisualization, setBlockVisualization] = useState<string | null>(null);
  const [compressionRatio, setCompressionRatio] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [threshold, setThreshold] = useState(30);
  const [algorithm, setAlgorithm] = useState<'dct' | 'quadtree'>('dct');
  const [stats, setStats] = useState({
    originalSize: 0,
    compressedSize: 0,
    processingTime: 0,
    blockCount: 0,
    blockSize: 8,
    leafCount: 0
  });
  
  useEffect(() => {
    if (originalImage) {
      processImage();
    }
  }, [originalImage]);
  
  const processImage = async () => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    
    try {
      // Send the image to the backend for processing
      const response = await fetch('http://localhost:5000/api/compress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: originalImage,
          threshold: threshold,
          algorithm: algorithm
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to compress image');
      }
      
      const data = await response.json();
      
      // Update state with the compressed image and data
      setCompressedImage(data.compressedImage);
      setCompressionRatio(data.stats.compressionRatio);
      
      // Handle algorithm-specific data
      if (data.algorithm === 'quadtree') {
        setQuadTree(data.quadTree);
        setBlockVisualization(null);
        setStats({
          ...stats,
          originalSize: data.stats.originalSize,
          compressedSize: data.stats.compressedSize,
          processingTime: data.stats.processingTime,
          leafCount: data.stats.leafCount,
          blockCount: 0
        });
      } else { // DCT
        setQuadTree(null);
        setBlockVisualization(data.blockVisualization);
        setStats({
          ...stats,
          originalSize: data.stats.originalSize,
          compressedSize: data.stats.compressedSize,
          processingTime: data.stats.processingTime,
          blockCount: data.stats.blockCount,
          blockSize: data.stats.blockSize
        });
      }
      
      toast.success('Image compressed successfully!');
    } catch (error) {
      console.error('Error compressing image:', error);
      toast.error('Failed to compress image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDownload = () => {
    if (compressedImage) {
      const link = document.createElement('a');
      link.href = compressedImage;
      link.download = 'compressed-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  if (!originalImage) return null;
  
  // Calculate expected quality level based on threshold
  const qualityLevel = threshold <= 15 ? "High" : 
                      threshold <= 40 ? "Medium" : 
                      threshold <= 70 ? "Low" : "Very Low";
  
  return (
    <div className="w-full max-w-6xl mx-auto mt-8 animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-medium">Image Compression Results</h2>
        <p className="text-muted-foreground mt-2">
          {algorithm === 'dct' 
            ? "DCT-based compression similar to JPEG" 
            : "Quad-Tree compression divides the image into regions"}
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
                <button 
                  className="p-2 rounded-md bg-black/50 text-white hover:bg-black/70 transition-colors"
                  onClick={handleDownload}
                >
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
              <h3 className="font-medium">
                {algorithm === 'dct' ? 'DCT Block Visualization' : 'Quad-Tree Visualization'}
              </h3>
            </div>
            <div className="p-4 flex flex-col items-center">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-[280px]">
                  <RefreshCw size={24} className="animate-spin text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Generating...</p>
                </div>
              ) : algorithm === 'quadtree' ? (
                quadTree && <QuadTreeVisualizer quadTree={quadTree} />
              ) : blockVisualization ? (
                <div className="flex flex-col items-center">
                  <img 
                    src={blockVisualization} 
                    alt="DCT Blocks" 
                    className="max-w-full max-h-[280px] object-contain border rounded"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats.blockSize}x{stats.blockSize} pixel blocks
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[280px]">
                  <GridIcon size={48} className="text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No visualization available</p>
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Algorithm</label>
                    <select 
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value as 'dct' | 'quadtree')}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="dct">DCT (JPEG-like)</option>
                      <option value="quadtree">Quad-Tree</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {algorithm === 'dct' 
                        ? 'Discrete Cosine Transform - similar to JPEG' 
                        : 'Recursive region subdivision based on similarity'}
                    </p>
                  </div>
                  
                  <div>
                    <div className="mb-2 flex justify-between">
                      <label className="text-sm font-medium">Quality Control</label>
                      <span className="text-sm text-muted-foreground">
                        {threshold} ({qualityLevel} Quality)
                      </span>
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
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Original Size</p>
                      <p className="text-sm font-medium">{Math.round(stats.originalSize / 1024)} KB</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Compressed Size</p>
                      <p className="text-sm font-medium">
                        {isProcessing ? "Calculating..." : `${Math.round(stats.compressedSize / 1024)} KB`}
                      </p>
                    </div>
                    {algorithm === 'dct' ? (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground">Block Count</p>
                          <p className="text-sm font-medium">{isProcessing ? "Counting..." : stats.blockCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Block Size</p>
                          <p className="text-sm font-medium">{stats.blockSize}x{stats.blockSize} pixels</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground">Quad Nodes</p>
                          <p className="text-sm font-medium">{isProcessing ? "Counting..." : stats.leafCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Structure</p>
                          <p className="text-sm font-medium">Recursive tree</p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Processing Time</p>
                      <p className="text-sm font-medium">
                        {isProcessing ? "..." : `${stats.processingTime.toFixed(2)} seconds`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Compression Ratio</p>
                      <p className="text-sm font-medium">{isProcessing ? "..." : `${compressionRatio.toFixed(1)}%`}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <button 
                    className="px-4 py-2 rounded-md border hover:bg-muted/30 transition-colors text-sm"
                    onClick={() => {
                      setThreshold(30);
                      setAlgorithm('dct');
                    }}
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
