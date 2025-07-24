# Airtable Setup Guide for VetClaimApp

## 📋 Quick Setup Steps

### 1. Import Templates
1. Go to your Airtable base: `appAA4ClzXdUUXw6k`
2. Create 3 new tables using the CSV templates provided
3. Import each CSV file to create the table structure

### 2. Table Creation Order
**Important:** Create tables in this exact order:

1. **Members** (using `Members_Table_Template.csv`)
2. **Disability_Claims_2025** (using `Disability_Claims_2025_Template.csv`) 
3. **Healthcare_Claims_2025** (using `Healthcare_Claims_2025_Template.csv`)

## 🛠️ Detailed Field Configuration

### Members Table Configuration

After importing, configure these additional fields:

**Calculated Fields to Add:**
```
Full Name (Formula): 
CONCATENATE({First Name}, IF({Middle Name}, CONCATENATE(' ', {Middle Name}), ''), ' ', {Last Name})

Age (Formula):
DATETIME_DIFF(TODAY(), {Date of Birth}, 'years')

Full Address (Formula):
CONCATENATE({Street Address}, ', ', {City}, ', ', {State}, ' ', {ZIP Code})
```

**Single Select Options:**

`State` field options:
```
Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware, Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana, Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana, Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina, North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina, South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia, Wisconsin, Wyoming
```

`Profile Status` field options:
```
New (Blue), In Progress (Yellow), Complete (Green), Inactive (Gray)
```

### Claims Tables Configuration

**Single Select Options for BOTH Claims Tables:**

`Claim Status` options:
```
Draft (Gray), In Review (Blue), Ready (Purple), Submitted (Teal), Processing (Yellow), Approved (Green), Denied (Red)
```

`Branch of Service` (Multiple Select) options:
```
Army (Green), Navy (Blue), Air Force (Cyan), Marines (Red), Coast Guard (Orange), Space Force (Purple)
```

**Disability Claims Additional Options:**

`Exposure Type` (Multiple Select):
```
Agent Orange (Orange), Burn Pits (Red), Radiation (Yellow), Asbestos (Gray), PFAS (Green), Gulf War (Blue)
```

**Healthcare Claims Additional Options:**

`Priority Group` (Single Select):
```
Group 1 (Red), Group 2 (Orange), Group 3 (Yellow), Group 4 (Green), Group 5 (Blue), Group 6 (Purple), Group 7 (Gray), Group 8 (Pink)
```

## 🔧 Field Types Reference

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| UHID | Single Line Text | ✅ | Primary identifier |
| First Name | Single Line Text | ✅ | |
| Middle Name | Single Line Text | ❌ | Optional |
| Last Name | Single Line Text | ✅ | |
| Email | Email | ✅ | |
| Phone | Phone Number | ✅ | |
| Date of Birth | Date | ✅ | |
| Claim Status | Single Select | ✅ | Must match options exactly |
| Risk Score | Number | ✅ | 0-100, integer |
| Completion % | Number | ✅ | 0-100, integer |
| Service Connection | Checkbox | ❌ | Disability claims only |
| Insurance | Checkbox | ❌ | Healthcare claims only |

## ⚠️ Critical Requirements

1. **Exact Field Names:** Field names must match exactly (case-sensitive)
2. **Exact Table Names:** 
   - `Members`
   - `Disability_Claims_2025` 
   - `Healthcare_Claims_2025`
3. **Single Select Options:** Must include all options listed above
4. **Date Format:** Use ISO format for dates (YYYY-MM-DDTHH:mm:ss.sssZ)

## 🧪 Testing Your Setup

After setup, test with these values:
- UHID: `VET-TEST-123`
- Complete a test intake in your app
- Verify records appear in all 3 tables
- Check calculated fields display correctly

## 🚨 Troubleshooting

**Common Issues:**
- ❌ "Field not found" → Check field name spelling
- ❌ "Invalid value" → Check Single Select options
- ❌ "Type mismatch" → Verify field types match guide
- ❌ No data syncing → Check table names exactly

**Success Indicators:**
- ✅ Member record appears in Members table
- ✅ Claim record appears in appropriate Claims table
- ✅ Member's "Total Claims" count increments
- ✅ Calculated fields display proper values

## 📞 Support

If you encounter issues:
1. Check field names match exactly
2. Verify Single Select options are configured
3. Test with sample data first
4. Check console logs for specific error messages