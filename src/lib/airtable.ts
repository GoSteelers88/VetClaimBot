import Airtable from 'airtable';
import { Claim, VeteranProfile } from '@/types';
import { needsCPExam, requiresCopay } from './firebase-transforms';

// Lazy initialization of Airtable
let airtableBase: any = null;

function getAirtableBase() {
  if (!airtableBase) {
    if (!process.env.AIRTABLE_API_KEY) {
      throw new Error('An API key is required to connect to Airtable');
    }
    if (!process.env.AIRTABLE_BASE_ID) {
      throw new Error('Airtable Base ID is required');
    }
    
    airtableBase = new Airtable({ 
      apiKey: process.env.AIRTABLE_API_KEY 
    }).base(process.env.AIRTABLE_BASE_ID);
  }
  return airtableBase;
}

// Dynamic table creation and management
export class AirtableService {
  
  static async createClaimTable(claimType: string, year: number = new Date().getFullYear()) {
    // Route to correct table based on claim type with year
    const baseTableName = claimType === 'disability' ? 'Disability_Claims' : 'Healthcare_Claims';
    const tableName = `${baseTableName}_${year}`;
    console.log(`🔍 Checking for table: ${tableName} (claim type: ${claimType})`);
    
    try {
      // Check if table already exists by trying to access it
      console.log(`📋 Attempting to access table: ${tableName}`);
      const records = await getAirtableBase()(tableName).select({ maxRecords: 1 }).firstPage();
      console.log(`✅ Table ${tableName} exists, found ${records.length} records`);
      return tableName; // Table exists
    } catch (error) {
      console.log(`❌ DETAILED Table ${tableName} not found:`, {
        message: error.message,
        statusCode: (error as any).statusCode,
        error: (error as any).error,
        type: (error as any).type,
        name: error.name,
        stack: error.stack
      });
      // Table doesn't exist, create it
      const fields = this.getTableFields(claimType);
      
      try {
        // Note: Airtable's REST API doesn't support table creation
        // This would need to be done via Airtable's Metadata API or manually
        console.log(`Table ${tableName} needs to be created with fields:`, fields);
        return tableName;
      } catch (createError) {
        console.error('Failed to create table:', createError);
        throw createError;
      }
    }
  }

  static getTableFields(claimType: string) {
    const baseFields = [
      { name: 'UHID', type: 'singleLineText' },
      { name: 'Veteran Name', type: 'singleLineText' },
      { name: 'Email', type: 'email' },
      { name: 'Phone', type: 'phoneNumber' },
      { name: 'Claim Status', type: 'singleSelect', options: {
        choices: [
          { name: 'Draft', color: 'grayBright2' },
          { name: 'In Review', color: 'blueBright2' },
          { name: 'Ready', color: 'purpleBright2' },
          { name: 'Submitted', color: 'tealBright2' },
          { name: 'Processing', color: 'yellowBright2' },
          { name: 'Approved', color: 'greenBright2' },
          { name: 'Denied', color: 'redBright2' }
        ]
      }},
      { name: 'Risk Score', type: 'number', options: { precision: 0 }},
      { name: 'Completion %', type: 'number', options: { precision: 0 }},
      { name: 'Created Date', type: 'dateTime' },
      { name: 'Last Modified', type: 'dateTime' },
      { name: 'Branch of Service', type: 'multipleSelects', options: {
        choices: [
          { name: 'Army', color: 'greenBright2' },
          { name: 'Navy', color: 'blueBright2' },
          { name: 'Air Force', color: 'cyanBright2' },
          { name: 'Marines', color: 'redBright2' },
          { name: 'Coast Guard', color: 'orangeBright2' },
          { name: 'Space Force', color: 'purpleBright2' }
        ]
      }},
      { name: 'Service Dates', type: 'singleLineText' },
      { name: 'Current Rating', type: 'number', options: { precision: 0 }},
      { name: 'Notes', type: 'multilineText' },
      { name: 'Claim ID', type: 'singleLineText' },
      { name: 'Claim Type', type: 'singleSelect', options: {
        choices: [
          { name: 'Disability', color: 'redBright2' },
          { name: 'Healthcare', color: 'blueBright2' },
          { name: 'Education', color: 'greenBright2' },
          { name: 'Home Loan', color: 'purpleBright2' },
          { name: 'Burial', color: 'grayBright2' },
          { name: 'Pension', color: 'yellowBright2' }
        ]
      }}
    ];

    // Add claim-type specific fields
    switch (claimType.toLowerCase()) {
      case 'disability':
        return [
          ...baseFields,
          { name: 'Conditions Claimed', type: 'multilineText' },
          { name: 'Service Connection', type: 'checkbox' },
          { name: 'C&P Exam Needed', type: 'checkbox' },
          { name: 'Medical Records', type: 'checkbox' },
          { name: 'Buddy Statements', type: 'checkbox' },
          { name: 'Exposure Type', type: 'multipleSelects', options: {
            choices: [
              { name: 'Agent Orange', color: 'orangeBright2' },
              { name: 'Burn Pits', color: 'redBright2' },
              { name: 'Radiation', color: 'yellowBright2' },
              { name: 'Asbestos', color: 'grayBright2' },
              { name: 'PFAS', color: 'greenBright2' },
              { name: 'Gulf War', color: 'blueBright2' }
            ]
          }}
        ];
      
      
      case 'healthcare':
        return [
          ...baseFields,
          { name: 'Priority Group', type: 'singleSelect', options: {
            choices: [
              { name: 'Group 1', color: 'redBright2' },
              { name: 'Group 2', color: 'orangeBright2' },
              { name: 'Group 3', color: 'yellowBright2' },
              { name: 'Group 4', color: 'greenBright2' },
              { name: 'Group 5', color: 'blueBright2' },
              { name: 'Group 6', color: 'purpleBright2' },
              { name: 'Group 7', color: 'grayBright2' },
              { name: 'Group 8', color: 'pinkBright2' }
            ]
          }},
          { name: 'Preferred Facility', type: 'singleLineText' },
          { name: 'Insurance', type: 'checkbox' },
          { name: 'Copay Required', type: 'checkbox' }
        ];
      
      default:
        return baseFields;
    }
  }

  static async createMembersTable() {
    const tableName = 'Veterans';
    
    try {
      // Check if table already exists by trying to access it
      const records = await getAirtableBase()(tableName).select({ maxRecords: 1 }).firstPage();
      return tableName; // Table exists
    } catch (error) {
      // Table doesn't exist, create it (or needs to be created manually)
      console.log(`Table ${tableName} needs to be created with fields:`, this.getVeteransTableFields());
      return tableName;
    }
  }

  static getVeteransTableFields() {
    return [
      { name: 'UHID', type: 'singleLineText' },
      { name: 'First Name', type: 'singleLineText' },
      { name: 'Middle Name', type: 'singleLineText' },
      { name: 'Last Name', type: 'singleLineText' },
      { name: 'Full Name', type: 'formula', options: { formula: "CONCATENATE({First Name}, IF({Middle Name}, CONCATENATE(' ', {Middle Name}), ''), ' ', {Last Name})" }},
      { name: 'Email', type: 'email' },
      { name: 'Phone', type: 'phoneNumber' },
      { name: 'Date of Birth', type: 'date' },
      { name: 'Age', type: 'formula', options: { formula: "DATETIME_DIFF(TODAY(), {Date of Birth}, 'years')" }},
      { name: 'Street Address', type: 'singleLineText' },
      { name: 'City', type: 'singleLineText' },
      { name: 'State', type: 'singleSelect', options: {
        choices: [
          { name: 'Alabama', color: 'grayBright2' }, { name: 'Alaska', color: 'grayBright2' },
          { name: 'Arizona', color: 'grayBright2' }, { name: 'Arkansas', color: 'grayBright2' },
          { name: 'California', color: 'grayBright2' }, { name: 'Colorado', color: 'grayBright2' },
          { name: 'Connecticut', color: 'grayBright2' }, { name: 'Delaware', color: 'grayBright2' },
          { name: 'Florida', color: 'grayBright2' }, { name: 'Georgia', color: 'grayBright2' },
          { name: 'Hawaii', color: 'grayBright2' }, { name: 'Idaho', color: 'grayBright2' },
          { name: 'Illinois', color: 'grayBright2' }, { name: 'Indiana', color: 'grayBright2' },
          { name: 'Iowa', color: 'grayBright2' }, { name: 'Kansas', color: 'grayBright2' },
          { name: 'Kentucky', color: 'grayBright2' }, { name: 'Louisiana', color: 'grayBright2' },
          { name: 'Maine', color: 'grayBright2' }, { name: 'Maryland', color: 'grayBright2' },
          { name: 'Massachusetts', color: 'grayBright2' }, { name: 'Michigan', color: 'grayBright2' },
          { name: 'Minnesota', color: 'grayBright2' }, { name: 'Mississippi', color: 'grayBright2' },
          { name: 'Missouri', color: 'grayBright2' }, { name: 'Montana', color: 'grayBright2' },
          { name: 'Nebraska', color: 'grayBright2' }, { name: 'Nevada', color: 'grayBright2' },
          { name: 'New Hampshire', color: 'grayBright2' }, { name: 'New Jersey', color: 'grayBright2' },
          { name: 'New Mexico', color: 'grayBright2' }, { name: 'New York', color: 'grayBright2' },
          { name: 'North Carolina', color: 'grayBright2' }, { name: 'North Dakota', color: 'grayBright2' },
          { name: 'Ohio', color: 'grayBright2' }, { name: 'Oklahoma', color: 'grayBright2' },
          { name: 'Oregon', color: 'grayBright2' }, { name: 'Pennsylvania', color: 'grayBright2' },
          { name: 'Rhode Island', color: 'grayBright2' }, { name: 'South Carolina', color: 'grayBright2' },
          { name: 'South Dakota', color: 'grayBright2' }, { name: 'Tennessee', color: 'grayBright2' },
          { name: 'Texas', color: 'grayBright2' }, { name: 'Utah', color: 'grayBright2' },
          { name: 'Vermont', color: 'grayBright2' }, { name: 'Virginia', color: 'grayBright2' },
          { name: 'Washington', color: 'grayBright2' }, { name: 'West Virginia', color: 'grayBright2' },
          { name: 'Wisconsin', color: 'grayBright2' }, { name: 'Wyoming', color: 'grayBright2' }
        ]
      }},
      { name: 'ZIP Code', type: 'singleLineText' },
      { name: 'Full Address', type: 'formula', options: { formula: "CONCATENATE({Street Address}, ', ', {City}, ', ', {State}, ' ', {ZIP Code})" }},
      { name: 'Registration Date', type: 'dateTime' },
      { name: 'Profile Status', type: 'singleSelect', options: {
        choices: [
          { name: 'New', color: 'blueBright2' },
          { name: 'In Progress', color: 'yellowBright2' },
          { name: 'Complete', color: 'greenBright2' },
          { name: 'Inactive', color: 'grayBright2' }
        ]
      }},
      { name: 'Total Claims', type: 'number', options: { precision: 0 }},
      { name: 'Notes', type: 'multilineText' }
    ];
  }

  static async syncMemberToAirtable(veteranProfile: VeteranProfile) {
    try {
      const tableName = await this.createMembersTable();
      
      const record = {
        fields: {
          'UHID': veteranProfile.uhid,
          'First Name': veteranProfile.personalInfo?.firstName || '',
          'Middle Name': veteranProfile.personalInfo?.middleName || '',
          'Last Name': veteranProfile.personalInfo?.lastName || '',
          'Email': veteranProfile.personalInfo?.email || '',
          'Phone': veteranProfile.personalInfo?.phoneNumber || '',
          'Date of Birth': veteranProfile.personalInfo?.dateOfBirth?.toDate ? 
            veteranProfile.personalInfo.dateOfBirth.toDate().toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0],
          'Street Address': veteranProfile.personalInfo?.address?.street || '',
          'City': veteranProfile.personalInfo?.address?.city || '',
          'State': veteranProfile.personalInfo?.address?.state || '',
          'ZIP Code': veteranProfile.personalInfo?.address?.zipCode || '',
          'Registration Date': veteranProfile.createdAt?.toDate ? 
            veteranProfile.createdAt.toDate().toISOString() : 
            new Date().toISOString(),
          'Profile Status': veteranProfile.profileComplete ? 'Complete' : 'In Progress',
          'Total Claims': 0, // Will be updated when claims are created
          'Notes': `Veteran registered via member registration`
        }
      };

      // Create veteran record in Veterans table
      const createdRecord = await getAirtableBase()(tableName).create(record.fields);
      console.log('✅ Veteran synced to Airtable Veterans table:', createdRecord.id);
      return createdRecord.id;

    } catch (error) {
      console.error('Failed to sync veteran to Airtable:', error);
      throw error;
    }
  }

  static async updateMemberClaimCount(uhid: string, increment: number = 1) {
    try {
      const tableName = 'Veterans';
      
      // Find the veteran record by UHID
      const records = await getAirtableBase()(tableName).select({
        filterByFormula: `{UHID} = '${uhid}'`,
        maxRecords: 1
      }).firstPage();
      
      if (records.length > 0) {
        const record = records[0];
        const currentCount = record.fields['Total Claims'] || 0;
        
        await getAirtableBase()(tableName).update(record.id, {
          'Total Claims': currentCount + increment
        });
        console.log(`✅ Updated veteran ${uhid} claim count to ${currentCount + increment}`);
      }
    } catch (error) {
      console.error('Failed to update veteran claim count:', error);
      // Don't throw - this is non-critical
    }
  }

  static async syncClaimToAirtable(claim: Claim, veteranProfile: VeteranProfile) {
    console.log(`🔄 Starting syncClaimToAirtable for claim type: ${claim.claimType}`);
    try {
      const tableName = await this.createClaimTable(claim.claimType);
      console.log(`📋 Using table name: ${tableName}`);
      
      const record = {
        fields: {
          'UHID': veteranProfile.uhid,
          'Veteran Name': `${veteranProfile.personalInfo?.firstName} ${veteranProfile.personalInfo?.lastName}`,
          'Email': veteranProfile.personalInfo?.email,
          'Phone': veteranProfile.personalInfo?.phoneNumber,
          'Claim Status': this.mapClaimStatus(claim.status),
          'Risk Score': claim.riskScore,
          'Completion %': claim.completionPercentage,
          'Created Date': claim.createdAt.toISOString ? claim.createdAt.toISOString() : new Date().toISOString(),
          'Last Modified': claim.lastModified.toISOString ? claim.lastModified.toISOString() : new Date().toISOString(),
          'Branch of Service': veteranProfile.militaryService?.branches || [],
          'Service Dates': veteranProfile.militaryService?.entryDate && veteranProfile.militaryService?.dischargeDate
            ? `${veteranProfile.militaryService.entryDate} - ${veteranProfile.militaryService.dischargeDate}`
            : '',
          'Current Rating': veteranProfile.militaryService?.currentDisabilityRating || 0,
          'Claim ID': claim.id,
          'Claim Type': claim.claimType.charAt(0).toUpperCase() + claim.claimType.slice(1),
          'Notes': `Conditions: ${claim.conditionsClaimed?.map(c => c.conditionName || c.name).join(', ') || 'None'}`
        }
      };

      // Add notes with claim details instead of separate fields to avoid field mismatch issues
      const claimDetails = [];
      if (claim.claimType === 'disability' && claim.conditionsClaimed?.length > 0) {
        claimDetails.push(`Conditions: ${claim.conditionsClaimed.map(c => c.conditionName || c.name).join(', ')}`);
        claimDetails.push(`Service Connected: ${claim.conditionsClaimed.some(c => c.serviceConnection) ? 'Yes' : 'No'}`);
        claimDetails.push(`Documents: ${claim.supportingDocuments?.length || 0}`);
        claimDetails.push(`C&P Exam Needed: ${needsCPExam(claim.conditionsClaimed) ? 'Yes' : 'No'}`);
      }
      
      if (claim.claimType === 'healthcare') {
        claimDetails.push(`Priority Group: ${veteranProfile.personalInfo?.healthcare?.priorityGroup || 'Unknown'}`);
        claimDetails.push(`Insurance: ${veteranProfile.personalInfo?.healthcare?.hasPrivateInsurance ? 'Yes' : 'No'}`);
        claimDetails.push(`Copay Required: ${requiresCopay(veteranProfile.personalInfo?.healthcare?.priorityGroup) ? 'Yes' : 'No'}`);
      }
      
      if (claimDetails.length > 0) {
        record.fields.Notes = `${record.fields.Notes}\n\n${claimDetails.join('\n')}`;
      }

      // Create or update record
      if (claim.airtableRecordId) {
        await getAirtableBase()(tableName).update(claim.airtableRecordId, record.fields);
      } else {
        const createdRecord = await getAirtableBase()(tableName).create(record.fields);
        return createdRecord.id;
      }

    } catch (error) {
      console.error('❌ DETAILED Failed to sync to Airtable:', {
        message: error.message,
        statusCode: (error as any).statusCode,
        error: (error as any).error,
        type: (error as any).type,
        name: error.name,
        stack: error.stack,
        claimType: claim.claimType,
        expectedTable: claim.claimType === 'disability' ? 'Disability_Claims_2025' : 'Healthcare_Claims_2025'
      });
      throw error;
    }
  }

  static mapClaimStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'draft': 'Draft',
      'in_review': 'In Review',
      'ready': 'Ready',
      'submitted': 'Submitted',
      'processing': 'Processing',
      'approved': 'Approved',
      'denied': 'Denied'
    };
    return statusMap[status] || 'Draft';
  }

  static getExposureTypesFromDeployments(deployments: any[]): string[] {
    const exposures = new Set<string>();
    
    deployments.forEach(deployment => {
      // Use specific exposure types if available
      if (deployment.exposureTypes && Array.isArray(deployment.exposureTypes)) {
        deployment.exposureTypes.forEach((exposureId: string) => {
          const exposureMap: Record<string, string> = {
            'agent_orange': 'Agent Orange',
            'burn_pits': 'Burn Pits',
            'radiation': 'Radiation',
            'asbestos': 'Asbestos',
            'pfas': 'PFAS',
            'gulf_war': 'Gulf War',
            'chemical': 'Chemical Weapons',
            'depleted_uranium': 'Depleted Uranium'
          };
          if (exposureMap[exposureId]) {
            exposures.add(exposureMap[exposureId]);
          }
        });
      } else {
        // Fallback to location-based detection
        const location = deployment.location?.toLowerCase() || '';
        const country = deployment.country?.toLowerCase() || '';
        
        if (location.includes('iraq') || location.includes('afghanistan') || country.includes('iraq') || country.includes('afghanistan')) {
          exposures.add('Burn Pits');
        }
        if (location.includes('vietnam') || country.includes('vietnam')) {
          exposures.add('Agent Orange');
        }
        if (deployment.hazardousExposure) {
          exposures.add('Gulf War');
        }
      }
    });
    
    return Array.from(exposures);
  }

  static async getClaimFromAirtable(recordId: string, tableName: string) {
    try {
      const record = await getAirtableBase()(tableName).find(recordId);
      return {
        id: record.id,
        fields: record.fields
      };
    } catch (error) {
      console.error('Failed to get record from Airtable:', error);
      throw error;
    }
  }

  static async getAllClaimsFromTable(tableName: string) {
    try {
      const records = await getAirtableBase()(tableName).select({
        sort: [{ field: 'Last Modified', direction: 'desc' }]
      }).all();
      
      return records.map(record => ({
        id: record.id,
        fields: record.fields
      }));
    } catch (error) {
      console.error('Failed to get records from Airtable:', error);
      throw error;
    }
  }

  static async updateClaimStatus(recordId: string, tableName: string, status: string, notes?: string) {
    try {
      const updateFields: any = {
        'Claim Status': this.mapClaimStatus(status),
        'Last Modified': new Date().toISOString()
      };

      if (notes) {
        updateFields['Notes'] = notes;
      }

      await getAirtableBase()(tableName).update(recordId, updateFields);
    } catch (error) {
      console.error('Failed to update claim status in Airtable:', error);
      throw error;
    }
  }

  // Webhook handler for Airtable updates
  static async handleAirtableWebhook(payload: any) {
    try {
      // Process webhook payload and update Firestore accordingly
      const { recordId, fields, action } = payload;
      
      if (action === 'update' && fields['Claim Status']) {
        // Update corresponding Firestore record
        // This would require mapping Airtable record ID back to Firestore claim ID
        console.log('Airtable update received:', { recordId, status: fields['Claim Status'] });
      }
    } catch (error) {
      console.error('Failed to handle Airtable webhook:', error);
      throw error;
    }
  }

  // Analytics and reporting
  static async getTableStats(tableName: string) {
    try {
      const records = await this.getAllClaimsFromTable(tableName);
      
      const stats = {
        total: records.length,
        byStatus: {} as Record<string, number>,
        averageRisk: 0,
        averageCompletion: 0
      };

      records.forEach(record => {
        const status = record.fields['Claim Status'] as string || 'Draft';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
        
        if (record.fields['Risk Score']) {
          stats.averageRisk += record.fields['Risk Score'] as number;
        }
        
        if (record.fields['Completion %']) {
          stats.averageCompletion += record.fields['Completion %'] as number;
        }
      });

      if (records.length > 0) {
        stats.averageRisk = Math.round(stats.averageRisk / records.length);
        stats.averageCompletion = Math.round(stats.averageCompletion / records.length);
      }

      return stats;
    } catch (error) {
      console.error('Failed to get table stats:', error);
      throw error;
    }
  }
}