#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚂 VetClaimBot Railway Deployment Script\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Must run from project root directory');
  process.exit(1);
}

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
  console.error('❌ Error: .env.local file not found');
  console.log('💡 Make sure your environment variables are configured');
  process.exit(1);
}

console.log('✅ Environment check passed');

try {
  // Build the project
  console.log('\n📦 Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful');

  // Check if Railway CLI is installed
  try {
    execSync('railway --version', { stdio: 'pipe' });
    console.log('✅ Railway CLI found');
  } catch (error) {
    console.log('\n📥 Installing Railway CLI...');
    execSync('npm install -g @railway/cli', { stdio: 'inherit' });
  }

  // Check if project is linked
  try {
    execSync('railway status', { stdio: 'pipe' });
    console.log('✅ Railway project linked');
  } catch (error) {
    console.log('\n🔗 Project not linked to Railway');
    console.log('Please run: railway login && railway link');
    console.log('Or create a new project: railway login && railway init');
    process.exit(1);
  }

  // Deploy to Railway
  console.log('\n🚂 Deploying to Railway...');
  
  execSync('railway deploy', { stdio: 'inherit' });
  
  console.log('\n🎉 Deployment complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Go to https://railway.app/dashboard');
  console.log('2. Find your project and go to Variables tab');
  console.log('3. Add all the environment variables from your .env.local file:');
  console.log('   - NEXT_PUBLIC_FIREBASE_API_KEY');
  console.log('   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  console.log('   - NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  console.log('   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  console.log('   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  console.log('   - NEXT_PUBLIC_FIREBASE_APP_ID');
  console.log('   - OPENAI_API_KEY');
  console.log('   - AIRTABLE_API_KEY');
  console.log('   - AIRTABLE_BASE_ID');
  console.log('4. Railway will automatically redeploy with the new variables');
  console.log('\n🌐 Your app will be live at your Railway domain!');

} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Make sure Railway CLI is installed: npm install -g @railway/cli');
  console.log('2. Login to Railway: railway login');
  console.log('3. Link your project: railway link');
  console.log('4. Check that all dependencies are installed: npm install');
  console.log('5. Verify the build works locally: npm run build');
  console.log('6. Check for TypeScript errors: npm run lint');
  process.exit(1);
}