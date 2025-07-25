// Test Firebase claim creation and retrieval
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Firebase configuration
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

async function testFirebaseOperations() {
  try {
    console.log('🔍 Testing Firebase operations...');
    
    // Test user ID
    const testUserId = 'test-user-' + Date.now();
    console.log('🆔 Using test user ID:', testUserId);
    
    // Create a test claim
    console.log('📝 Creating test claim...');
    const testClaim = {
      veteranId: testUserId,
      claimType: 'disability',
      status: 'draft',
      createdAt: new Date(),
      lastModified: new Date(),
      uhid: 'VET-TEST-' + Date.now()
    };
    
    const docRef = await addDoc(collection(db, 'claims'), testClaim);
    console.log('✅ Test claim created with ID:', docRef.id);
    
    // Try to retrieve claims for this user
    console.log('🔍 Querying claims for user:', testUserId);
    const q = query(
      collection(db, 'claims'),
      where('veteranId', '==', testUserId)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('📊 Found', querySnapshot.docs.length, 'claims for user');
    
    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log('📄 Claim:', {
        id: doc.id,
        veteranId: data.veteranId,
        claimType: data.claimType,
        status: data.status
      });
    });
    
    if (querySnapshot.docs.length === 0) {
      console.log('❌ No claims found - there might be a permissions issue');
    }
    
  } catch (error) {
    console.error('💥 Firebase operation failed:', error);
    if (error.code === 'permission-denied') {
      console.log('🔐 This is a permissions error - check Firestore rules');
    }
  }
}

testFirebaseOperations();