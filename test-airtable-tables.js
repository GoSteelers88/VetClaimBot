// Test what tables exist and are accessible in Airtable
async function testAirtableTables() {
  try {
    console.log('🔍 Testing Airtable table access...');
    
    // Test API call to check what happens with different table names
    const tablesToTest = [
      'Members',
      'Disability_Claims', 
      'Healthcare_Claims',
      'Disability_Claims_2025',
      'Healthcare_Claims_2025'
    ];
    
    for (const tableName of tablesToTest) {
      console.log(`\n📋 Testing table: ${tableName}`);
      
      try {
        // Make a simple request to list records (limit to 1)
        const testData = {
          userId: "table-test-user",
          personalInfo: {
            firstName: "Table",
            lastName: "Test",
            email: "table@test.com",
            phoneNumber: "555-0000",
            ssn: "TEST-000000000",
            dateOfBirth: "1990-01-01",
            address: {
              street: "123 Test St",
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
          deployments: [],
          conditions: tableName.includes('Disability') ? [{
            id: "test_condition",
            name: "Test Condition",
            bodySystem: "Test",
            dateFirstNoticed: "2020-01-01",
            currentSeverity: "mild",
            serviceConnection: "Test connection"
          }] : [],
          providers: [],
          documents: [],
          skipConditions: !tableName.includes('Disability')
        };
        
        const response = await fetch('http://localhost:3005/api/intake/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData)
        });
        
        console.log(`  Status: ${response.status}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log(`  ✅ Success for table: ${tableName}`);
          console.log(`  UHID: ${result.data?.uhid}`);
        } else {
          const error = await response.text();
          console.log(`  ❌ Failed for table: ${tableName}`);
          console.log(`  Error: ${error.substring(0, 100)}...`);
        }
        
      } catch (error) {
        console.log(`  💥 Exception for table ${tableName}:`, error.message);
      }
      
      // Add delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('💥 Table test error:', error);
  }
}

testAirtableTables();