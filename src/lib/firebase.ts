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

// Lazy initialization variables
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let functionsInstance: Functions | null = null;

// Initialize Firebase app
function initializeFirebaseApp(): FirebaseApp {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be initialized in the browser');
  }

  if (!app) {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error('Firebase config:', firebaseConfig);
      throw new Error('Firebase configuration is incomplete - missing API key or project ID');
    }

    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }

  return app;
}

// Lazy getters
export function getFirebaseApp(): FirebaseApp {
  return initializeFirebaseApp();
}

export function getAuthInstance(): Auth {
  if (!authInstance) {
    authInstance = getAuth(initializeFirebaseApp());
  }
  return authInstance;
}

export function getFirestoreInstance(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(initializeFirebaseApp());
  }
  return firestoreInstance;
}

export function getStorageInstance(): FirebaseStorage {
  if (!storageInstance) {
    storageInstance = getStorage(initializeFirebaseApp());
  }
  return storageInstance;
}

export function getFunctionsInstance(): Functions {
  if (!functionsInstance) {
    functionsInstance = getFunctions(initializeFirebaseApp());
  }
  return functionsInstance;
}

// Export getters as the main exports
export const auth = getAuthInstance;
export const firestore = getFirestoreInstance;
export const storage = getStorageInstance;
export const functions = getFunctionsInstance;

// Legacy compatibility exports
export const getAuth = getAuthInstance;
export const getDb = getFirestoreInstance;
export const getStorage = getStorageInstance;
export const getFunctions = getFunctionsInstance;

export default getFirebaseApp;