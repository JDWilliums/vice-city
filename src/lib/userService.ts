import { User } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getRandomProfilePicture } from '@/constants/profilePictures';

interface UserPreferences {
  emailNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
  lastUpdated: Timestamp;
  createdAt: Timestamp;
  isOnline: boolean;
  isAdmin: boolean;
  preferences: UserPreferences;
}

export async function createOrUpdateUser(user: User, additionalData?: Partial<UserData>) {
  try {
    console.log('Starting createOrUpdateUser for uid:', user.uid);
    const userRef = doc(db, 'users', user.uid);
    
    console.log('Checking if user document exists');
    const userSnap = await getDoc(userRef);
    console.log('User document exists:', userSnap.exists());
    
    // Get existing user data if it exists
    const existingData = userSnap.exists() ? userSnap.data() as UserData : null;
    
    // Base user data that's always set/updated
    const userData: Partial<UserData> = {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || `User${user.uid.slice(0, 6)}`,
      photoURL: user.photoURL || getRandomProfilePicture(),
      provider: user.providerData[0]?.providerId || 'unknown',
      lastUpdated: serverTimestamp() as Timestamp,
      isOnline: true,
      // Preserve existing admin status or set to false for new users
      isAdmin: existingData?.isAdmin || false,
      ...additionalData
    };

    console.log('Prepared user data:', {
      ...userData,
      isAdmin: userData.isAdmin ? 'true' : 'false'
    });

    // If this is a new user, add createdAt and default preferences
    if (!userSnap.exists()) {
      console.log('Adding new user specific fields');
      userData.createdAt = serverTimestamp() as Timestamp;
      userData.preferences = {
        emailNotifications: true,
        theme: 'system'
      };
      // Ensure isAdmin is false for new users
      userData.isAdmin = false;
    }

    console.log('Attempting to write to Firestore');
    await setDoc(userRef, userData, { merge: true });
    console.log('Successfully wrote to Firestore');
    
    return userData;
  } catch (error: any) {
    console.error('Error in createOrUpdateUser:', error);
    console.error('Error details:', {
      userId: user.uid,
      errorCode: error?.code || 'UNKNOWN',
      errorMessage: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace'
    });
    throw error;
  }
}

export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserData>) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// New function to update user online status
export async function updateUserOnlineStatus(uid: string, isOnline: boolean) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isOnline,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user online status:', error);
    throw error;
  }
}

// New function to update user preferences
export async function updateUserPreferences(uid: string, preferences: Partial<UserPreferences>) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      'preferences': preferences,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
}

export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? (userSnap.data() as UserData).isAdmin || false : false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function checkAdminStatus(uid: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return false;
    }
    const userData = userDoc.data() as UserData;
    return userData.isAdmin || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
} 