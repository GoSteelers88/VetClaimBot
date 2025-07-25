import { create } from 'zustand';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import { VeteranProfile, User } from '@/types';
import { generateUHID } from '@/lib/firestore';

interface AuthState {
  user: FirebaseUser | null;
  veteran: VeteranProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<VeteranProfile>) => Promise<void>;
  initializeAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  veteran: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth(), email, password);
      const user = userCredential.user;
      
      // Temporarily disable email verification requirement for testing
      // TODO: Re-enable email verification after fixing the verification flow
      // if (!user.emailVerified) {
      //   throw new Error('Please verify your email address before signing in. Check your inbox for the verification link.');
      // }
      
      // Fetch veteran profile (with auto-creation logic)
      const veteranDoc = await getDoc(doc(firestore(), 'veterans', user.uid));
      let veteranData: VeteranProfile | null = null;
      
      if (veteranDoc.exists()) {
        veteranData = veteranDoc.data() as VeteranProfile;
      } else {
        // Create a basic veteran profile if it doesn't exist
        const basicProfile: Partial<VeteranProfile> = {
          uid: user.uid,
          uhid: generateUHID(),
          status: 'active',
          profileComplete: false,
          riskScore: 0,
          riskCategory: 'low',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(doc(firestore(), 'veterans', user.uid), basicProfile);
        veteranData = basicProfile as VeteranProfile;
      }
      
      set({ 
        user,
        veteran: veteranData,
        isLoading: false 
      });
    } catch (error) {
      console.error('Sign in error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign in',
        isLoading: false 
      });
      throw error;
    }
  },

  signUp: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth(), email, password);
      const user = userCredential.user;
      
      // Update display name
      await updateProfile(user, { displayName });
      
      // Send email verification
      await sendEmailVerification(user);
      
      // Create user document
      const userData: User = {
        uid: user.uid,
        email: user.email!,
        displayName,
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp() as any,
        lastLogin: serverTimestamp() as any,
        profileComplete: false
      };
      
      await setDoc(doc(firestore(), 'users', user.uid), userData);
      
      // Create initial veteran profile
      const veteranProfile: Partial<VeteranProfile> = {
        uid: user.uid,
        uhid: generateUHID(),
        status: 'active',
        riskScore: 0,
        riskCategory: 'low',
        personalInfo: {
          firstName: '',
          lastName: '',
          email,
        } as any,
        militaryService: {} as any,
        deployments: [],
        dependents: [],
        medicalHistory: {
          currentConditions: [],
          medications: [],
          vaHealthcare: false
        },
        exposureAlerts: [],
        profileComplete: false
      };
      
      await setDoc(doc(firestore(), 'veterans', user.uid), veteranProfile);
      
      set({ 
        user,
        veteran: veteranProfile as VeteranProfile,
        isLoading: false 
      });
    } catch (error) {
      console.error('Sign up error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create account',
        isLoading: false 
      });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    
    try {
      await firebaseSignOut(auth());
      set({ 
        user: null,
        veteran: null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign out',
        isLoading: false 
      });
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await sendPasswordResetEmail(auth(), email);
      set({ isLoading: false });
    } catch (error) {
      console.error('Reset password error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to send reset email',
        isLoading: false 
      });
      throw error;
    }
  },

  resendVerification: async (email: string) => {
    // This is a placeholder - we'll implement this differently
    // For now, just direct users to check their email
    set({ 
      error: 'Please check your email for the verification link. If you can\'t find it, check your spam folder or try registering again.',
      isLoading: false 
    });
  },

  updateProfile: async (updates: Partial<VeteranProfile>) => {
    const { user, veteran } = get();
    if (!user || !veteran) return;

    set({ isLoading: true, error: null });
    
    try {
      const updatedProfile = { ...veteran, ...updates };
      await updateDoc(doc(firestore(), 'veterans', user.uid), updatedProfile);
      
      set({ 
        veteran: updatedProfile,
        isLoading: false 
      });
    } catch (error) {
      console.error('Update profile error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update profile',
        isLoading: false 
      });
      throw error;
    }
  },

  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth(), async (user) => {
      if (user) {
        try {
          // Fetch veteran profile
          const veteranDoc = await getDoc(doc(firestore(), 'veterans', user.uid));
          let veteranData: VeteranProfile | null = null;
          
          if (veteranDoc.exists()) {
            veteranData = veteranDoc.data() as VeteranProfile;
          } else {
            // Create a basic veteran profile if it doesn't exist
            const basicProfile: Partial<VeteranProfile> = {
              uid: user.uid,
              uhid: generateUHID(),
              status: 'active',
              profileComplete: false,
              riskScore: 0,
              riskCategory: 'low',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            
            await setDoc(doc(firestore(), 'veterans', user.uid), basicProfile);
            veteranData = basicProfile as VeteranProfile;
          }
          
          // Update last login if user document exists
          try {
            const userDoc = await getDoc(doc(firestore(), 'users', user.uid));
            if (userDoc.exists()) {
              await updateDoc(doc(firestore(), 'users', user.uid), {
                lastLogin: serverTimestamp()
              });
            }
          } catch (updateError) {
            console.log('Could not update last login - user document may not exist:', updateError);
          }
          
          set({ 
            user,
            veteran: veteranData,
            isInitialized: true,
            isLoading: false
          });
        } catch (error) {
          console.error('Auth state change error:', error);
          set({ 
            user,
            veteran: null,
            isInitialized: true,
            isLoading: false,
            error: 'Failed to load profile'
          });
        }
      } else {
        set({ 
          user: null,
          veteran: null,
          isInitialized: true,
          isLoading: false,
          error: null
        });
      }
    });

    // Return cleanup function
    return unsubscribe;
  },

  clearError: () => set({ error: null }),
}));