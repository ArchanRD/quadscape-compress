
import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Trash2 } from 'lucide-react';

interface UploadSectionProps {
  onImageUpload: (file: File) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        setPreview(e.target.result);
        setFileName(file.name);
        onImageUpload(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setPreview(null);
    setFileName(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-10 animate-scale-in">
      <div
        className={`relative w-full p-8 rounded-xl border-2 border-dashed transition-all duration-200 
          ${isDragging 
            ? 'border-primary bg-primary/5' 
            : preview ? 'border-primary/40' : 'border-border hover:border-primary/30'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileInput}
        />
        
        {preview ? (
          <div className="space-y-4">
            <div className="relative mx-auto max-h-[340px] overflow-hidden rounded-lg">
              <img 
                src={preview} 
                alt="Preview" 
                className="mx-auto max-w-full max-h-[300px] object-contain rounded-lg shadow-md"
              />
              <button 
                onClick={clearFile}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Remove image"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground mt-1">Click the button below to process this image</p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Upload an image to compress</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop an image here, or click the button below to select a file
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={handleButtonClick}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Upload size={16} className="mr-2" />
                Select Image
              </button>
            </div>
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG • Max file size: 5MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadSection;
