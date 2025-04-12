import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { signInWithGoogle, signOutUser, signInWithEmail, signUpWithEmail, resetPassword } from '../firebase/auth';
import { initGoogleApi, isSignedInToGoogle, signInToGoogle, signOutFromGoogle } from '../services/googleCalendar';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isGoogleCalendarConnected: boolean;
  connectionError: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogleAuth: () => Promise<{ success: boolean; error?: string }>;
  connectGoogleCalendar: () => Promise<{ success: boolean; error?: string }>;
  disconnectGoogleCalendar: () => Promise<{ success: boolean; error?: string }>;
  logOut: () => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Check network status
  useEffect(() => {
    function handleOnline() {
      setConnectionError(null);
    }

    function handleOffline() {
      setConnectionError('You are currently offline. Some features may be limited.');
    }

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      handleOffline();
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize Google API and check the calendar connection status
  useEffect(() => {
    const initGoogle = async () => {
      try {
        await initGoogleApi();
        setIsGoogleCalendarConnected(isSignedInToGoogle());
      } catch (error) {
        console.error('Failed to initialize Google API:', error);
        // Don't set error if it's just because we're using placeholder keys
        if (error instanceof Error && !error.message.includes('API key')) {
          setConnectionError('Google Calendar integration is unavailable');
        }
      }
    };

    if (currentUser) {
      initGoogle();
    }
  }, [currentUser]);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    }, (error: any) => {
      console.error('Auth state change error:', error);
      setIsLoading(false);
      if (error.code === 'auth/network-request-failed') {
        setConnectionError('Network error. Check your internet connection.');
      } else {
        setConnectionError(`Authentication error: ${error.message}`);
      }
    });

    return unsubscribe;
  }, []);

  // Email/Password Sign In
  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmail(email, password);
      return { success: result.success, error: result.success ? undefined : result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Email/Password Sign Up
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const result = await signUpWithEmail(email, password, displayName);
      return { success: result.success, error: result.success ? undefined : result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Google Sign In
  const signInWithGoogleAuth = async () => {
    try {
      const result = await signInWithGoogle();
      return { success: result.success, error: result.success ? undefined : result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Connect to Google Calendar
  const connectGoogleCalendar = async () => {
    try {
      const result = await signInToGoogle();
      if (result.success) {
        setIsGoogleCalendarConnected(true);
      }
      return { success: result.success, error: result.success ? undefined : result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Disconnect from Google Calendar
  const disconnectGoogleCalendar = async () => {
    try {
      const result = await signOutFromGoogle();
      if (result.success) {
        setIsGoogleCalendarConnected(false);
      }
      return { success: result.success, error: result.success ? undefined : result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Sign Out
  const logOut = async () => {
    try {
      // Sign out of Firebase
      const result = await signOutUser();
      
      // If connected to Google Calendar, also sign out from there
      if (isGoogleCalendarConnected) {
        await disconnectGoogleCalendar();
      }
      
      return { success: result.success, error: result.success ? undefined : result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Forgot Password
  const forgotPassword = async (email: string) => {
    try {
      const result = await resetPassword(email);
      return { success: result.success, error: result.success ? undefined : result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    currentUser,
    isLoading,
    isGoogleCalendarConnected,
    connectionError,
    signIn,
    signUp,
    signInWithGoogleAuth,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    logOut,
    forgotPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 