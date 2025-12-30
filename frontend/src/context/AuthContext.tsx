import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { login, register } from '../api/auth';
import type { LoginData, RegisterData, AuthResponse } from '../api/auth';

// Admin emails configuration
const ADMIN_EMAILS = [
  'ruhankb29@gmail.com',
  'prasanthsri542@gmail.com',
  'sunshine.sankum@gmail.com',
  'suganthr09@gmail.com'
];

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
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
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if current user is admin
  const isAdmin = user ? ADMIN_EMAILS.includes(user.email) : false;

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const handleLogin = async (data: LoginData): Promise<boolean> => {
    try {
      const response: AuthResponse = await login(data);

      setToken(response.token);
      setUser(response.user);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      return true; // ✅ success signal
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // UI will handle error display
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await register(data);

      setToken(response.token);
      setUser(response.user);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
