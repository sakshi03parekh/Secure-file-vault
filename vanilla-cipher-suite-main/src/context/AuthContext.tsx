import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI } from '../api/auth';

interface User {
  _id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: { username: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
		// Check if we have a token on app load
		if (token) {
			// Verify token using backend /verify-token endpoint
			authAPI.verifyToken({ token })
				.then((data: any) => {
					if (data?.valid) {
						// Fetch full user profile to ensure username is available
						return authAPI.getCurrentUser(token)
							.then((userData) => {
								setUser(userData);
							});
					} else {
						localStorage.removeItem('token');
						setToken(null);
					}
				})
				.catch(() => {
					// Token is invalid, clear it
					localStorage.removeItem('token');
					setToken(null);
				})
				.finally(() => {
					setLoading(false);
				});
		} else {
			setLoading(false);
		}
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    try {
			const response = await authAPI.login(credentials);
			setToken(response.token);
			setUser(response.user || response);
      localStorage.setItem('token', response.token);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const signup = async (userData: { username: string; email: string; password: string }) => {
    try {
			const response = await authAPI.signup(userData);
			setToken(response.token);
			setUser(response.user || response);
      localStorage.setItem('token', response.token);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Signup failed' 
      };
    }
  };
  

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    signup,
    logout,
    loading
  };
  

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};