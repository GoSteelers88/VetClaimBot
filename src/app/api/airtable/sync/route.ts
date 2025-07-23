import { NextRequest, NextResponse } from 'next/server';

// Dynamic imports to avoid build-time issues
async function getAirtableService() {
  const { AirtableService } = await import('@/lib/airtable');
  return AirtableService;
}

async function getFirestoreHelpers() {
  const { getClaim, getUserProfile } = await import('@/lib/firestore');
  return { getClaim, getUserProfile };
}

export async function POST(request: NextRequest) {
  try {
    // Skip during build time
    if (!process.env.AIRTABLE_API_KEY) {
      return NextResponse.json(
        { error: 'Airtable not configured' },
        { status: 503 }
      );
    }
    const { claimId, veteranId } = await request.json();

    if (!claimId || !veteranId) {
      return NextResponse.json(
        { error: 'claimId and veteranId are required' },
        { status: 400 }
      );
    }

    // Get claim and veteran data from Firestore
    const { getClaim, getUserProfile } = await getFirestoreHelpers();
    const [claim, veteranProfile] = await Promise.all([
      getClaim(claimId),
      getUserProfile(veteranId)
    ]);

    if (!claim || !veteranProfile) {
      return NextResponse.json(
        { error: 'Claim or veteran profile not found' },
        { status: 404 }
      );
    }

    // Sync to Airtable
    const AirtableService = await getAirtableService();
    const airtableRecordId = await AirtableService.syncClaimToAirtable(claim, veteranProfile);

    return NextResponse.json({ 
      success: true, 
      airtableRecordId,
      message: 'Claim synced to Airtable successfully'
    });

  } catch (error) {
    console.error('Airtable sync error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to sync claim to Airtable',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Skip during build time
    if (!process.env.AIRTABLE_API_KEY) {
      return NextResponse.json(
        { error: 'Airtable not configured' },
        { status: 503 }
      );
    }
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');

    if (!tableName) {
      return NextResponse.json(
        { error: 'table parameter is required' },
        { status: 400 }
      );
    }

    const AirtableService = await getAirtableService();
    const stats = await AirtableService.getTableStats(tableName);
    
    return NextResponse.json({ 
      success: true, 
      stats,
      message: 'Table stats retrieved successfully'
    });

  } catch (error) {
    console.error('Airtable stats error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get table stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}