'use client';
import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    username: string;
  } | null;
  isLoaded: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoaded: false,
  
  loadFromStorage: () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('auth-storage');
        if (stored) {
          const { isAuthenticated, user } = JSON.parse(stored);
          set({ isAuthenticated, user, isLoaded: true });
        } else {
          set({ isLoaded: true });
        }
      } catch (error) {
        console.error('Error loading auth from storage:', error);
        set({ isLoaded: true });
      }
    }
  },
  
  login: async (username: string, password: string) => {
    // Kiểm tra credentials với .env
    const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    if (username === adminUsername && password === adminPassword) {
      const authData = { 
        isAuthenticated: true, 
        user: { username } 
      };
      
      set({ ...authData, isLoaded: true });
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-storage', JSON.stringify(authData));
      }
      
      return true;
    }
    
    return false;
  },
  
  logout: () => {
    const authData = { 
      isAuthenticated: false, 
      user: null,
      isLoaded: true
    };
    
    set(authData);
    
    // Remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage');
    }
  },
}));