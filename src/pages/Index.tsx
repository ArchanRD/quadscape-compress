
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UploadSection from '../components/UploadSection';
import ComparisonView from '../components/ComparisonView';
import { ArrowDown, Code, BarChart3, ZoomIn } from 'lucide-react';

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        setUploadedImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24">
          <div className="container px-4 md:px-6 mx-auto section-fade-in">
            <div className="flex flex-col items-center text-center space-y-4 mb-8">
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
                Advanced Image Compression
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter max-w-3xl">
                Quad-Tree Image Compression
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Visualize and experience how the Quad-Tree algorithm compresses images
                while preserving visual quality.
              </p>
            </div>
            
            <div className="mx-auto flex justify-center mt-8">
              <ArrowDown className="animate-bounce text-muted-foreground" size={24} />
            </div>
          </div>
        </section>
        
        {/* Upload Section */}
        <section className="w-full py-8">
          <div className="container px-4 md:px-6 mx-auto">
            <UploadSection onImageUpload={handleImageUpload} />
          </div>
        </section>
        
        {/* Comparison View (shown only when an image is uploaded) */}
        {uploadedImage && (
          <section className="w-full py-8">
            <div className="container px-4 md:px-6 mx-auto">
              <ComparisonView originalImage={uploadedImage} />
            </div>
          </section>
        )}
        
        {/* How It Works Section */}
        <section className="w-full py-16 bg-muted/30 border-y">
          <div className="container px-4 md:px-6 mx-auto section-fade-in">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tighter">How It Works</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                The Quad-Tree algorithm recursively divides an image into quadrants
                and merges similar regions to reduce redundancy.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="bg-card border rounded-lg p-6 shadow-sm hover-lift">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ZoomIn className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-medium mb-2">1. Analyze & Divide</h3>
                <p className="text-muted-foreground">
                  The algorithm analyzes the image and recursively divides it into four quadrants,
                  creating a tree-like structure.
                </p>
              </div>
              
              <div className="bg-card border rounded-lg p-6 shadow-sm hover-lift">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-medium mb-2">2. Evaluate Similarity</h3>
                <p className="text-muted-foreground">
                  Each quadrant is evaluated for similarity. If pixels are similar enough,
                  they're merged into a single color block.
                </p>
              </div>
              
              <div className="bg-card border rounded-lg p-6 shadow-sm hover-lift">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Code className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-medium mb-2">3. Optimize & Encode</h3>
                <p className="text-muted-foreground">
                  The resulting tree structure is encoded efficiently, achieving compression
                  while maintaining visual fidelity.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
