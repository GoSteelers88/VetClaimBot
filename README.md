# VetClaimBot - AI-Powered VA Benefits Assistant

A comprehensive web application designed to help U.S. military veterans navigate the VA benefits system with AI-powered guidance, intelligent form automation, and seamless claim management.

## 🚀 Features

### 🔐 **Secure Authentication**
- Firebase Authentication with email/password
- Protected routes and session management
- Role-based access control

### 📝 **Intelligent Claim Builder**
- 6-step guided intake wizard
- Real-time form validation and progress tracking
- Auto-save functionality with local storage
- Smart field pre-population

### 🤖 **AI-Powered Assistant**
- ChatGPT-4 integration for personalized guidance
- Context-aware responses based on veteran profile
- Quick action buttons ("Fix My Claim", "What's Missing?", "Summarize")
- Real-time chat with conversation history

### 📊 **Comprehensive Dashboard**
- Claims overview with status tracking
- Risk scoring and completion percentages
- Exposure alerts based on service history
- Statistical insights and progress tracking

### 🔗 **Airtable Integration**
- Automatic table creation per claim type
- Real-time data synchronization
- Dynamic field mapping
- Analytics and reporting

### 🚨 **Exposure Alert System**
- Location-based presumptive condition matching
- Automatic notifications for potential benefits
- Deployment history analysis
- Evidence suggestions

### 📁 **Document Management**
- Secure file upload to Firebase Storage
- Document type classification
- Progress tracking and validation
- OCR processing capability

### 👤 **Profile Management**
- Complete veteran profile system
- Military service history tracking
- Deployment and assignment records
- Real-time profile updates

## 🛠 **Tech Stack**

### **Frontend**
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Real-time Updates**: Firebase Firestore listeners

### **Backend**
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Functions**: Firebase Cloud Functions
- **AI**: OpenAI GPT-4 API
- **External API**: Airtable REST API
- **Hosting**: Railway (recommended), Vercel, Firebase Hosting

### **Key Libraries**
- `firebase` - Backend services
- `openai` - AI integration
- `airtable` - External data sync
- `react-hook-form` - Form management
- `zod` - Schema validation
- `zustand` - State management
- `date-fns` - Date utilities
- `lucide-react` - Icons

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ and npm
- Firebase project
- OpenAI API account
- Airtable account

### **Installation**

1. **Clone the repository**
```bash
git clone <repository-url>
cd VetClaimApp
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create `.env.local` file:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (for server-side operations)
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_service_account_private_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Airtable Configuration
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_base_id
```

4. **Firebase Setup**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Deploy security rules
firebase deploy --only firestore:rules,storage:rules
```

5. **Run the development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 **Project Structure**

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Main application
│   ├── intake/            # Claim builder wizard
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── intake/           # Intake wizard components
│   ├── chat/             # AI chat components
│   └── upload/           # File upload components
├── lib/                  # Utility libraries
│   ├── firebase.ts       # Firebase configuration
│   ├── firestore.ts      # Database operations
│   ├── airtable.ts       # Airtable integration
│   └── utils.ts          # Helper functions
├── stores/               # Zustand state stores
├── types/                # TypeScript definitions
└── hooks/                # Custom React hooks
```

## 🔧 **Key Components**

### **Intake Wizard**
- `Step1PersonalInfo` - Personal information collection
- `Step2ServiceHistory` - Military service details
- `Step3Deployments` - Deployment and assignment history
- Additional steps for conditions, providers, documents

### **Dashboard**
- `DashboardLayout` - Main layout with navigation
- `ClaimCard` - Individual claim visualization
- `StatsCard` - Metrics and statistics display
- `ExposureAlerts` - Benefit notifications

### **AI Assistant**
- `ChatInterface` - Main chat component
- Real-time messaging with context
- Quick action buttons for common tasks

### **Document Management**
- `DocumentUpload` - File upload with progress
- Firebase Storage integration
- Document type classification

## 🔐 **Security Features**

### **Firestore Security Rules**
- User isolation (users can only access their own data)
- Role-based access control
- Data validation at database level
- Rate limiting protection

### **Storage Security Rules**
- File type validation
- Size restrictions
- User-based folder isolation
- Malicious file detection

### **Application Security**
- Input sanitization and validation
- Protected routes with authentication
- CSRF protection
- Secure API endpoints

## 🧪 **Testing**

```bash
# Run unit tests
npm test

# Run integration tests  
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Run all tests
npm run test:all
```

## 🚀 **Deployment**

### **Railway Deployment (Recommended)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Deploy
npm run deploy:railway
```
See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed instructions.

### **Alternative Deployment Options**

#### **Production Build**
```bash
npm run build
```

#### **Firebase Hosting**  
```bash
firebase deploy --only hosting
```

#### **Vercel Deployment**
```bash
npx vercel
```

## 📊 **Features by Priority**

### **✅ Completed Features**
- ✅ Complete authentication system
- ✅ Responsive dashboard with navigation
- ✅ Multi-step intake wizard with skip functionality
- ✅ AI assistant with ChatGPT integration
- ✅ Profile management system
- ✅ Claims management interface
- ✅ Document upload system
- ✅ Enhanced Airtable integration with error handling
- ✅ Exposure alert system
- ✅ Individual claim detail pages
- ✅ Railway deployment configuration
- ✅ Medical conditions skip option

### **🔄 In Development**
- Remaining intake wizard steps (4-7)
- Real-time notifications
- Advanced AI features
- PDF generation
- Email notifications

### **📋 Planned Features**
- Mobile app
- VA.gov API integration
- Admin dashboard
- Advanced analytics
- Bulk operations

## 🤝 **Contributing**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Built with respect and gratitude for our veterans
- Powered by Firebase and OpenAI
- UI components from Shadcn/ui
- Icons from Lucide React

## 📞 **Support**

For questions or support:
- Email: support@vetclaimbot.com
- Documentation: [docs.vetclaimbot.com](https://docs.vetclaimbot.com)
- Issues: [GitHub Issues](https://github.com/vetclaimbot/issues)

---

**VetClaimBot** - Empowering veterans to claim the benefits they've earned. 🇺🇸