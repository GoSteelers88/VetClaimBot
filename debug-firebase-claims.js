// Debug script to check Firebase claims structure
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, limit } from 'firebase/firestore';

// Firebase configuration - you'll need to update this
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugClaims() {
  try {
    console.log('🔍 Checking Firebase claims collection...');
    
    // Get all claims (limited to 5 for debugging)
    const claimsQuery = query(collection(db, 'claims'), limit(5));
    const querySnapshot = await getDocs(claimsQuery);
    
    console.log(`📊 Found ${querySnapshot.docs.length} claims in database`);
    
    querySnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n📄 Claim ${index + 1}:`);
      console.log(`  Document ID: ${doc.id}`);
      console.log(`  veteranId: ${data.veteranId || 'MISSING!'}`);
      console.log(`  claimType: ${data.claimType || 'MISSING!'}`);
      console.log(`  status: ${data.status || 'MISSING!'}`);
      console.log(`  uhid: ${data.uhid || 'MISSING!'}`);
      console.log(`  createdAt: ${data.createdAt?.toDate?.() || data.createdAt || 'MISSING!'}`);
      console.log(`  All fields:`, Object.keys(data));
    });
    
    if (querySnapshot.docs.length === 0) {
      console.log('❌ No claims found in database!');
      console.log('📝 This suggests claims are being created in a different collection or not being created at all');
    }
    
  } catch (error) {
    console.error('💥 Error checking claims:', error);
    console.log('🔐 This might be a permissions error - check Firestore rules');
  }
}

debugClaims();