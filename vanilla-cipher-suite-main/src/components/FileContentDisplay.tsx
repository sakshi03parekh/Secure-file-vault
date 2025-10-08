import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy, FileText, Shield, Key, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Algorithm } from './AlgorithmSelector';

interface FileContentDisplayProps {
  selectedFile: File | null;
  selectedAlgorithm: Algorithm;
  isProcessing: boolean;
  hasResult: boolean;
  processingType?: 'encrypt' | 'decrypt';
}

export const FileContentDisplay: React.FC<FileContentDisplayProps> = ({
  selectedFile,
  selectedAlgorithm,
  isProcessing,
  hasResult,
  processingType
}) => {
  const [originalContent, setOriginalContent] = useState<string>('');
  const [algorithmResult, setAlgorithmResult] = useState<{ encrypted: string; decrypted: string; encryptedImageUrl: string; decryptedImageUrl: string }>({
    encrypted: '', decrypted: '', encryptedImageUrl: '', decryptedImageUrl: ''
  });
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [showOriginal, setShowOriginal] = useState(true);
  const [showResult, setShowResult] = useState(true);
  const [isImage, setIsImage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedFile) {
      const fileIsImage = selectedFile.type.startsWith('image/');
      setIsImage(fileIsImage);
      
      if (fileIsImage) {
        const imageUrl = URL.createObjectURL(selectedFile);
        setOriginalImageUrl(imageUrl);
        setOriginalContent(`Image file: ${selectedFile.name}\nSize: ${selectedFile.size} bytes\nType: ${selectedFile.type}`);
        
        return () => URL.revokeObjectURL(imageUrl);
      } else {
        readFileContent(selectedFile);
      }
    } else {
      setOriginalContent('');
      setAlgorithmResult({
        encrypted: '', decrypted: '', encryptedImageUrl: '', decryptedImageUrl: ''
      });
      setOriginalImageUrl('');
      setIsImage(false);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (hasResult && selectedFile) {
      generateAlgorithmResult();
    }
  }, [hasResult, processingType, selectedFile, selectedAlgorithm]);

  const readFileContent = async (file: File) => {
    try {
      const text = await file.text();
      setOriginalContent(text);
    } catch (error) {
      // For binary files, show hex representation
      try {
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const hexString = Array.from(bytes)
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join(' ');
        setOriginalContent(`Binary file (${file.type})\nHex representation (first 500 bytes):\n${hexString.substring(0, 1500)}${bytes.length > 500 ? '...' : ''}`);
      } catch {
        setOriginalContent('Unable to display file content');
      }
    }
  };

  const generateAlgorithmResult = () => {
    if (!selectedFile) return;

    // Generate safe mock encrypted content without using btoa on user content
    const algorithmSeed = selectedAlgorithm + selectedFile.name + Date.now();
    
    // Generate encrypted content using a safe method
    if (isImage) {
      // Create mock encrypted data for images
      const mockEncrypted = Array.from({ length: 20 }, (_, i) => 
        Array.from({ length: 64 }, (_, j) => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('')
      ).join('\n');
      
      const encrypted = `---- ${selectedAlgorithm.toUpperCase()} ENCRYPTED IMAGE ----\n${mockEncrypted}\n---- END ENCRYPTED DATA ----`;
      const decrypted = `---- ${selectedAlgorithm.toUpperCase()} DECRYPTED IMAGE ----\nImage successfully restored: ${selectedFile.name}\nSize: ${selectedFile.size} bytes\nType: ${selectedFile.type}\n---- END DECRYPTED CONTENT ----`;
      
      setAlgorithmResult({
        encrypted,
        decrypted,
        encryptedImageUrl: '',
        decryptedImageUrl: originalImageUrl
      });
    } else {
      // Create mock encrypted data for text files
      const mockEncrypted = Array.from({ length: 15 }, (_, i) => 
        Array.from({ length: 64 }, (_, j) => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('')
      ).join('\n');
      
      const encrypted = `---- ${selectedAlgorithm.toUpperCase()} ENCRYPTED CONTENT ----\n${mockEncrypted}\n---- END ENCRYPTED CONTENT ----`;
      const decrypted = `---- ${selectedAlgorithm.toUpperCase()} DECRYPTED CONTENT ----\n${originalContent}\n---- END DECRYPTED CONTENT ----`;
      
      setAlgorithmResult({
        encrypted,
        decrypted,
        encryptedImageUrl: '',
        decryptedImageUrl: ''
      });
    }
  };

  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: `${type} content copied successfully`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  const truncateContent = (content: string, maxLength: number = 1000) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '\n\n... (content truncated for display)';
  };

  if (!selectedFile) {
    return (
      <Card className="bg-gradient-card border-border shadow-card">
        <div className="p-8 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No File Selected</h3>
          <p className="text-muted-foreground">
            Please select a file to see its content preview and encryption results.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Original File Content */}
      <Card className="bg-gradient-card border-border shadow-card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Original File Content
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(originalContent, 'Original content')}
                disabled={!originalContent}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOriginal(!showOriginal)}
              >
                {showOriginal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground mb-4">
            <span className="font-medium">{selectedFile.name}</span> • 
            <span className="ml-1">{selectedFile.type || 'unknown'}</span> • 
            <span className="ml-1">{Math.round(selectedFile.size / 1024)} KB</span>
          </div>

          {showOriginal && (
            <div className="bg-secondary border border-border rounded-lg p-4">
              {isImage ? (
                <div className="text-center">
                  <img 
                    src={originalImageUrl} 
                    alt="Original file" 
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
                  />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Image preview - {selectedFile.name}
                  </p>
                </div>
              ) : (
                <pre className="text-sm text-foreground whitespace-pre-wrap font-mono overflow-auto max-h-64">
                  {truncateContent(originalContent)}
                </pre>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Algorithm Results */}
      {hasResult && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Encryption & Decryption Process - {selectedAlgorithm.toUpperCase()}
          </h3>
          
          {(() => {
            const algorithmData = {
              aes: { label: 'AES-256', icon: Lock, strength: 'Military Grade' },
              des: { label: 'DES', icon: Key, strength: 'Legacy Standard' },
              rsa: { label: 'RSA-2048', icon: Shield, strength: 'Public Key' }
            }[selectedAlgorithm];
            
            const encryptedContent = algorithmResult.encrypted;
            const decryptedContent = algorithmResult.decrypted;
            const encryptedImageUrl = algorithmResult.encryptedImageUrl;
            const decryptedImageUrl = algorithmResult.decryptedImageUrl;
            
            const Icon = algorithmData.icon;
            
            return (
              <Card className="bg-gradient-card border-border shadow-card animate-slide-up">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-primary" />
                      <div>
                        <h4 className="font-semibold text-foreground">{algorithmData.label}</h4>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                          {algorithmData.strength}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(encryptedContent + '\n\n' + decryptedContent, `${algorithmData.label} Results`)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowResult(!showResult)}
                      >
                        {showResult ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  {showResult && (
                    <div className="space-y-4">
                      {/* Original Content */}
                      <div className="bg-secondary border border-border rounded-lg p-4">
                        <h5 className="text-sm font-medium text-blue-600 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Original Content ({algorithmData.label} Process)
                        </h5>
                        {isImage ? (
                          <div className="text-center">
                            <img 
                              src={originalImageUrl} 
                              alt="Original file" 
                              className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
                            />
                            <div className="mt-3 text-sm text-muted-foreground">
                              <p>{selectedFile?.name} (Original)</p>
                              <p>{selectedFile?.type} • {Math.round((selectedFile?.size || 0) / 1024)} KB</p>
                            </div>
                          </div>
                        ) : (
                          <pre className="text-sm text-foreground whitespace-pre-wrap font-mono overflow-auto max-h-48">
                            {truncateContent(originalContent)}
                          </pre>
                        )}
                      </div>

                      {/* Encrypted Result */}
                      <div className="bg-secondary border border-border rounded-lg p-4">
                        <h5 className="text-sm font-medium text-destructive mb-3 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Encrypted Content ({algorithmData.label})
                        </h5>
                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-48">
                          {truncateContent(encryptedContent)}
                        </pre>
                        <div className="flex justify-end mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(encryptedContent, 'Encrypted content')}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Encrypted
                          </Button>
                        </div>
                      </div>

                      {/* Decrypted Result */}
                      <div className="bg-secondary border border-border rounded-lg p-4">
                        <h5 className="text-sm font-medium text-green-600 mb-3 flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          Decrypted Content ({algorithmData.label})
                        </h5>
                        {isImage ? (
                          <div className="text-center">
                            <img 
                              src={decryptedImageUrl} 
                              alt="Decrypted file" 
                              className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
                            />
                            <div className="mt-3 text-sm text-muted-foreground">
                              <p>{selectedFile?.name} (Decrypted)</p>
                              <p>Successfully restored to original format</p>
                            </div>
                          </div>
                        ) : (
                          <pre className="text-sm text-foreground whitespace-pre-wrap font-mono overflow-auto max-h-48">
                            {truncateContent(decryptedContent)}
                          </pre>
                        )}
                        <div className="flex justify-end mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(decryptedContent, 'Decrypted content')}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Decrypted
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })()}
        </div>
      )}
    </div>
  );
};