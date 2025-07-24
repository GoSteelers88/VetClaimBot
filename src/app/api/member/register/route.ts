import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin, getAdminFirestore, generateUHID } from '@/lib/firebase-admin';
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
    const db = getAdminFirestore();

    // Generate UHID for the member
    const uhid = generateUHID();
    console.log('Generated UHID:', uhid);

    // Process SSN for testing - allow test SSNs
    const processedSSN = personalInfo.ssn.startsWith('TEST-') ? 
      personalInfo.ssn : 
      personalInfo.ssn; // In production, this would be encrypted

    // Prepare veteran profile data for Firebase (ONLY what we collect in member registration)
    const veteranProfileData = {
      uid: userId,
      uhid,
      personalInfo: {
        firstName: personalInfo.firstName,
        middleName: personalInfo.middleName || '',
        lastName: personalInfo.lastName,
        suffix: personalInfo.suffix || '',
        email: personalInfo.email,
        ssn: processedSSN,
        dateOfBirth: new Date(personalInfo.dateOfBirth),
        phoneNumber: personalInfo.phoneNumber,
        address: {
          street: personalInfo.address.street,
          city: personalInfo.address.city,
          state: personalInfo.address.state,
          zipCode: personalInfo.address.zipCode,
          country: personalInfo.address.country || 'USA'
        },
        healthcare: personalInfo.healthcare ? {
          hasPrivateInsurance: Boolean(personalInfo.healthcare.hasPrivateInsurance),
          insuranceProvider: personalInfo.healthcare.insuranceProvider || '',
          preferredVAFacility: personalInfo.healthcare.preferredVAFacility || '',
          priorityGroup: personalInfo.healthcare.priorityGroup || 'Unknown'
        } : {
          hasPrivateInsurance: false,
          priorityGroup: 'Unknown'
        }
      },
      profileComplete: profileComplete || true,
      registrationSource: registrationSource || 'member_registration',
      status: 'active',
      createdAt: new Date(),
      lastModified: new Date()
    };

    // Step 1: Save to Firebase veterans collection ONLY
    console.log('💾 Saving to Firebase veterans collection...');
    const veteranRef = await db.collection('veterans').add(veteranProfileData);
    console.log('✅ Veteran profile created with ID:', veteranRef.id);

    // Step 2: Sync to Airtable Veterans table
    console.log('📊 Syncing to Airtable Veterans table...');
    try {
      const airtableRecordId = await AirtableService.syncMemberToAirtable(veteranProfileData);
      console.log('✅ Member synced to Airtable with ID:', airtableRecordId);
    } catch (airtableError) {
      console.error('⚠️ Airtable sync failed (non-critical):', airtableError);
      // Don't fail the entire registration if Airtable sync fails
    }

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