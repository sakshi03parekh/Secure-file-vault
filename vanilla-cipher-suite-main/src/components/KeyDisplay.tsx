import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Key, Copy, Eye, EyeOff, Download, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KeyDisplayProps {
  encryptionKey?: string;
  isVisible?: boolean;
  onDownload?: () => void;
}

export const KeyDisplay: React.FC<KeyDisplayProps> = ({
  encryptionKey,
  isVisible = false,
  onDownload
}) => {
  const [keyVisible, setKeyVisible] = useState(isVisible);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    if (!encryptionKey) return;
    
    try {
      await navigator.clipboard.writeText(encryptionKey);
      toast({
        title: "Key Copied",
        description: "Encryption key has been copied to clipboard securely.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy key to clipboard. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!encryptionKey || !onDownload) return;
    onDownload();
    toast({
      title: "Key Downloaded",
      description: "Encryption key has been saved securely.",
    });
  };

  if (!encryptionKey) {
    return (
      <Card className="bg-gradient-card border-border shadow-card opacity-50">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-muted-foreground" />
            Encryption System
          </h3>
          <div className="text-center py-8">
            <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Static key system - no key management needed
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Key className="w-5 h-5 text-primary animate-glow" />
            Encryption System
          </h3>
        </div>

        <div className="space-y-4">
          {/* Security Notice */}
          <div className="bg-primary/20 border border-primary/30 rounded-lg p-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-primary text-sm">
                Static Key System
              </p>
              <p className="text-primary/80 text-xs">
                This system uses a secure static key stored on the server. No key management required on your end.
              </p>
            </div>
          </div>

          {/* System Info Display */}
          <div className="relative">
            <Textarea
              value={encryptionKey}
              readOnly
              className="font-mono text-sm bg-input border-border shadow-input min-h-[80px] resize-none"
              placeholder="Encryption system information will appear here..."
            />
          </div>

          {/* Info Text */}
          <div className="text-center">
            <p className="text-muted-foreground text-xs">
              The encryption key is securely managed by the server. 
              Only the IV (Initialization Vector) is needed for decryption.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};