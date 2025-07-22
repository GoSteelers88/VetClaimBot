import Airtable from 'airtable';
import { Claim, VeteranProfile } from '@/types';

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
    const tableName = `${claimType.charAt(0).toUpperCase() + claimType.slice(1)}_Claims_${year}`;
    
    try {
      // Check if table already exists by trying to access it
      const records = await getAirtableBase()(tableName).select({ maxRecords: 1 }).firstPage();
      return tableName; // Table exists
    } catch (error) {
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
      { name: 'Notes', type: 'multilineText' }
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
      
      case 'education':
        return [
          ...baseFields,
          { name: 'GI Bill Type', type: 'singleSelect', options: {
            choices: [
              { name: 'Post-9/11', color: 'blueBright2' },
              { name: 'Montgomery Active', color: 'greenBright2' },
              { name: 'Montgomery Reserves', color: 'purpleBright2' },
              { name: 'DEA', color: 'orangeBright2' }
            ]
          }},
          { name: 'School Name', type: 'singleLineText' },
          { name: 'Degree Program', type: 'singleLineText' },
          { name: 'Enrollment Status', type: 'singleSelect', options: {
            choices: [
              { name: 'Full Time', color: 'greenBright2' },
              { name: 'Part Time', color: 'yellowBright2' },
              { name: 'Online', color: 'blueBright2' }
            ]
          }},
          { name: 'Benefits Used', type: 'number', options: { precision: 2 }},
          { name: 'Benefits Remaining', type: 'number', options: { precision: 2 }}
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

  static async syncClaimToAirtable(claim: Claim, veteranProfile: VeteranProfile) {
    try {
      const tableName = await this.createClaimTable(claim.claimType);
      
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
          'Notes': `Claim ID: ${claim.id}\nConditions: ${claim.conditionsClaimed?.map(c => c.conditionName).join(', ') || 'None'}`
        }
      };

      // Add claim-specific fields
      if (claim.claimType === 'disability') {
        record.fields = {
          ...record.fields,
          'Conditions Claimed': claim.conditionsClaimed?.map(c => 
            `${c.conditionName} (${c.serviceConnection ? 'Service Connected' : 'Not SC'})`
          ).join('\n') || '',
          'Service Connection': claim.conditionsClaimed?.some(c => c.serviceConnection) || false,
          'Medical Records': (claim.supportingDocuments?.length || 0) > 0,
          'Exposure Type': this.getExposureTypes(veteranProfile.deployments || [])
        };
      }

      // Create or update record
      if (claim.airtableRecordId) {
        await getAirtableBase()(tableName).update(claim.airtableRecordId, record.fields);
      } else {
        const createdRecord = await getAirtableBase()(tableName).create(record.fields);
        return createdRecord.id;
      }

    } catch (error) {
      console.error('Failed to sync to Airtable:', error);
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

  static getExposureTypes(deployments: any[]): string[] {
    const exposures = new Set<string>();
    
    deployments.forEach(deployment => {
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