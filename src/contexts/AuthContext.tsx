import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import logger from '@/lib/logger';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Мок данные для авторизации
const MOCK_EMAIL = 'testpanel@gmail.com';
const MOCK_PASSWORD = 'testpanel1$';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Проверяем сохраненную сессию при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        logger.info('AUTH', 'User session restored', { email: userData.email }, 'AuthProvider', 'SESSION_RESTORED');
      } catch (error) {
        logger.error('AUTH', 'Session restoration error', error, 'AuthProvider', 'SESSION_ERROR');
        localStorage.removeItem('auth_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Мок проверка (trim для удаления пробелов)
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    if (trimmedEmail === MOCK_EMAIL && trimmedPassword === MOCK_PASSWORD) {
      const userData = { email: trimmedEmail };
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      logger.info('AUTH', 'Login successful', { email: trimmedEmail }, 'AuthProvider', 'LOGIN_SUCCESS');
      return true;
    } else {
      logger.warn('AUTH', 'Invalid credentials', { 
        providedEmail: trimmedEmail, 
        providedPassword: trimmedPassword,
        expectedEmail: MOCK_EMAIL 
      }, 'AuthProvider', 'LOGIN_FAILED');
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Мок регистрация - просто сохраняем пользователя
    const userData = { email };
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    logger.info('AUTH', 'Registration successful', { email }, 'AuthProvider', 'REGISTER_SUCCESS');
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    logger.info('AUTH', 'Logout', {}, 'AuthProvider', 'LOGOUT');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
