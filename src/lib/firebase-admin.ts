import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Firebase Admin SDK configuration
let adminApp: any = null;
let adminDb: any = null;

function getFirebaseAdmin() {
  if (!adminApp) {
    // Initialize Firebase Admin SDK
    if (getApps().length === 0) {
      // For development, you can use the Firebase CLI to generate service account
      // For production, use environment variables
      
      const serviceAccount: ServiceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
      };

      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      adminApp = getApps()[0];
    }
  }

  return adminApp;
}

export function getAdminFirestore() {
  if (!adminDb) {
    adminDb = getFirestore(getFirebaseAdmin());
  }
  return adminDb;
}

// Generate UHID for testing
export function generateUHID(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `VET-${timestamp}-${random}`;
}

// Export the getFirebaseAdmin function
export { getFirebaseAdmin };

// Server-side claim operations that bypass security rules
export const createClaimAdmin = async (veteranId: string, claimData: any) => {
  const db = getAdminFirestore();
  const docRef = await db.collection('claims').add({
    ...claimData,
    veteranId,
    createdAt: new Date(),
    lastModified: new Date()
  });
  
  return docRef.id;
};

export const updateVeteranProfileAdmin = async (userId: string, data: any) => {
  const db = getAdminFirestore();
  await db.collection('veterans').doc(userId).set(data, { merge: true });
};