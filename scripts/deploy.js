#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 VetClaimBot Deployment Script\n');

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

  // Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI found');
  } catch (error) {
    console.log('\n📥 Installing Vercel CLI...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
  }

  // Deploy to Vercel
  console.log('\n🚀 Deploying to Vercel...');
  console.log('📝 Follow the prompts to configure your deployment\n');
  
  execSync('vercel --prod', { stdio: 'inherit' });
  
  console.log('\n🎉 Deployment complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Find your project and go to Settings → Environment Variables');
  console.log('3. Add all the environment variables from your .env.local file');
  console.log('4. Redeploy if needed with: vercel --prod');
  console.log('\n🌐 Your app should be live at the URL shown above!');

} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check that all dependencies are installed: npm install');
  console.log('2. Verify the build works locally: npm run build');
  console.log('3. Check for TypeScript errors: npm run lint');
  process.exit(1);
}