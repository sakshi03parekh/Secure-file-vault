import React from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Key, Lock } from 'lucide-react';

export type Algorithm = 'aes' | 'des' | 'rsa';

interface AlgorithmSelectorProps {
  selectedAlgorithm: Algorithm;
  onAlgorithmChange: (algorithm: Algorithm) => void;
  disabled?: boolean;
}

const algorithms = [
  {
    value: 'aes' as Algorithm,
    label: 'AES-256',
    description: 'Advanced Encryption Standard - Industry standard for file encryption',
    icon: Lock,
    strength: 'Military Grade'
  },
  {
    value: 'des' as Algorithm,
    label: 'DES',
    description: 'Data Encryption Standard - Legacy symmetric encryption algorithm',
    icon: Key,
    strength: 'Legacy Standard'
  },
  {
    value: 'rsa' as Algorithm,
    label: 'RSA-2048',
    description: 'Asymmetric encryption - Public key cryptography for secure sharing',
    icon: Shield,
    strength: 'Public Key'
  }
];

export const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  selectedAlgorithm,
  onAlgorithmChange,
  disabled = false
}) => {
  const selectedAlgorithmData = algorithms.find(alg => alg.value === selectedAlgorithm);

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Encryption Algorithm
        </h3>
        
        <div className="space-y-4">
          <Select 
            value={selectedAlgorithm} 
            onValueChange={onAlgorithmChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-full bg-input border-border shadow-input">
              <SelectValue placeholder="Choose encryption method" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {algorithms.map((algorithm) => {
                const Icon = algorithm.icon;
                return (
                  <SelectItem 
                    key={algorithm.value} 
                    value={algorithm.value}
                    className="hover:bg-secondary focus:bg-secondary"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-primary" />
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{algorithm.label}</span>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                          {algorithm.strength}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {selectedAlgorithmData && (
            <div className="bg-secondary/50 border border-border rounded-lg p-4 animate-slide-up">
              <div className="flex items-start gap-3">
                <selectedAlgorithmData.icon className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">
                    {selectedAlgorithmData.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAlgorithmData.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};