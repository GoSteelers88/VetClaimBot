# VetClaimBot Deployment Guide

## 🚀 Quick Deploy to Vercel (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Build and Test Locally
```bash
# Make sure everything works locally first
npm run build
npm start
```

### Step 3: Deploy to Vercel
```bash
# From your project directory
cd "C:\Users\nbber\Desktop\VetClaimApp"
vercel
```

**Follow the prompts:**
- ✅ Set up and deploy? **Y**
- ✅ Which scope? **Your personal account**
- ✅ Link to existing project? **N** 
- ✅ Project name: **vetclaimbot**
- ✅ In which directory? **./ (current directory)**
- ✅ Override settings? **N**

### Step 4: Add Environment Variables
After deployment, go to https://vercel.com/dashboard and:

1. Select your **vetclaimbot** project
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyDJYK4t8Y50P7hYVZ3zpDDlh64mfQdrfAU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = vetclaimbot.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = vetclaimbot
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = vetclaimbot.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 769336551289
NEXT_PUBLIC_FIREBASE_APP_ID = 1:769336551289:web:fe2c2519acf82fb8bb71a8
NEXT_PUBLIC_FIREBASE_DATABASE_URL = https://vetclaimbot-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = G-P985Z7VX1B
OPENAI_API_KEY = your_openai_api_key_here
AIRTABLE_API_KEY = your_airtable_api_key_here
AIRTABLE_BASE_ID = your_airtable_base_id_here
```

### Step 5: Redeploy
```bash
vercel --prod
```

## 🌐 Alternative: Railway Deployment

### Step 1: Install Railway
```bash
npm install -g @railway/cli
```

### Step 2: Deploy
```bash
railway login
railway init
railway up
```

### Step 3: Add Environment Variables
```bash
# Add each environment variable
railway variables set NEXT_PUBLIC_FIREBASE_API_KEY AIzaSyDJYK4t8Y50P7hYVZ3zpDDlh64mfQdrfAU
railway variables set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN vetclaimbot.firebaseapp.com
# ... add all other variables
```

## 🔥 Firebase Hosting (Since you're using Firebase)

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login and Initialize
```bash
firebase login
firebase init hosting
```

**Configuration answers:**
- ✅ Use existing project: **vetclaimbot**
- ✅ Public directory: **.next** (or **out** if using static export)
- ✅ Single-page app: **Y**
- ✅ Automatic builds with GitHub: **N** (for now)

### Step 3: Build and Deploy
```bash
npm run build
firebase deploy --only hosting
```

## 📱 Testing Your Deployed App

### Test These Features:
1. **Homepage** - Landing page loads correctly
2. **Authentication** - Sign up/sign in works
3. **Dashboard** - Protected routes work
4. **Intake Wizard** - All 7 steps function
5. **AI Assistant** - Chat with OpenAI integration
6. **Document Upload** - File uploads to Firebase Storage
7. **Airtable Sync** - Data syncs to your Airtable base

### Test Users Can:
- ✅ Create an account
- ✅ Complete the intake wizard
- ✅ Upload documents
- ✅ Chat with AI assistant
- ✅ View their dashboard

## 🔒 Security Checklist

Before sharing publicly:
- ✅ Environment variables are secure
- ✅ Firebase security rules are in place
- ✅ No API keys exposed in client code
- ✅ HTTPS is enabled (automatic with Vercel/Netlify)
- ✅ Authentication is working properly

## 🚀 Share Your App

Once deployed, you'll get a URL like:
- **Vercel**: `https://vetclaimbot.vercel.app`
- **Railway**: `https://vetclaimbot.up.railway.app`
- **Firebase**: `https://vetclaimbot.web.app`

Share this URL with testers along with:
- Test credentials (if needed)
- What features to test
- How to report issues

## 🛠 Troubleshooting

### Common Issues:
1. **Build fails**: Check for TypeScript errors with `npm run lint`
2. **Environment variables not working**: Make sure they're added to your hosting platform
3. **Firebase errors**: Check that your Firebase project is properly configured
4. **API errors**: Verify all API keys are correctly set

### Debug Commands:
```bash
# Check build locally
npm run build

# Check for linting errors
npm run lint

# Test production build locally
npm run start
```

---

**Need help?** Check the deployment logs in your hosting platform's dashboard for specific error messages.