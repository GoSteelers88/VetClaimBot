import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth as firebaseGetAuth, 
  Auth 
} from 'firebase/auth';
import { 
  getFirestore as firebaseGetFirestore, 
  Firestore 
} from 'firebase/firestore';
import { 
  getStorage as firebaseGetStorage, 
  FirebaseStorage 
} from 'firebase/storage';
import { 
  getFunctions as firebaseGetFunctions, 
  Functions 
} from 'firebase/functions';

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

// Service getters
export function auth(): Auth {
  if (!authInstance) {
    authInstance = firebaseGetAuth(initializeFirebaseApp());
  }
  return authInstance;
}

export function firestore(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = firebaseGetFirestore(initializeFirebaseApp());
  }
  return firestoreInstance;
}

export function storage(): FirebaseStorage {
  if (!storageInstance) {
    storageInstance = firebaseGetStorage(initializeFirebaseApp());
  }
  return storageInstance;
}

export function functions(): Functions {
  if (!functionsInstance) {
    functionsInstance = firebaseGetFunctions(initializeFirebaseApp());
  }
  return functionsInstance;
}

// Legacy compatibility exports
export const getFirebaseApp = initializeFirebaseApp;
export const getAuth = auth;
export const getDb = firestore;
export const getStorage = storage;
export const getFunctions = functions;

export default initializeFirebaseApp;