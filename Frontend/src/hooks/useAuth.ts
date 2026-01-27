import { useState, useEffect, createContext, useContext } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS, delay } from '../utils/mockData';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

// Create context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => {},
  logout: () => {}
});

export function useAuth() {
  return useContext(AuthContext);
}

// Simple provider for wrapping the app
// Note: In a real app, this would be in a separate provider file
export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check local storage on mount
    const storedUser = localStorage.getItem('school_bus_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, role: UserRole) => {
    setIsLoading(true);
    await delay(800); // Simulate network request

    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.role === role
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('school_bus_user', JSON.stringify(foundUser));
    } else {
      // Fallback for demo purposes if email doesn't match exactly but role does
      // This ensures the demo is robust
      const demoUser = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
      setUser(demoUser);
      localStorage.setItem('school_bus_user', JSON.stringify(demoUser));
    }

    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('school_bus_user');
  };

  return { user, isLoading, login, logout };
};