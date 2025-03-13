'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { 
  User, 
  Auth,
  GoogleAuthProvider,
  OAuthProvider
} from 'firebase/auth';

// Create a type for the auth instance
let auth: Auth;
let googleProvider: GoogleAuthProvider;
let discordProvider: OAuthProvider;

// Only initialize Firebase on the client side
if (typeof window !== "undefined") {
  const { getAuth, GoogleAuthProvider, OAuthProvider } = require('firebase/auth');
  const { app } = require('./firebase');
  
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  discordProvider = new OAuthProvider('discord');
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithDiscord: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Track auth state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const { onAuthStateChanged } = require('firebase/auth');
      const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
        setUser(user);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  // Google sign-in
  const signInWithGoogle = async () => {
    try {
      const { signInWithPopup, updateProfile } = await import('firebase/auth');
      const { getRandomProfilePicture } = await import('@/constants/profilePictures');
      
      const result = await signInWithPopup(auth, googleProvider);
      // Always assign a random profile picture, ignoring Google profile picture
      if (result.user) {
        await updateProfile(result.user, {
          photoURL: getRandomProfilePicture()
        });
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  // Discord sign-in
  const signInWithDiscord = async () => {
    try {
      const { signInWithPopup, updateProfile } = await import('firebase/auth');
      const { getRandomProfilePicture } = await import('@/constants/profilePictures');
      
      const result = await signInWithPopup(auth, discordProvider);
      // Always assign a random profile picture, ignoring Discord profile picture
      if (result.user) {
        await updateProfile(result.user, {
          photoURL: getRandomProfilePicture()
        });
      }
    } catch (error) {
      console.error('Discord sign-in error:', error);
      throw error;
    }
  };

  // Email sign-in
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email sign-in error:', error);
      throw error;
    }
  };

  // Email sign-up
  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const { getRandomProfilePicture } = await import('@/constants/profilePictures');
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Add display name and random profile picture to the user profile
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
          photoURL: getRandomProfilePicture()
        });
      }
    } catch (error) {
      console.error('Email sign-up error:', error);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Password reset
  const resetPassword = async (email: string) => {
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithDiscord,
    signInWithEmail,
    signUpWithEmail,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 