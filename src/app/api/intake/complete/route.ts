import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase/auth';
import { updateUserProfile } from '@/lib/firestore';
import { AirtableService } from '@/lib/airtable';

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

    await updateUserProfile(userId, updatedProfile);

    // Sync to Airtable if configured
    if (process.env.AIRTABLE_API_KEY) {
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