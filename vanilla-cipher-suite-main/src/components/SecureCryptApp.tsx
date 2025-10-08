import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { AlgorithmSelector, Algorithm } from './AlgorithmSelector';
import { KeyDisplay } from './KeyDisplay';
import { ActionPanel } from './ActionPanel';
import { FileContentDisplay } from './FileContentDisplay';
import { Shield, Lock,LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import securityIcon from '@/assets/security-icon.png';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { encryptionAPI } from '@/api/encryption';

export const SecureCryptApp: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>('aes');
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [ivBase64, setIvBase64] = useState<string>('');
  const [saltBase64, setSaltBase64] = useState<string>('');
  const [keyBase64, setKeyBase64] = useState<string>('');
  const [encryptedKeyBase64, setEncryptedKeyBase64] = useState<string>('');
  const [passphrase, setPassphrase] = useState<string>('');
  const [privateKey, setPrivateKey] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [hasResult, setHasResult] = useState(false);
  const [downloadFilename, setDownloadFilename] = useState<string>(''); // Add this state

  const { toast } = useToast();
  const { user, logout } = useAuth(); // Get user and logout function from AuthContext
  const navigate = useNavigate(); // Get navigate function for redirect


  // Handle logout
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/login'); // Redirect to login page after logout
  };

  // Mock encryption function (in real app, this would call backend)
  const generateMockKey = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
const extractFilename = (contentDisposition: string | undefined): string => {
  if (!contentDisposition) return '';
  const match = contentDisposition.match(/filename="?([^"]+)"?/);
  return match ? match[1] : '';
};
  const handleEncrypt = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProcessingType('encrypt');
    try {
      const response = await encryptionAPI.encryptFile(selectedFile, selectedAlgorithm as any);
      const arrayBuffer = response.data as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
      setDownloadBlob(blob);
       const headers = response.headers as any;
    const contentDisposition = headers['content-disposition'] || headers['Content-Disposition'];
    const filename = extractFilename(contentDisposition) || `${selectedFile.name}.enc`;
    setDownloadFilename(filename);
      // try {
      //   // Replace selected file with returned encrypted blob so decrypt uses it directly
      //   const encryptedFile = new File([blob], `${selectedFile.name}.enc`, { type: 'application/octet-stream' });
      //   setSelectedFile(encryptedFile);
      // } catch {}
      // setHasResult(true);
      try {
      // Replace selected file with returned encrypted blob so decrypt uses it directly
      const encryptedFile = new File([blob], filename, { type: 'application/octet-stream' });
      setSelectedFile(encryptedFile);
    } catch {}
    setHasResult(true);

      // const headers = response.headers as any;
      // console.log('Encryption response headers:', headers);
      // console.log('All header keys:', Object.keys(headers));
      
      // Try different case variations for headers
      const ivB64 = headers['x-iv-base64'] || headers['X-IV-Base64'] || headers['X-iv-base64'];
      const algo = headers['x-algorithm'] || headers['X-Algorithm'] || headers['X-algorithm'];
      const originalFilename = headers['x-original-filename'] || headers['X-Original-Filename'] || headers['X-original-filename'];
      
      console.log('Parsed headers:', { ivB64, algo, originalFilename });
      
      // Check if IV is present (required for decryption)
      if (!ivB64) {
        console.error('No IV header found!');
        toast({
          title: "Warning",
          description: "No IV received from server. Decryption may not work.",
          variant: "destructive",
        });
      }

      // Set the IV for decryption (only thing needed with static key)
      setIvBase64(ivB64 || '');
      
      // Clear all key-related fields since we use static key
      setEncryptionKey('Static Key (Server-side)');
      setSaltBase64('');
      setKeyBase64('');
      setEncryptedKeyBase64('');
      setPassphrase('');
      setPrivateKey('');

      toast({
        title: "Encryption Complete",
        description: `Encrypted with ${String(algo || selectedAlgorithm).toUpperCase()} using static key • IV: ${ivB64 ? 'Present' : 'Missing'}`,
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'An error occurred during encryption. Please try again.';
      toast({
        title: "Encryption Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // const handleDecrypt = async () => {
  //   if (!selectedFile) return;
    
  //   setIsProcessing(true);
  //   setProcessingType('decrypt');
    
  //   try {
  //     // Validate required metadata before calling backend to avoid 400s
  //     if (!ivBase64) {
  //       toast({
  //         title: "Missing IV",
  //         description: "IV is required for decryption. Please encrypt a file first to get the IV.",
  //         variant: "destructive",
  //       });
  //       setIsProcessing(false);
  //       return;
  //     }

  //     // With static key system, we only need the IV and algorithm
  //     const response = await encryptionAPI.decryptFile(
  //       selectedFile,
  //       selectedAlgorithm as any,
  //       {
  //         ivBase64,
  //       }
  //     );
  //     const arrayBuffer = response.data as ArrayBuffer;
  //     const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
  //     setDownloadBlob(blob);
  //     try {
  //       const decryptedName = selectedFile.name.replace(/\.enc$/, '') || `decrypted-${Date.now()}`;
  //       const decryptedFile = new File([blob], decryptedName, { type: 'application/octet-stream' });
  //       setSelectedFile(decryptedFile);
  //     } catch {}
  //     setHasResult(true);

  //     toast({
  //       title: "Decryption Complete",
  //       description: `File decrypted successfully with ${String(selectedAlgorithm).toUpperCase()} using static key`,
  //     });
  //   } catch (error: any) {
  //     let message = 'An error occurred during decryption. Please verify the file and algorithm.';
  //     try {
  //       const data = error?.response?.data;
  //       if (data instanceof Blob) {
  //         const text = await data.text();
  //         try {
  //           const json = JSON.parse(text);
  //           if (json?.message) message = json.message;
  //         } catch {
  //           if (text) message = text;
  //         }
  //       } else if (typeof data === 'object' && data?.message) {
  //         message = data.message;
  //       }
  //     } catch {}
  //     toast({
  //       title: "Decryption Failed",
  //       description: message,
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  // ...existing code...
// ...existing code...
const handleDecrypt = async () => {
  if (!selectedFile) return;

  setIsProcessing(true);
  setProcessingType('decrypt');

  try {
    if (!ivBase64) {
      toast({
        title: "Missing IV",
        description: "IV is required for decryption. Please encrypt a file first to get the IV.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }
console.log("api call decryptFile" );

    // Pass IV as a header!
    const response = await encryptionAPI.decryptFile(
      selectedFile,
      selectedAlgorithm as any,
      {
        ivBase64,
      }
    );
    const arrayBuffer = response.data as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
    setDownloadBlob(blob);

    const headers = response.headers as any;
    const contentDisposition = headers['content-disposition'] || headers['Content-Disposition'];
    const filename = extractFilename(contentDisposition) || selectedFile.name.replace(/\.enc$/, '') || `decrypted-${Date.now()}`;
    setDownloadFilename(filename);

    try {
      const decryptedFile = new File([blob], filename, { type: 'application/octet-stream' });
      setSelectedFile(decryptedFile);
    } catch {}
    setHasResult(true);

    toast({
      title: "Decryption Complete",
      description: `File decrypted successfully with ${String(selectedAlgorithm).toUpperCase()} using static key`,
    });
  } catch (error: any) {
    let message = 'An error occurred during decryption. Please verify the file and algorithm.';
    try {
      const data = error?.response?.data;
      if (data instanceof Blob) {
        const text = await data.text();
        try {
          const json = JSON.parse(text);
          if (json?.message) message = json.message;
        } catch {
          if (text) message = text;
        }
      } else if (typeof data === 'object' && data?.message) {
        message = data.message;
      }
    } catch {}
    toast({
      title: "Decryption Failed",
      description: message,
      variant: "destructive",
    });
  } finally {
    setIsProcessing(false);
  }
};
// ...existing code...
// ...existing code...

  // const handleDownloadResult = () => {
  //   if (!downloadBlob) return;
  //   const url = URL.createObjectURL(downloadBlob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = processingType === 'decrypt' ? `decrypted-${Date.now()}.dec` : `encrypted-${Date.now()}.enc`;
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  //   URL.revokeObjectURL(url);
  // };

  const handleDownloadResult = () => {
  if (!downloadBlob) return;
  const url = URL.createObjectURL(downloadBlob);
  const a = document.createElement('a');
  // Use the filename from the Content-Disposition header if available
  a.download = downloadFilename || (processingType === 'decrypt' ? `decrypted-${Date.now()}.dec` : `encrypted-${Date.now()}.enc`);
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
  const handleDownloadKey = () => {
    if (!encryptionKey) return;
    
    const blob = new Blob([encryptionKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `encryption-key-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
 
  

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-gradient-card border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <img 
                  src={securityIcon} 
                  alt="SecureCrypt Security" 
                  className="w-16 h-16 animate-float"
                />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slow"></div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                SecureCrypt
              </h1>
            </div>

           <div className="flex items-center justify-center gap-4 ml-auto"> {/* ml-auto pushes it to the right */}
              <span className="text-lg font-semibold text-foreground"> {/* Larger text */}
                Welcome, {user?.username}!
              </span>
            </div>
              
          
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Military-grade encryption for your sensitive files. 
              <br />
              <span className="text-primary font-medium">Zero-knowledge architecture</span> ensures only you have access to your data.
            </p>
            
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <span>AES-256 Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-accent" />
                <span>Client-Side Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <span>No Data Storage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Application */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <FileUpload
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              isProcessing={isProcessing}
            />
            
            <AlgorithmSelector
              selectedAlgorithm={selectedAlgorithm}
              onAlgorithmChange={setSelectedAlgorithm}
              disabled={isProcessing}
            />

            {/* Encryption Info */}
            <div className="bg-gradient-card border border-border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Encryption Info</h3>
              <div className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <p className="text-sm text-primary">
                    <strong>Static Key System:</strong> This system uses a secure static encryption key stored on the server. 
                    No key management is required on your end - just select your algorithm and encrypt/decrypt your files.
                  </p>
                </div>
                {ivBase64 && (
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                    <p className="text-sm text-accent">
                      <strong>IV (Initialization Vector):</strong> {ivBase64.substring(0, 20)}...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This IV is automatically managed and required for decryption.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <ActionPanel
              selectedFile={selectedFile}
              selectedAlgorithm={selectedAlgorithm}
              onEncrypt={handleEncrypt}
              onDecrypt={handleDecrypt}
              onDownloadResult={handleDownloadResult}
              isProcessing={isProcessing}
              hasResult={hasResult}
              processingType={processingType}
            />

            <KeyDisplay
              encryptionKey={encryptionKey}
              onDownload={handleDownloadKey}
            />
          </div>

          {/* Right Column - File Content */}
          <div className="space-y-6">
            <FileContentDisplay
              selectedFile={selectedFile}
              selectedAlgorithm={selectedAlgorithm}
              isProcessing={isProcessing}
              hasResult={hasResult}
              processingType={processingType}
            />
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-secondary/30 border border-border rounded-lg p-6 text-center">
            <Shield className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Your Security is Our Priority
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              This system uses military-grade encryption with a secure static key stored on the server. 
              Your files are encrypted using industry-standard algorithms (AES-256, 3DES, RSA) with unique initialization vectors for each encryption.
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center">
  <button
    onClick={handleLogout}
    className="w-28 flex items-center justify-center gap-2 px-3 py-3 mt-6
               bg-red-500 hover:bg-red-600 text-white rounded-lg 
               shadow-md transition-all duration-200 text-sm font-medium"
    title="Logout"
  >
    <LogOut className="h-4 w-4" />
    Logout
  </button>
</div>

      
        
      </div>
    </div>
  );
};