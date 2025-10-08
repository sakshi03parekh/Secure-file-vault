import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend URL
});

// API methods
export const authAPI = {
  // Signup method
  async signup(userData: { username: string; email: string; password: string }) {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  // Login method
  async login(credentials: { email: string; password: string }) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  async verifyToken(credentials: { token: string }) {
    const response = await api.post('/auth/verify-token', credentials);
    return response.data;
  },
  // Get current user (protected route)
  async getCurrentUser(token: string) {
    const response = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default api;