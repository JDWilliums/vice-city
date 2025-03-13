// This file should only be imported by server components or API routes
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Check if we're on the server side
const isServer = typeof window === 'undefined';

// Only initialize on server side
if (!isServer) {
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
const app = apps.length === 0 
  ? initializeApp({
      credential: cert(serviceAccount as any),
      projectId: process.env.FIREBASE_PROJECT_ID,
    })
  : apps[0];

// Export the admin auth and firestore for server-side operations
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app); 