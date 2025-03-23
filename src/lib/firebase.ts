'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Only initialize in the browser
if (typeof window !== 'undefined') {
  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
  
  // Analytics - Only initialize in the browser after window is fully loaded
  if (process.env.NODE_ENV !== 'development') {
    // In production, initialize analytics immediately
    try {
      const { getAnalytics } = require('firebase/analytics');
      // Use dynamic import for analytics to ensure it's only loaded in browser
      import('firebase/analytics').then((analytics) => {
        analytics.getAnalytics(firebaseApp);
      }).catch(error => {
        console.error('Analytics dynamic import error:', error);
      });
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  } else {
    // In development, add a listener to initialize analytics after window loads
    window.addEventListener('load', () => {
      try {
        import('firebase/analytics').then((analytics) => {
          analytics.getAnalytics(firebaseApp);
        }).catch(error => {
          console.error('Analytics dynamic import error in dev mode:', error);
        });
      } catch (error) {
        console.error('Analytics initialization error in dev mode:', error);
      }
    });
  }
}

export { firebaseApp, auth, db, storage }; 