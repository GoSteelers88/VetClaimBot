import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { AirtableService } from '@/lib/airtable';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, personalInfo, profileComplete, registrationSource } = body;

    if (!userId || !personalInfo) {
      return NextResponse.json(
        { error: 'User ID and personal information are required' },
        { status: 400 }
      );
    }

    console.log('🔄 Starting member registration for user:', userId);

    // Get Firebase Admin SDK
    const { getAdminFirestore, generateUHID } = await getFirebaseAdmin();
    const db = getAdminFirestore();

    // Generate UHID for the member
    const uhid = generateUHID();
    console.log('Generated UHID:', uhid);

    // Prepare veteran profile data for Firebase
    const veteranProfileData = {
      uid: userId,
      uhid,
      personalInfo: {
        firstName: personalInfo.firstName,
        middleName: personalInfo.middleName || '',
        lastName: personalInfo.lastName,
        suffix: personalInfo.suffix || '',
        email: personalInfo.email,
        ssn: personalInfo.ssn,
        dateOfBirth: new Date(personalInfo.dateOfBirth),
        phoneNumber: personalInfo.phoneNumber,
        address: personalInfo.address
      },
      profileComplete: profileComplete || true,
      registrationSource: registrationSource || 'member_registration',
      createdAt: new Date(),
      lastModified: new Date()
    };

    // Step 1: Save to Firebase veterans collection
    console.log('💾 Saving to Firebase veterans collection...');
    const veteranRef = await db.collection('veterans').add(veteranProfileData);
    console.log('✅ Veteran profile created with ID:', veteranRef.id);

    // Step 2: Sync to Airtable Members table
    console.log('📊 Syncing to Airtable Members table...');
    try {
      const airtableRecordId = await AirtableService.syncMemberToAirtable(veteranProfileData);
      console.log('✅ Member synced to Airtable with ID:', airtableRecordId);
    } catch (airtableError) {
      console.error('⚠️ Airtable sync failed (non-critical):', airtableError);
      // Don't fail the entire registration if Airtable sync fails
    }

    // Step 3: Update the user's Firebase Auth profile if needed
    console.log('👤 Updating user profile in Firebase...');
    await db.collection('users').doc(userId).set({
      uhid,
      personalInfo: veteranProfileData.personalInfo,
      profileComplete: true,
      lastUpdated: new Date()
    }, { merge: true });

    console.log('🎉 Member registration completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Member registration completed successfully',
      data: {
        uhid,
        veteranId: veteranRef.id,
        profileComplete: true
      }
    });

  } catch (error) {
    console.error('❌ Member registration failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Registration failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}