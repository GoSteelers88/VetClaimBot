import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate configuration (only in browser)
if (typeof window !== 'undefined' && (!firebaseConfig.apiKey || !firebaseConfig.projectId)) {
  console.error('Firebase config:', firebaseConfig);
  throw new Error('Firebase configuration is incomplete - missing API key or project ID');
}

// Initialize Firebase app (only in browser)
let app: FirebaseApp;
if (typeof window !== 'undefined') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} else {
  // Create a dummy app for SSR
  app = {} as FirebaseApp;
}

// Initialize services (only in browser)
export const auth: Auth = typeof window !== 'undefined' ? getAuth(app) : {} as Auth;
export const firestore: Firestore = typeof window !== 'undefined' ? getFirestore(app) : {} as Firestore;
export const storage: FirebaseStorage = typeof window !== 'undefined' ? getStorage(app) : {} as FirebaseStorage;
export const functions: Functions = typeof window !== 'undefined' ? getFunctions(app) : {} as Functions;

// Export the app for compatibility
export const firebaseApp = app;

// Helper functions for backward compatibility
export const getFirebaseApp = () => app;
export const getAuth = () => auth;
export const getDb = () => firestore;
export const getStorage = () => storage;
export const getFunctions = () => functions;

export default app;