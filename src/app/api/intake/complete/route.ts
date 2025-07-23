import { NextRequest, NextResponse } from 'next/server';

// Dynamic imports to avoid build-time issues
async function getFirestoreHelpers() {
  const { updateUserProfile } = await import('@/lib/firestore');
  return { updateUserProfile };
}

async function getAirtableService() {
  if (!process.env.AIRTABLE_API_KEY) {
    return null;
  }
  const { AirtableService } = await import('@/lib/airtable');
  return AirtableService;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // Note: In a real app, you'd get the user ID from the authenticated session
    // For now, we'll expect it in the request body
    const { userId, ...profileData } = formData;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update the veteran profile in Firestore
    const updatedProfile = {
      ...profileData,
      profileComplete: true,
      completedAt: new Date(),
      updatedAt: new Date()
    };

    const { updateUserProfile } = await getFirestoreHelpers();
    await updateUserProfile(userId, updatedProfile);

    // Sync to Airtable if configured
    const AirtableService = await getAirtableService();
    if (AirtableService) {
      try {
        // Create a basic claim record in Airtable
        const veteranProfile = {
          uid: userId,
          uhid: profileData.uhid || `VET-${Date.now()}`,
          personalInfo: profileData.personalInfo || {},
          militaryService: profileData.militaryService || {},
          deployments: profileData.deployments || [],
          ...profileData
        };

        // Create a default "profile" claim type
        await AirtableService.syncClaimToAirtable({
          id: `profile-${userId}`,
          veteranId: userId,
          claimType: 'profile',
          status: 'completed',
          completionPercentage: 100,
          riskScore: 0,
          createdAt: new Date(),
          lastModified: new Date(),
          conditionsClaimed: [],
          supportingDocuments: [],
          treatmentHistory: [],
          aiSuggestions: [],
          qualityChecks: { missingDocuments: [], weakConnections: [], strengthScore: 100, completeness: 100 },
          vaSubmitted: false
        } as any, veteranProfile as any);
      } catch (airtableError) {
        console.error('Airtable sync failed:', airtableError);
        // Don't fail the whole request if Airtable sync fails
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Profile completed successfully'
    });

  } catch (error) {
    console.error('Profile completion error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to complete profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}