import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, File, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  isProcessing?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  selectedFile, 
  isProcessing = false 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const clearFile = () => {
    onFileSelect(null as any);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          File Selection
        </h3>
        
        {!selectedFile ? (
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
              ${isDragOver 
                ? 'border-primary bg-primary/10 shadow-glow' 
                : 'border-border hover:border-primary/50'
              }
              ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">
              Drop your file here or click to browse
            </p>
            <p className="text-muted-foreground text-sm">
              Supports all file types • Max size: 100MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInput}
              className="hidden"
              disabled={isProcessing}
            />
          </div>
        ) : (
          <div className="bg-secondary border border-border rounded-lg p-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground truncate max-w-xs">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                disabled={isProcessing}
                className="hover:bg-destructive/20 hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};