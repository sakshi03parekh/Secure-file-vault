import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Download, Loader2 } from 'lucide-react';
import { Algorithm } from './AlgorithmSelector';

interface ActionPanelProps {
  selectedFile: File | null;
  selectedAlgorithm: Algorithm;
  onEncrypt: () => void;
  onDecrypt: () => void;
  onDownloadResult: () => void;
  isProcessing: boolean;
  hasResult: boolean;
  processingType?: 'encrypt' | 'decrypt';
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  selectedFile,
  selectedAlgorithm,
  onEncrypt,
  onDecrypt,
  onDownloadResult,
  isProcessing,
  hasResult,
  processingType
}) => {
  const canProcess = selectedFile && selectedAlgorithm && !isProcessing;

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Security Actions
        </h3>

        <div className="space-y-4">
          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="encrypt"
              onClick={onEncrypt}
              disabled={!canProcess}
              className="h-12"
            >
              {isProcessing && processingType === 'encrypt' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Encrypting...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Encrypt File
                </>
              )}
            </Button>

            <Button
              variant="decrypt"
              onClick={onDecrypt}
              disabled={!canProcess}
              className="h-12"
            >
              {isProcessing && processingType === 'decrypt' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Decrypting...
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  Decrypt File
                </>
              )}
            </Button>
          </div>

          {/* Download Result */}
          {hasResult && (
            <Button
              variant="secure"
              onClick={onDownloadResult}
              disabled={isProcessing}
              className="w-full h-12 animate-slide-up"
            >
              <Download className="w-4 h-4" />
              Download Result
            </Button>
          )}

          {/* Status Information */}
          <div className="text-center pt-2">
            {!selectedFile && (
              <p className="text-muted-foreground text-sm">
                Select a file to begin encryption
              </p>
            )}
            {selectedFile && !isProcessing && (
              <p className="text-muted-foreground text-sm">
                Ready to process with {selectedAlgorithm.toUpperCase()}
              </p>
            )}
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-sm font-medium">
                  Processing your file securely...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};