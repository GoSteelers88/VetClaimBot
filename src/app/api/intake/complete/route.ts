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
  console.log('🚀 Starting intake completion process...');
  
  try {
    const formData = await request.json();
    console.log('📝 Received form data:', {
      hasUserId: !!formData.userId,
      hasPersonalInfo: !!formData.personalInfo,
      hasMilitaryService: !!formData.militaryService,
      hasDeployments: Array.isArray(formData.deployments) ? formData.deployments.length : 0,
      hasConditions: Array.isArray(formData.conditions) ? formData.conditions.length : 0,
      skipConditions: formData.skipConditions
    });
    
    // Note: In a real app, you'd get the user ID from the authenticated session
    // For now, we'll expect it in the request body
    const { userId, ...profileData } = formData;
    
    if (!userId) {
      console.error('❌ Missing userId in request');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    console.log('✅ User ID found:', userId);

    // Update the veteran profile in Firestore
    const updatedProfile = {
      ...profileData,
      profileComplete: true,
      completedAt: new Date(),
      updatedAt: new Date()
    };

    console.log('💾 Updating Firestore profile for user:', userId);
    const { updateUserProfile } = await getFirestoreHelpers();
    await updateUserProfile(userId, updatedProfile);
    console.log('✅ Firestore profile updated successfully');

    // Sync to Airtable if configured
    console.log('🔄 Checking Airtable configuration...');
    const AirtableService = await getAirtableService();
    
    if (!AirtableService) {
      console.log('⚠️ Airtable not configured - skipping sync');
    } else {
      console.log('✅ Airtable service available, starting sync...');
      
      try {
        // Create a veteran profile object
        const veteranProfile = {
          uid: userId,
          uhid: profileData.uhid || `VET-${Date.now()}`,
          personalInfo: profileData.personalInfo || {},
          militaryService: profileData.militaryService || {},
          deployments: profileData.deployments || [],
          ...profileData
        };
        
        console.log('👤 Veteran profile created:', {
          uhid: veteranProfile.uhid,
          hasPersonalInfo: !!veteranProfile.personalInfo,
          hasMilitaryService: !!veteranProfile.militaryService,
          deploymentCount: veteranProfile.deployments.length
        });

        // Determine claim type based on intake data
        let claimType = 'disability'; // Default claim type
        if (profileData.conditions && profileData.conditions.length > 0) {
          claimType = 'disability';
        } else if (profileData.skipConditions) {
          claimType = 'profile'; // Profile-only completion
        }
        
        console.log('📋 Determined claim type:', claimType);
        
        // Create a claim object
        const claimData = {
          id: `intake-${userId}-${Date.now()}`,
          veteranId: userId,
          uhid: veteranProfile.uhid,
          claimType,
          status: profileData.skipConditions ? 'completed' : 'draft',
          completionPercentage: profileData.skipConditions ? 100 : 75,
          riskScore: 0,
          riskCategory: 'low' as const,
          conditionsClaimed: profileData.conditions || [],
          supportingDocuments: profileData.documents || [],
          treatmentHistory: profileData.providers || [],
          aiSuggestions: [],
          qualityChecks: {
            missingDocuments: [],
            weakConnections: [],
            strengthScore: 100,
            completeness: profileData.skipConditions ? 100 : 75,
            lastChecked: new Date()
          },
          createdAt: new Date(),
          lastModified: new Date(),
          vaSubmitted: false,
          priority: 'standard' as const
        };
        
        console.log('🔄 Syncing to Airtable with claim:', {
          id: claimData.id,
          claimType: claimData.claimType,
          status: claimData.status,
          conditionCount: claimData.conditionsClaimed.length
        });
        
        const airtableRecordId = await AirtableService.syncClaimToAirtable(claimData, veteranProfile);
        
        console.log('✅ Airtable sync successful, record ID:', airtableRecordId);
        
      } catch (airtableError) {
        console.error('❌ Airtable sync failed:', {
          error: airtableError instanceof Error ? airtableError.message : 'Unknown error',
          stack: airtableError instanceof Error ? airtableError.stack : undefined,
          name: airtableError instanceof Error ? airtableError.name : undefined
        });
        
        // Still return success but log the Airtable error
        console.log('⚠️ Continuing despite Airtable sync failure');
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Profile completed successfully'
    });

  } catch (error) {
    console.error('❌ Profile completion error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to complete profile',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}