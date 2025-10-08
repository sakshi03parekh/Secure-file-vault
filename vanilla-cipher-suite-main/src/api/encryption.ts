import axios from 'axios';

// Separate axios instance that points to server root
// so we can call baseURL + "/api/encrypt" as requested
const rootApi = axios.create({
  baseURL: 'http://localhost:5000',
});

export type SupportedAlgorithm = 'aes' | 'des' | 'rsa';

export interface EncryptOptions {
  // No options needed since we use static key
}

export const encryptionAPI = {
  async encryptFile(file: File, algorithm: SupportedAlgorithm, options: EncryptOptions = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('algorithm', algorithm);

    const response = await rootApi.post('/api/auth/encrypt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'arraybuffer',
    });

    // Log headers for debugging
    console.log('Raw response headers:', response.headers);
    console.log('Response status:', response.status);
    
    return response; // caller can read response.data (Blob) and response.headers
  },
  async decryptFile(
    file: File,
    algorithm: SupportedAlgorithm,
    meta: {
      ivBase64: string;
    }
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('algorithm', algorithm);
    formData.append('iv', meta.ivBase64);

    const headers: Record<string, string> = {};
    headers['X-IV-Base64'] = meta.ivBase64;

    const response = await rootApi.post('/api/auth/decrypt', formData, {
      headers,
      responseType: 'arraybuffer',
    });
    return response;
  },
};

export default encryptionAPI;

