'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { createOrUpdateUser, updateUserProfile, updateUserOnlineStatus, getUserData, isUserAdmin } from './userService';

// Basic type for auth
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
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
  isAdmin: false,
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
  const [isAdmin, setIsAdmin] = useState(false);

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
          
          // Get the ID token
          const idToken = await user.getIdToken();
          
          // 1. First try client-side approach
          console.log('Setting session cookie via client-side');
          setSessionCookie(idToken);
          
          // 2. Also try server-side approach as a backup
          console.log('Setting session cookie via server-side API');
          await sendTokenToServer(idToken, user.uid);
          
          // 3. Check admin status and set admin-session cookie if needed
          await checkAndSetAdminStatus();
          
          // Check admin status
          const adminStatus = await isUserAdmin(user.uid);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Failed to create/update user document:', error);
        }
      } else {
        // Clear the session cookie if user logs out
        clearSessionCookies();
        setIsAdmin(false);
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

  // Update token refresh logic
  useEffect(() => {
    if (!user || typeof window === 'undefined') return;

    // Firebase tokens expire after 1 hour
    // Let's refresh them every 55 minutes
    const tokenRefreshInterval = setInterval(async () => {
      try {
        console.log('Refreshing Firebase ID token');
        // Force token refresh
        const idToken = await user.getIdToken(true);
        
        // Update cookie via both approaches
        console.log('Refreshing session cookie via client-side');
        setSessionCookie(idToken);
        
        console.log('Refreshing session cookie via server-side API');
        await sendTokenToServer(idToken, user.uid);
        
        // Check and update admin status and cookies
        await checkAndSetAdminStatus();
        
        console.log('Updated session cookie with refreshed token');
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }, 55 * 60 * 1000); // 55 minutes

    return () => clearInterval(tokenRefreshInterval);
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
        
        // Set session cookie
        const idToken = await result.user.getIdToken();
        setSessionCookie(idToken);
        console.log('Set session cookie after Google sign-in');
        
        // Check and set admin session if needed
        await checkAndSetAdminStatus();
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
        
        // Set session cookie
        const idToken = await result.user.getIdToken();
        setSessionCookie(idToken);
        console.log('Set session cookie after Discord sign-in');
        
        // Check and set admin session if needed
        await checkAndSetAdminStatus();
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Set session cookie
      const idToken = await userCredential.user.getIdToken();
      setSessionCookie(idToken);
      console.log('Set session cookie after email sign-in');
      
      // Check and set admin session if needed
      await checkAndSetAdminStatus();
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
        
        // Set session cookie
        const idToken = await userCredential.user.getIdToken();
        setSessionCookie(idToken);
        console.log('Set session cookie after email sign-up');
        
        // Check and set admin session if needed
        await checkAndSetAdminStatus();
      }
    } catch (error) {
      console.error('Email sign-up error:', error);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      // Clear the session cookies
      clearSessionCookies();
      console.log('Cleared session cookies on logout');
      
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

  // After successful login or token refresh, check admin status and set admin-session cookie
  const checkAndSetAdminStatus = async () => {
    try {
      console.log('Checking admin status and setting admin-session cookie if needed');
      const response = await fetch('/api/admin/check');
      if (response.ok) {
        const result = await response.json();
        console.log('Admin check result:', result);
        setIsAdmin(result.isAdmin);
      } else {
        console.error('Failed to check admin status:', await response.text());
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  // Value object
  const value = {
    user,
    loading,
    isAdmin,
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

// Helper function to set session cookie
const setSessionCookie = (token: string) => {
  if (typeof window === 'undefined') return;
  
  // Check if this is actually a Firebase token
  // Firebase tokens are JWTs which should start with "ey" and have two dots
  if (!token.startsWith('ey') || token.split('.').length !== 3) {
    console.error('WARNING: Attempting to set an invalid Firebase ID token:', 
      token.substring(0, 10) + '...' + token.substring(token.length - 10));
    console.error('Token length:', token.length);
    console.error('Token format check:', {
      startsWithEy: token.startsWith('ey'),
      hasTwoDots: token.split('.').length === 3
    });
    return; // Don't set an invalid token
  }
  
  // Calculate an expiry date (1 hour from now)
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 1);
  
  // Set secure flag if on HTTPS
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  
  // Debug: Check for any existing session cookie
  const existingCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('session='));
  
  if (existingCookie) {
    console.log('Replacing existing session cookie:', 
      existingCookie.substring(8, 18) + '...' + 
      existingCookie.substring(existingCookie.length - 10));
  }
  
  // Set the cookie
  const cookieStr = `session=${token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax${secure}`;
  document.cookie = cookieStr;
  
  // Verify it was set correctly
  setTimeout(() => {
    const newCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('session='));
    
    if (newCookie) {
      const cookieValue = newCookie.substring(8);
      if (cookieValue === token) {
        console.log('Session cookie correctly set, expires:', expiryDate.toUTCString());
      } else {
        console.error('Session cookie was modified! Expected:', 
          token.substring(0, 10) + '...' + token.substring(token.length - 10));
        console.error('Actual:', 
          cookieValue.substring(0, 10) + '...' + cookieValue.substring(cookieValue.length - 10));
      }
    } else {
      console.error('Failed to set session cookie!');
    }
  }, 100);
};

// Helper function to clear session cookies
const clearSessionCookies = () => {
  if (typeof window === 'undefined') return;
  
  // Clear regular session cookie
  document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  
  // Clear admin session cookie
  document.cookie = 'admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  
  console.log('Session cookies cleared');
};

// Also add a function to bypass the cookie and use a direct API approach
// Add this function after the clearSessionCookie function
async function sendTokenToServer(idToken: string, uid: string) {
  try {
    console.log('Sending token to server via API...');
    
    // First try the session endpoint
    const sessionResponse = await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken, uid }),
    });
    
    const sessionResult = await sessionResponse.json();
    
    if (sessionResponse.ok) {
      console.log('Token sent to session API successfully');
      
      // Now verify the session was set properly by checking the token debug endpoint
      try {
        console.log('Verifying token was set correctly...');
        const verifyResponse = await fetch('/api/admin/debug/token');
        
        if (verifyResponse.ok) {
          const verifyResult = await verifyResponse.json();
          console.log('Token verification result:', verifyResult.verified ? 'Success' : 'Failed');
          
          if (verifyResult.verified) {
            console.log('Session verified successfully!');
            return { success: true, message: 'Session set and verified' };
          } else {
            console.warn('Session set but verification failed:', verifyResult.error);
            
            // Check Firebase Admin initialization status
            const adminStatusResponse = await fetch('/api/debug/firebase-admin');
            if (adminStatusResponse.ok) {
              const adminStatus = await adminStatusResponse.json();
              console.error('Firebase Admin initialization status:', adminStatus);
              
              if (adminStatus?.initStatus?.hasError) {
                console.error('Firebase Admin SDK has an error:', adminStatus.initStatus.errorMessage);
                
                // Try to fix the private key if that's the issue
                if (adminStatus.initStatus.errorMessage?.includes('private key')) {
                  console.log('Attempting to fix private key issue...');
                  await fetch('/api/debug/fix-private-key');
                  
                  // Try verification again after fix attempt
                  const retryResponse = await fetch('/api/admin/debug/token');
                  const retryResult = await retryResponse.json();
                  
                  if (retryResponse.ok && retryResult.verified) {
                    console.log('Session verified successfully after fix!');
                    return { success: true, message: 'Session set and verified after fixing private key' };
                  }
                }
              }
            }
            
            return { 
              success: false, 
              message: 'Session set but not verifiable', 
              error: verifyResult.error 
            };
          }
        } else {
          console.error('Failed to verify token:', await verifyResponse.text());
          return { 
            success: true, 
            message: 'Session set but verification endpoint failed', 
            sessionResult 
          };
        }
      } catch (verifyError) {
        console.error('Error verifying token:', verifyError);
        return { 
          success: true, 
          message: 'Session set but verification check errored', 
          sessionResult 
        };
      }
    } else {
      console.error('Failed to send token to server:', sessionResult);
      return { success: false, error: sessionResult.error || 'Unknown error' };
    }
  } catch (error) {
    console.error('Error sending token to server:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 