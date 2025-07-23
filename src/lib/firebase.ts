import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';
import type { Functions } from 'firebase/functions';

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;
let firebaseFunctions: Functions | null = null;

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    const { initializeApp, getApps } = require('firebase/app');
    const config = getFirebaseConfig();
    
    if (!config.apiKey || !config.projectId) {
      throw new Error('Firebase configuration is incomplete');
    }
    
    firebaseApp = getApps().length === 0 ? initializeApp(config) : getApps()[0];
  }
  return firebaseApp;
}

export function getAuth(): Auth {
  if (!firebaseAuth) {
    const { getAuth } = require('firebase/auth');
    firebaseAuth = getAuth(getFirebaseApp());
  }
  return firebaseAuth;
}

export function getDb(): Firestore {
  if (!firebaseDb) {
    const { getFirestore } = require('firebase/firestore');
    firebaseDb = getFirestore(getFirebaseApp());
  }
  return firebaseDb;
}

export function getStorage(): FirebaseStorage {
  if (!firebaseStorage) {
    const { getStorage } = require('firebase/storage');
    firebaseStorage = getStorage(getFirebaseApp());
  }
  return firebaseStorage;
}

export function getFunctions(): Functions {
  if (!firebaseFunctions) {
    const { getFunctions } = require('firebase/functions');
    firebaseFunctions = getFunctions(getFirebaseApp());
  }
  return firebaseFunctions;
}

// Legacy exports - these are now functions to ensure lazy loading
export const auth = getAuth;
export const storage = getStorage;
export const functions = getFunctions;

export default getFirebaseApp;