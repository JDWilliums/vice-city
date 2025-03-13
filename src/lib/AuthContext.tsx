'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { createOrUpdateUser, updateUserProfile, updateUserOnlineStatus, getUserData } from './userService';

// Basic type for auth
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

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithDiscord: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  logout: async () => {},
  resetPassword: async () => {}
});

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Set up auth state listener
  useEffect(() => {
    // Skip if window/auth not available (SSR)
    if (typeof window === 'undefined' || !auth) {
      return;
    }

    console.log('Setting up auth state listener');
    
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User logged in: ${user.uid}` : 'No user');
      
      if (user) {
        try {
          console.log('Attempting to create/update user document in Firestore');
          const userData = await createOrUpdateUser(user);
          console.log('Successfully created/updated user document:', userData);
        } catch (error) {
          console.error('Failed to create/update user document:', error);
        }
      }
      
      setUser(user);
      setLoading(false);
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  // Update online status on window focus/blur
  useEffect(() => {
    if (typeof window === 'undefined' || !user) return;

    const updateOnlineStatus = async (status: boolean) => {
      try {
        await updateUserOnlineStatus(user.uid, status);
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    };

    // Set user as online when window is focused
    const handleFocus = () => updateOnlineStatus(true);
    
    // Set user as offline when window is blurred
    const handleBlur = () => updateOnlineStatus(false);
    
    // Set user as offline when window is closed/refreshed
    const handleBeforeUnload = () => updateOnlineStatus(false);

    // Add event listeners
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Set initial online status
    updateOnlineStatus(true);

    // Cleanup
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateOnlineStatus(false);
    };
  }, [user]);

  // Google sign-in
  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in process');
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      const { getRandomProfilePicture } = await import('@/constants/profilePictures');
      
      const googleProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign-in successful:', result.user.uid);
      
      if (result.user) {
        // Check if user already exists in Firestore
        const userData = await getUserData(result.user.uid);
        const photoURL = userData?.photoURL || getRandomProfilePicture();
        
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(result.user, {
          photoURL
        });
        
        console.log('Creating/updating user document in Firestore');
        await createOrUpdateUser(result.user, {
          photoURL
        });
        console.log('User document updated successfully');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  // Discord sign-in
  const signInWithDiscord = async () => {
    try {
      console.log('Starting Discord sign-in process');
      const { signInWithPopup, OAuthProvider } = await import('firebase/auth');
      const { getRandomProfilePicture } = await import('@/constants/profilePictures');
      
      const discordProvider = new OAuthProvider('discord');
      const result = await signInWithPopup(auth, discordProvider);
      console.log('Discord sign-in successful:', result.user.uid);
      
      if (result.user) {
        // Check if user already exists in Firestore
        const userData = await getUserData(result.user.uid);
        const photoURL = userData?.photoURL || getRandomProfilePicture();
        
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(result.user, {
          photoURL
        });
        
        console.log('Creating/updating user document in Firestore');
        await createOrUpdateUser(result.user, {
          photoURL
        });
        console.log('User document updated successfully');
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
      console.log('Starting email sign-up process');
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const { getRandomProfilePicture } = await import('@/constants/profilePictures');
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created with Firebase Auth:', userCredential.user.uid);
      
      if (userCredential.user) {
        const randomPicture = getRandomProfilePicture();
        console.log('Updating user profile with:', { displayName, photoURL: randomPicture });
        
        await updateProfile(userCredential.user, {
          displayName: displayName,
          photoURL: randomPicture
        });
        
        console.log('Creating user document in Firestore');
        await createOrUpdateUser(userCredential.user, {
          displayName,
          photoURL: randomPicture
        });
        console.log('User document created successfully');
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

  // Value object
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

  // Return provider with loading state
  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg">
          <div className="text-white text-center">
            <div className="inline-block w-16 h-16 border-4 border-gta-pink border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
} 