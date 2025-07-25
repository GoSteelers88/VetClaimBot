const testData = {
  userId: "debug-user-123",
  personalInfo: {
    firstName: "Debug",
    lastName: "Test", 
    email: "debug@test.com",
    phoneNumber: "555-1234",
    ssn: "TEST-123456789",
    dateOfBirth: "1990-01-01",
    address: {
      street: "123 Debug St",
      city: "TestCity",
      state: "CA", 
      zipCode: "12345",
      country: "USA"
    }
  },
  serviceHistory: {
    branches: ["Army"],
    entryDate: "2010-01-01",
    dischargeDate: "2015-01-01", 
    dischargeType: "honorable",
    serviceConnectedDisability: false,
    currentDisabilityRating: 0,
    reserveNationalGuard: false,
    militaryOccupationCodes: []
  },
  deployments: [
    {
      id: "deploy_1",
      location: "Iraq",
      country: "Iraq",
      startDate: "2011-01-01",
      endDate: "2012-01-01",
      unit: "1st Infantry",
      missionType: "Combat Operations",
      hazardousExposure: true,
      combatZone: true,
      exposureTypes: ["burn_pits"]
    }
  ],
  conditions: [
    {
      id: "condition_1",
      name: "PTSD",
      bodySystem: "Mental Health",
      dateFirstNoticed: "2015-06-01",
      currentSeverity: "moderate",
      serviceConnection: "Related to combat deployment in Iraq"
    },
    {
      id: "condition_2", 
      name: "Chronic Pain",
      bodySystem: "Musculoskeletal",
      dateFirstNoticed: "2013-01-01",
      currentSeverity: "severe",
      serviceConnection: "Back injury from carrying heavy equipment"
    }
  ],
  providers: [
    {
      id: "provider_1",
      name: "VA Medical Center",
      specialty: "Mental Health",
      isVA: true,
      relevantConditions: ["condition_1"]
    }
  ],
  documents: [],
  skipConditions: false
};

async function debugAirtableSync() {
  try {
    console.log('🐛 Debug: Testing Airtable sync with disability claim...');
    console.log('📊 Conditions count:', testData.conditions.length);
    console.log('🏥 Expected claim type: disability');
    console.log('📋 Expected table: Disability_Claims_2025');
    
    const response = await fetch('http://localhost:3005/api/intake/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Raw response:', responseText);
    
    try {
      const responseData = JSON.parse(responseText);
      console.log('📄 Parsed response data:', JSON.stringify(responseData, null, 2));
      
      if (response.ok) {
        console.log('✅ Debug test submission successful!');
        console.log('🔍 Check server logs for Airtable sync details');
        console.log('🔍 Check Airtable for new records with UHID:', responseData.data?.uhid);
      } else {
        console.log('❌ Debug test submission failed!');
      }
    } catch (parseError) {
      console.log('❌ Failed to parse response as JSON:', parseError.message);
    }
    
  } catch (error) {
    console.error('💥 Debug test error:', error);
  }
}

debugAirtableSync();