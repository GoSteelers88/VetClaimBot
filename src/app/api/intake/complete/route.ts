import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase/firestore';

// Dynamic imports to avoid build-time issues
async function getFirestoreHelpers() {
  const { updateUserProfile, createClaim, generateUHID } = await import('@/lib/firestore');
  return { updateUserProfile, createClaim, generateUHID };
}

async function getFirebaseTransforms() {
  const { 
    transformIntakeDataForFirebase,
    createVeteranProfileForFirebase,
    createClaimForFirebase
  } = await import('@/lib/firebase-transforms');
  return { transformIntakeDataForFirebase, createVeteranProfileForFirebase, createClaimForFirebase };
}

async function getAirtableService() {
  if (!process.env.AIRTABLE_API_KEY) {
    return null;
  }
  const { AirtableService } = await import('@/lib/airtable');
  return AirtableService;
}

// Convert Date objects to Firestore Timestamps for safe storage
function convertDatesToTimestamps(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (obj instanceof Date) {
    return Timestamp.fromDate(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertDatesToTimestamps);
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertDatesToTimestamps(value);
    }
    return converted;
  }
  
  return obj;
}

export async function POST(request: NextRequest) {
  console.log('🚀 Starting intake completion process...');
  
  try {
    const rawFormData = await request.json();
    console.log('📝 Received form data:', {
      hasUserId: !!rawFormData.userId,
      hasPersonalInfo: !!rawFormData.personalInfo,
      hasServiceHistory: !!rawFormData.serviceHistory,
      hasMilitaryService: !!rawFormData.militaryService,
      hasDeployments: Array.isArray(rawFormData.deployments) ? rawFormData.deployments.length : 0,
      hasConditions: Array.isArray(rawFormData.conditions) ? rawFormData.conditions.length : 0,
      hasProviders: Array.isArray(rawFormData.providers) ? rawFormData.providers.length : 0,
      hasDocuments: Array.isArray(rawFormData.documents) ? rawFormData.documents.length : 0,
      skipConditions: rawFormData.skipConditions
    });
    
    // Extract userId and prepare form data for transformation
    const { userId, ...rawIntakeData } = rawFormData;
    
    if (!userId) {
      console.error('❌ Missing userId in request');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    console.log('✅ User ID found:', userId);

    // Normalize the form data structure to match expected Firebase transform inputs
    console.log('🔧 Normalizing form data structure...');
    const intakeFormData = {
      personalInfo: rawIntakeData.personalInfo || {},
      serviceHistory: rawIntakeData.serviceHistory || rawIntakeData.militaryService || {},
      deployments: rawIntakeData.deployments || [],
      conditions: rawIntakeData.conditions || [],
      providers: rawIntakeData.providers || [],
      documents: rawIntakeData.documents || [],
      incidents: rawIntakeData.incidents || [], // Add incidents field for TypeScript compliance
      skipConditions: Boolean(rawIntakeData.skipConditions)
    };

    // Transform the raw form data to Firebase-compatible format
    console.log('🔄 Transforming form data to Firebase format...');
    const { transformIntakeDataForFirebase, createVeteranProfileForFirebase, createClaimForFirebase } = await getFirebaseTransforms();
    
    const transformedData = transformIntakeDataForFirebase(intakeFormData);
    console.log('✅ Data transformation complete:', {
      hasPersonalInfo: !!transformedData.personalInfo,
      hasMilitaryService: !!transformedData.militaryService,
      deploymentCount: transformedData.deployments.length,
      conditionCount: transformedData.conditions.length,
      providerCount: transformedData.providers.length,
      documentCount: transformedData.documents.length,
      treatmentHistoryCount: transformedData.treatmentHistory.length
    });

    // Create the veteran profile for Firebase
    console.log('📋 Creating veteran profile for Firebase...');
    const { updateUserProfile, createClaim, generateUHID } = await getFirestoreHelpers();
    const uhid = generateUHID();
    
    const veteranProfileData = createVeteranProfileForFirebase(userId, transformedData);
    veteranProfileData.uhid = uhid;
    // Add completedAt as a separate property since it's not part of the base VeteranProfile type
    const updatedProfileData = {
      ...veteranProfileData,
      completedAt: Timestamp.now()
    };
    
    // Convert any Date objects to Timestamps to prevent Firestore errors
    const safeProfileData = convertDatesToTimestamps(updatedProfileData);
    
    console.log('💾 Updating Firestore profile for user:', userId);
    await updateUserProfile(userId, safeProfileData);
    console.log('✅ Firestore profile updated successfully');

    // Create a claim record if conditions were provided or not skipped
    let claimId = null;
    if (!transformedData.skipConditions || transformedData.conditions.length > 0) {
      console.log('📝 Creating claim record...');
      
      // We need to construct a veteran profile object for the claim creation
      const veteranProfile = {
        uid: userId,
        uhid: uhid,
        ...safeProfileData
      };
      
      const claimData = createClaimForFirebase(userId, veteranProfile as any, transformedData);
      const safeClaimData = convertDatesToTimestamps(claimData);
      
      claimId = await createClaim(userId, safeClaimData as any);
      console.log('✅ Claim record created with ID:', claimId);
    } else {
      console.log('ℹ️ Skipping claim creation - conditions were skipped');
    }

    // Sync to Airtable if configured
    console.log('🔄 Checking Airtable configuration...');
    const AirtableService = await getAirtableService();
    
    if (!AirtableService) {
      console.log('⚠️ Airtable not configured - skipping sync');
    } else if (claimId) {
      console.log('✅ Airtable service available, starting sync...');
      
      try {
        // Create a veteran profile object using the transformed data
        const veteranProfile = {
          uid: userId,
          uhid: uhid,
          personalInfo: transformedData.personalInfo,
          militaryService: transformedData.militaryService,
          deployments: transformedData.deployments,
          medicalHistory: {
            currentConditions: transformedData.conditions.map(c => c.conditionName || c.name || '').filter(Boolean),
            medications: [],
            vaHealthcare: transformedData.militaryService.serviceConnectedDisability,
            vaFacility: transformedData.providers.find(p => p.isVA)?.name
          },
          ...safeProfileData
        };
        
        console.log('👤 Veteran profile created for Airtable:', {
          uhid: veteranProfile.uhid,
          hasPersonalInfo: !!veteranProfile.personalInfo,
          hasMilitaryService: !!veteranProfile.militaryService,
          deploymentCount: veteranProfile.deployments.length,
          conditionCount: transformedData.conditions.length
        });

        // Create a claim object using the transformed data
        const claimData = {
          id: claimId,
          veteranId: userId,
          uhid: uhid,
          claimType: (transformedData.conditions.length > 0 ? 'disability' : 'healthcare') as 'disability' | 'healthcare',
          status: (transformedData.skipConditions ? 'pending' : 'draft') as 'draft' | 'pending',
          completionPercentage: transformedData.skipConditions ? 100 : 75,
          riskScore: 0,
          riskCategory: 'low' as const,
          conditionsClaimed: transformedData.conditions,
          supportingDocuments: transformedData.documents,
          treatmentHistory: transformedData.treatmentHistory,
          aiSuggestions: [],
          qualityChecks: {
            missingDocuments: [],
            weakConnections: [],
            strengthScore: 100,
            completeness: transformedData.skipConditions ? 100 : 75,
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
    } else if (!claimId) {
      console.log('ℹ️ Skipping Airtable sync - no claim created');
    }

    return NextResponse.json({ 
      success: true,
      message: 'Profile completed successfully',
      data: {
        profileComplete: true,
        uhid: uhid,
        claimId: claimId,
        transformedDataSummary: {
          conditionCount: transformedData.conditions.length,
          providerCount: transformedData.providers.length,
          documentCount: transformedData.documents.length,
          treatmentHistoryCount: transformedData.treatmentHistory.length,
          skipConditions: transformedData.skipConditions
        }
      }
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