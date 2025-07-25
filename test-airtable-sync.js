const testData = {
  userId: "test-user-456",
  personalInfo: {
    firstName: "Jane",
    lastName: "Smith", 
    email: "jane.smith@email.com",
    phoneNumber: "555-5678",
    ssn: "TEST-987654321",
    dateOfBirth: "1985-05-15",
    address: {
      street: "456 Oak St",
      city: "Somewhere",
      state: "TX",
      zipCode: "54321",
      country: "USA"
    }
  },
  serviceHistory: {
    branches: ["Navy"],
    entryDate: "2005-01-01",
    dischargeDate: "2010-01-01", 
    dischargeType: "honorable",
    serviceConnectedDisability: true,
    currentDisabilityRating: 30,
    reserveNationalGuard: false,
    militaryOccupationCodes: []
  },
  deployments: [],
  conditions: [
    {
      id: "condition_1",
      name: "Tinnitus",
      bodySystem: "Ears",
      dateFirstNoticed: "2010-06-01",
      currentSeverity: "mild",
      serviceConnection: true
    }
  ],
  providers: [],
  documents: [],
  skipConditions: false
};

async function testAirtableSync() {
  try {
    console.log('🧪 Testing Airtable sync with new claim...');
    
    const response = await fetch('http://localhost:3005/api/intake/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📡 Response status:', response.status);
    
    const responseData = await response.json();
    console.log('📄 Response data:', JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('✅ Test submission successful!');
      console.log('🔍 Check Airtable for new records with UHID:', responseData.data.uhid);
    } else {
      console.log('❌ Test submission failed!');
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

testAirtableSync();