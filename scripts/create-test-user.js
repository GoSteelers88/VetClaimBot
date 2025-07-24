// Test user creation script
// Run with: node scripts/create-test-user.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to add your service account key)
// For now, this is just a template
const serviceAccount = {
  // Add your Firebase service account key here
  // Download from Firebase Console > Project Settings > Service Accounts
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function createTestUser() {
  try {
    const userRecord = await admin.auth().createUser({
      email: 'test@veteran.com',
      password: 'TestPassword123!',
      displayName: 'Test Veteran',
      emailVerified: true,
    });

    console.log('Successfully created test user:', userRecord.uid);
    console.log('Email: test@veteran.com');
    console.log('Password: TestPassword123!');
    
    // Also create the user document in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: 'test@veteran.com',
      displayName: 'Test Veteran',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      profileComplete: false
    });

    console.log('User document created in Firestore');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();