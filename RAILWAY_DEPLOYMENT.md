# Railway Deployment Guide for VetClaimBot

## 🚂 Quick Deployment Steps

### 1. **Install Railway CLI** (if not already installed)
```bash
npm install -g @railway/cli
```

### 2. **Login to Railway**
```bash
railway login
```

### 3. **Link Your Project**
Choose one of these options:

**Option A: Link to existing project**
```bash
railway link
```
Select your project from the list (e.g., `respectful-intuition`)

**Option B: Create new project**
```bash
railway init
```

### 4. **Deploy the Application**
```bash
npm run deploy:railway
```

Or manually:
```bash
npm run build
railway up
```

## 🔧 Environment Variables Configuration

After deployment, add these environment variables in the Railway dashboard:

### **Required Variables:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
OPENAI_API_KEY=your_openai_api_key
```

### **Optional Variables:**
```
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_base_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🌐 Access Your Deployment

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Find your project (`respectful-intuition` or your chosen name)
3. Click on your service
4. Find the generated domain URL
5. Your app will be live at: `https://your-app-name.railway.app`

## 🔄 Redeployment

### **Method 1: Automatic (Recommended)**
```bash
npm run deploy:railway
```

### **Method 2: Manual**
```bash
npm run build
railway up
```

### **Method 3: Redeploy without changes**
```bash
railway redeploy
```

## 🚨 Troubleshooting

### **Project Not Linked Error**
```bash
railway link
```
Select your project from the interactive list.

### **Build Errors**
1. Check TypeScript errors: `npm run lint`
2. Test build locally: `npm run build`
3. Check environment variables in Railway dashboard

### **Environment Variables Not Loading**
1. Go to Railway Dashboard → Your Project → Variables
2. Add all required variables from your `.env.local`
3. Railway will automatically redeploy

### **502/503 Errors**
1. Check logs: `railway logs`
2. Verify all environment variables are set
3. Ensure Firebase project is properly configured

## 📋 Deployment Checklist

- [ ] Railway CLI installed and logged in
- [ ] Project linked to Railway
- [ ] Build completed successfully (`npm run build`)
- [ ] Environment variables configured in Railway dashboard
- [ ] Firebase project configured and accessible
- [ ] OpenAI API key valid and active
- [ ] Domain is accessible and app loads
- [ ] Authentication flows working
- [ ] Database connections functional

## 🔗 Useful Commands

```bash
# Check Railway status
railway status

# View environment variables
railway variables

# Open project dashboard
railway open

# View deployment logs
railway logs

# Connect to project shell
railway shell

# List all projects
railway list
```

## 📊 Monitoring

- **Dashboard**: https://railway.app/dashboard
- **Logs**: `railway logs` or view in dashboard
- **Metrics**: Available in Railway dashboard
- **Uptime**: Railway provides built-in uptime monitoring

---

**🎉 Your VetClaimBot is now deployed on Railway!**