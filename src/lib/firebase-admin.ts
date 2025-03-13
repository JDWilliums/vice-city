// This file should only be imported by server components or API routes
import { cert, getApps, initializeApp, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// We'll use these variables to cache the initialized instances
let app: App | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

// Lazy initialization function - will only run when called
function initializeAdminSDK() {
  // Check if app is already initialized
  if (!app) {
    // Only initialize on server side
    if (typeof window !== 'undefined') {
      console.error('Firebase Admin SDK should only be used on the server side.');
      throw new Error('Firebase Admin SDK cannot be used in client-side code.');
    }

    // Service account configuration
    const serviceAccount = {
      "type": "service_account",
      "project_id": process.env.FIREBASE_PROJECT_ID,
      "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
      "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      "client_email": process.env.FIREBASE_CLIENT_EMAIL,
      "client_id": process.env.FIREBASE_CLIENT_ID,
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": process.env.FIREBASE_CERT_URL
    };

    // Initialize Firebase Admin if it hasn't been initialized already
    const apps = getApps();
    app = apps.length === 0 
      ? initializeApp({
          credential: cert(serviceAccount as any),
          projectId: process.env.FIREBASE_PROJECT_ID,
        })
      : apps[0];
      
    // Initialize auth and firestore
    auth = getAuth(app);
    db = getFirestore(app);
  }
  
  return { app, auth, db };
}

// Export getter functions that ensure lazy initialization
export function getAdminApp() {
  const { app } = initializeAdminSDK();
  return app;
}

export function getAdminAuth() {
  const { auth } = initializeAdminSDK();
  return auth;
}

export function getAdminDb() {
  const { db } = initializeAdminSDK();
  return db;
}

// For backward compatibility - these will trigger initialization when imported
// but at least it will only happen at runtime instead of build time
export const adminAuth = auth as Auth;
export const adminDb = db as Firestore; 