import { 
  doc, 
  collection, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

import { firestore } from './firebase';
import { VeteranProfile, Claim, ChatSession, PresumptiveCondition } from '@/types';

// User Management
export const createUserProfile = async (userId: string, data: Partial<VeteranProfile>) => {
  const docRef = doc(firestore(), 'veterans', userId);
  await setDoc(docRef, {
    ...data,
    uid: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const getUserProfile = async (userId: string): Promise<VeteranProfile | null> => {
  const docRef = doc(firestore(), 'veterans', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as VeteranProfile;
  }
  return null;
};

export const updateUserProfile = async (userId: string, data: Partial<VeteranProfile>) => {
  const docRef = doc(firestore(), 'veterans', userId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// Claims Management
export const createClaim = async (veteranId: string, claimData: Omit<Claim, 'id' | 'createdAt' | 'lastModified'>) => {
  const docRef = await addDoc(collection(firestore(), 'claims'), {
    ...claimData,
    veteranId,
    createdAt: serverTimestamp(),
    lastModified: serverTimestamp()
  });
  
  return docRef.id;
};

export const updateClaim = async (claimId: string, updates: Partial<Claim>) => {
  const docRef = doc(firestore(), 'claims', claimId);
  await updateDoc(docRef, {
    ...updates,
    lastModified: serverTimestamp()
  });
};

export const getClaim = async (claimId: string): Promise<Claim | null> => {
  const docRef = doc(firestore(), 'claims', claimId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Claim;
  }
  return null;
};

export const getVeteranClaims = async (veteranId: string): Promise<Claim[]> => {
  // Use a simpler query without orderBy to avoid composite index requirement
  // We'll sort on the client side instead
  const q = query(
    collection(firestore(), 'claims'),
    where('veteranId', '==', veteranId)
  );
  
  const querySnapshot = await getDocs(q);
  const claims = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Claim[];
  
  // Sort by lastModified on client side
  return claims.sort((a, b) => {
    const aTime = a.lastModified?.toDate?.() || new Date(0);
    const bTime = b.lastModified?.toDate?.() || new Date(0);
    return bTime.getTime() - aTime.getTime();
  });
};

export const getVeteranClaim = async (veteranId: string, claimId: string): Promise<Claim | null> => {
  const docRef = doc(firestore(), 'claims', claimId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const claimData = { id: docSnap.id, ...docSnap.data() } as Claim;
    // Verify this claim belongs to the veteran
    if (claimData.veteranId === veteranId) {
      return claimData;
    }
  }
  return null;
};

export const subscribeToVeteranClaims = (veteranId: string, callback: (claims: Claim[]) => void) => {
  const q = query(
    collection(firestore(), 'claims'),
    where('veteranId', '==', veteranId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const claims = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Claim[];
    
    // Sort by lastModified on client side
    const sortedClaims = claims.sort((a, b) => {
      const aTime = a.lastModified?.toDate?.() || new Date(0);
      const bTime = b.lastModified?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime();
    });
    
    callback(sortedClaims);
  });
};

// Chat Sessions
export const createChatSession = async (veteranId: string, initialMessage?: string) => {
  const sessionData = {
    veteranId,
    sessionStart: serverTimestamp(),
    messages: initialMessage ? [{
      id: Date.now().toString(),
      role: 'user' as const,
      content: initialMessage,
      timestamp: serverTimestamp()
    }] : [],
    topicsDiscussed: [],
    actionsCompleted: []
  };
  
  const docRef = await addDoc(collection(firestore(), 'chatSessions'), sessionData);
  return docRef.id;
};

export const addChatMessage = async (sessionId: string, message: {
  role: 'user' | 'assistant';
  content: string;
}) => {
  const sessionRef = doc(firestore(), 'chatSessions', sessionId);
  const sessionSnap = await getDoc(sessionRef);
  
  if (sessionSnap.exists()) {
    const sessionData = sessionSnap.data() as ChatSession;
    const newMessage = {
      id: Date.now().toString(),
      ...message,
      timestamp: serverTimestamp()
    };
    
    await updateDoc(sessionRef, {
      messages: [...(sessionData.messages || []), newMessage],
      lastActivity: serverTimestamp()
    });
  }
};

export const getChatSessions = async (veteranId: string, limitCount = 10): Promise<ChatSession[]> => {
  // Use simpler query without orderBy to avoid composite index requirement
  const q = query(
    collection(firestore(), 'chatSessions'),
    where('veteranId', '==', veteranId)
  );
  
  const querySnapshot = await getDocs(q);
  const sessions = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ChatSession[];
  
  // Sort and limit on client side
  return sessions
    .sort((a, b) => {
      const aTime = a.sessionStart?.toDate?.() || new Date(0);
      const bTime = b.sessionStart?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime();
    })
    .slice(0, limitCount);
};

// Presumptive Conditions
export const getPresumptiveConditions = async (): Promise<PresumptiveCondition[]> => {
  const querySnapshot = await getDocs(collection(firestore(), 'presumptiveConditions'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as PresumptiveCondition[];
};

export const checkExposureAlerts = async (veteranId: string, deployments: any[]) => {
  const presumptiveConditions = await getPresumptiveConditions();
  const alerts = [];
  
  for (const deployment of deployments) {
    for (const condition of presumptiveConditions) {
      const locationMatch = condition.affectedLocations.some(location => 
        deployment.location.toLowerCase().includes(location.toLowerCase()) ||
        deployment.country.toLowerCase().includes(location.toLowerCase())
      );
      
      const dateMatch = deployment.startDate >= condition.dateRange.start &&
                       deployment.startDate <= condition.dateRange.end;
      
      if (locationMatch && dateMatch) {
        alerts.push({
          conditionId: condition.id,
          conditionName: condition.conditionName,
          exposureType: condition.exposureType,
          deploymentReference: deployment.id,
          alertDate: serverTimestamp(),
          acknowledged: false,
          claimSuggested: condition.automaticServiceConnection
        });
      }
    }
  }
  
  // Save alerts to user's profile
  if (alerts.length > 0) {
    const userRef = doc(firestore(), 'veterans', veteranId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const existingAlerts = userData.exposureAlerts || [];
      
      await updateDoc(userRef, {
        exposureAlerts: [...existingAlerts, ...alerts],
        updatedAt: serverTimestamp()
      });
    }
  }
  
  return alerts;
};

// Analytics and Reporting
export const getClaimStats = async (veteranId: string) => {
  const claims = await getVeteranClaims(veteranId);
  
  return {
    total: claims.length,
    byStatus: claims.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    averageCompletion: claims.length > 0 
      ? Math.round(claims.reduce((sum, claim) => sum + claim.completionPercentage, 0) / claims.length)
      : 0,
    averageRiskScore: claims.length > 0
      ? Math.round(claims.reduce((sum, claim) => sum + claim.riskScore, 0) / claims.length)
      : 0
  };
};

// Utility functions
export const generateUHID = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `VET-${timestamp}-${random}`.toUpperCase();
};

export const calculateRiskScore = (claim: Partial<Claim>): number => {
  let score = 0;
  
  // Condition severity (0-40 points)
  if (claim.conditionsClaimed?.length) {
    score += Math.min(claim.conditionsClaimed.length * 10, 40);
  }
  
  // Documentation completeness (0-30 points)
  if (claim.supportingDocuments?.length) {
    score += Math.min(claim.supportingDocuments.length * 5, 30);
  }
  
  // Treatment history (0-20 points)
  if (claim.treatmentHistory?.length) {
    score += Math.min(claim.treatmentHistory.length * 5, 20);
  }
  
  // Service connection strength (0-10 points)
  const serviceConnectedConditions = claim.conditionsClaimed?.filter(c => c.serviceConnection).length || 0;
  score += Math.min(serviceConnectedConditions * 5, 10);
  
  return Math.min(score, 100);
};

// Batch operations
export const batchUpdateClaims = async (updates: Array<{ id: string; data: Partial<Claim> }>) => {
  const promises = updates.map(({ id, data }) => updateClaim(id, data));
  await Promise.all(promises);
};

export const deleteClaim = async (claimId: string) => {
  const docRef = doc(firestore(), 'claims', claimId);
  await deleteDoc(docRef);
};