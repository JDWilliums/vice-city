// This file should only be imported by server components or API routes
import { cert, getApps, initializeApp, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import logger from '@/utils/logger';

// For better error logging
const DEBUG = true;

// Global variables to store initialized instances
let app: App | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let initError: Error | null = null;

// Helper to properly format the private key
function formatPrivateKey(key: string): string {
  // If the key already has the right format (with newlines), return it as is
  if (key.includes('-----BEGIN PRIVATE KEY-----\n')) {
    return key;
  }
  
  // Remove any existing header/footer to start clean
  let formattedKey = key
    .replace(/\\n/g, '\n')
    .replace(/\n/g, '\n')
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .trim();
  
  // Strip any non-base64 characters
  formattedKey = formattedKey.replace(/[^a-zA-Z0-9+/=]/g, '');
  
  // Add header and footer with proper newlines
  formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----\n`;
  
  if (DEBUG) {
    logger.debug('Reformatted private key. New structure:');
    logger.debug(`Starts with: ${formattedKey.substring(0, 40)}...`);
    logger.debug(`Ends with: ...${formattedKey.substring(formattedKey.length - 40)}`);
    logger.debug(`Total length: ${formattedKey.length}`);
  }
  
  return formattedKey;
}

// Simpler initialization function - will log all steps for debugging
function createFirebaseAdminApp() {
  try {
    if (DEBUG) logger.debug('🔥 Attempting to initialize Firebase Admin SDK...');
    
    // Verify we're on the server
    if (typeof window !== 'undefined') {
      throw new Error('Firebase Admin SDK cannot be used in client-side code');
    }

    // Check for required environment variables
    const requiredEnvVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY'
    ];
    
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    }
    
    if (DEBUG) {
      logger.debug('✅ Environment variables check passed');
      logger.debug(`Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
      logger.debug(`Client Email: ${process.env.FIREBASE_CLIENT_EMAIL?.substring(0, 10)}...`);
      logger.debug(`Private Key exists: ${Boolean(process.env.FIREBASE_PRIVATE_KEY)}`);
      
      if (process.env.FIREBASE_PRIVATE_KEY) {
        const keyPreview = process.env.FIREBASE_PRIVATE_KEY.substring(0, 50);
        logger.debug(`Private Key begins with: ${keyPreview}...`);
        logger.debug(`Private Key contains BEGIN PRIVATE KEY: ${process.env.FIREBASE_PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----')}`);
      }
    }

    // Check if app is already initialized
    const apps = getApps();
    if (apps.length > 0) {
      if (DEBUG) logger.debug('🔄 Firebase Admin SDK already initialized, reusing instance');
      app = apps[0];
    } else {
      // Format the private key
      const formattedKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY || '');
      
      // Create a simplified service account config
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formattedKey
      };
      
      if (DEBUG) logger.debug('🔑 Creating new Firebase Admin app instance...');
      
      try {
        app = initializeApp({
          credential: cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
        if (DEBUG) logger.debug('✅ Firebase Admin app initialized successfully');
      } catch (certError) {
        logger.error('❌ Error creating certificate:', certError);
        
        // Last resort - try a different format if the first attempt failed
        logger.debug('⚠️ Attempting alternate private key format...');
        const alternateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        
        const alternateServiceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: alternateKey
        };
        
        app = initializeApp({
          credential: cert(alternateServiceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
        if (DEBUG) logger.debug('✅ Firebase Admin app initialized successfully with alternate format');
      }
    }
    
    auth = getAuth(app);
    db = getFirestore(app);
    
    if (DEBUG) logger.debug('✅ Firebase Admin Auth and Firestore initialized successfully');
    return { app, auth, db };
  } catch (error) {
    logger.error('❌ Error initializing Firebase Admin SDK:', error);
    initError = error as Error;
    throw error;
  }
}

// Initialize on module load
try {
  if (typeof window === 'undefined') {
    const { app: initializedApp, auth: initializedAuth, db: initializedDb } = createFirebaseAdminApp();
    app = initializedApp;
    auth = initializedAuth;
    db = initializedDb;
    
    if (DEBUG) logger.debug('✅ Firebase Admin initialization completed successfully on module load');
  }
} catch (error) {
  logger.error('❌ Error during Firebase Admin initialization on module load:', error);
  initError = error as Error;
}

// Safe getter functions that handle errors
export function getAdminAuth(): Auth {
  if (auth) return auth;
  
  // If not yet initialized or failed, try again
  if (!app || initError) {
    try {
      const { auth: newAuth } = createFirebaseAdminApp();
      auth = newAuth;
      initError = null; // Reset error if successful
      return auth;
    } catch (error) {
      logger.error('❌ Failed to get Admin Auth:', error);
      throw error;
    }
  }

  // This should never happen if initialization went well
  if (!auth) {
    throw new Error('Firebase Admin Auth was not initialized properly');
  }
  
  return auth;
}

export function getAdminDb(): Firestore {
  if (db) return db;
  
  // If not yet initialized or failed, try again
  if (!app || initError) {
    try {
      const { db: newDb } = createFirebaseAdminApp();
      db = newDb;
      initError = null; // Reset error if successful
      return db;
    } catch (error) {
      logger.error('❌ Failed to get Admin Firestore:', error);
      throw error;
    }
  }

  // This should never happen if initialization went well
  if (!db) {
    throw new Error('Firebase Admin Firestore was not initialized properly');
  }
  
  return db;
}

// Safe getters that don't throw but return undefined
export function safeGetAdminAuth(): Auth | undefined {
  try {
    return getAdminAuth();
  } catch (error) {
    logger.error('❌ Safe get Admin Auth failed:', error);
    return undefined;
  }
}

export function safeGetAdminDb(): Firestore | undefined {
  try {
    return getAdminDb();
  } catch (error) {
    logger.error('❌ Safe get Admin Firestore failed:', error);
    return undefined;
  }
}

// For backward compatibility, direct exports
export const adminAuth = auth;
export const adminDb = db;

// Export initialization status function
export function getFirebaseAdminInitStatus() {
  return {
    isInitialized: Boolean(app && auth && db),
    hasError: Boolean(initError),
    errorMessage: initError?.message || null,
    appInitialized: Boolean(app),
    authInitialized: Boolean(auth),
    dbInitialized: Boolean(db),
    envStatus: {
      projectId: Boolean(process.env.FIREBASE_PROJECT_ID),
      clientEmail: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
      privateKey: Boolean(process.env.FIREBASE_PRIVATE_KEY),
      privateKeyFormat: process.env.FIREBASE_PRIVATE_KEY 
        ? {
            hasBeginMarker: process.env.FIREBASE_PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----'),
            hasEndMarker: process.env.FIREBASE_PRIVATE_KEY.includes('-----END PRIVATE KEY-----'),
            length: process.env.FIREBASE_PRIVATE_KEY.length
          }
        : null
    }
  };
} 