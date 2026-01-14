
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  collection, 
  query, 
  where,
  getDoc,
  deleteDoc,
  addDoc,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { db, auth } from '../firebaseConfig';
import { FamilyConfig, UserProfile, PendingRequest, UserRole, Transaction } from '../types';
import { applyIncomeToUser, calculateSplits } from '../services/TransactionService';

interface FamilyContextType {
  config: FamilyConfig | null;
  childProfile: UserProfile | null;
  currentUser: UserProfile | null;
  pendingRequests: PendingRequest[];
  transactions: Transaction[];
  // Fix: Added password as an optional property to satisfy the call in components/LoginScreen.tsx
  login: (creds: { identifier: string; role: UserRole; password?: string }) => Promise<void>;
  signUpParent: (data: { email: string; name: string }) => Promise<void>;
  signUpChild: (data: { familyCode: string; username: string; name: string }) => Promise<void>;
  logout: () => void;
  updateConfig: (newConfig: Partial<FamilyConfig>) => Promise<void>;
  updateChildProfile: (newProfile: Partial<UserProfile>) => Promise<void>;
  addPendingRequest: (req: Omit<PendingRequest, 'id' | 'timestamp' | 'familyCode'>) => Promise<void>;
  resolveRequest: (id: string, approved: boolean) => Promise<void>;
  processExternalIncome: (amount: number) => Promise<void>;
  grantBarakahBonus: () => Promise<void>;
  isLoading: boolean;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<FamilyConfig | null>(null);
  const [childProfile, setChildProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.data() as UserProfile;
            setCurrentUser(userData);
            
            if (userData.familyCode) {
              onSnapshot(doc(db, 'family_configs', userData.familyCode), (cs) => setConfig(cs.data() as FamilyConfig));
              
              const reqsQuery = query(collection(db, 'requests'), where('familyCode', '==', userData.familyCode));
              onSnapshot(reqsQuery, (rs) => {
                const r: PendingRequest[] = [];
                rs.forEach(d => r.push({ ...d.data(), id: d.id } as PendingRequest));
                setPendingRequests(r.sort((a, b) => b.timestamp - a.timestamp));
              });

              const transQuery = query(
                collection(db, 'transactions'), 
                where('familyCode', '==', userData.familyCode)
              );
              onSnapshot(transQuery, (ts) => {
                const t: Transaction[] = [];
                ts.forEach(d => t.push({ ...d.data(), id: d.id } as Transaction));
                setTransactions(t.sort((a, b) => b.timestamp - a.timestamp));
              });

              if (userData.role === 'PARENT') {
                const childrenQuery = query(collection(db, 'users'), where('familyCode', '==', userData.familyCode), where('role', '==', 'CHILD'));
                onSnapshot(childrenQuery, (snap) => {
                  if (!snap.empty) setChildProfile(snap.docs[0].data() as UserProfile);
                });
              }
            }
          }
          setIsLoading(false);
        });
      } else {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });
  }, []);

  const processExternalIncome = async (amount: number) => {
    if (currentUser?.role === 'CHILD' && config) {
      const updated = applyIncomeToUser(currentUser, amount, config);
      const splits = calculateSplits(amount, config);
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        walletBalance: updated.walletBalance,
        sadaqahBalance: updated.sadaqahBalance,
        savingsBalance: updated.savingsBalance
      });

      await addDoc(collection(db, 'transactions'), {
        userId: currentUser.uid,
        familyCode: currentUser.familyCode,
        type: 'INCOME_SPLIT',
        amount,
        note: 'External Income Added',
        timestamp: Date.now(),
        splits
      });
    }
  };

  const grantBarakahBonus = async () => {
    if (childProfile && config) {
      const bonus = config.barakahBonusAmount;
      await updateDoc(doc(db, 'users', childProfile.uid), {
        walletBalance: childProfile.walletBalance + bonus
      });
      await addDoc(collection(db, 'transactions'), {
        userId: childProfile.uid,
        familyCode: childProfile.familyCode,
        type: 'BONUS',
        amount: bonus,
        note: 'Barakah Consistency Bonus',
        timestamp: Date.now()
      });
    }
  };

  const resolveRequest = async (id: string, approved: boolean) => {
    const reqDoc = doc(db, 'requests', id);
    const snap = await getDoc(reqDoc);
    if (!snap.exists()) return;
    const req = snap.data() as PendingRequest;

    if (approved && config && childProfile) {
      if (req.type === 'SADAQAH_DISCHARGE') {
        const dischargeAmount = childProfile.sadaqahBalance;
        await updateDoc(doc(db, 'users', childProfile.uid), {
          sadaqahBalance: 0
        });
        await addDoc(collection(db, 'transactions'), {
          userId: childProfile.uid,
          familyCode: childProfile.familyCode,
          type: 'SADAQAH_GIVEN',
          amount: dischargeAmount,
          note: 'Charity Gift Confirmed',
          timestamp: Date.now()
        });
      } else if (req.type === 'TASK_COMPLETION' && req.amount) {
        const updated = applyIncomeToUser(childProfile, req.amount, config);
        await updateDoc(doc(db, 'users', childProfile.uid), {
          walletBalance: updated.walletBalance,
          sadaqahBalance: updated.sadaqahBalance,
          savingsBalance: updated.savingsBalance,
          streakDays: (childProfile.streakDays || 0) + 1
        });
        await addDoc(collection(db, 'transactions'), {
          userId: childProfile.uid,
          familyCode: childProfile.familyCode,
          type: 'ALLOWANCE',
          amount: req.amount,
          note: `Task: ${req.title}`,
          timestamp: Date.now(),
          splits: calculateSplits(req.amount, config)
        });
      } else if (req.type === 'WITHDRAWAL' && req.amount) {
        await updateDoc(doc(db, 'users', childProfile.uid), {
          savingsBalance: Math.max(0, childProfile.savingsBalance - req.amount)
        });
        await addDoc(collection(db, 'transactions'), {
          userId: childProfile.uid,
          familyCode: childProfile.familyCode,
          type: 'WITHDRAWAL',
          amount: req.amount,
          note: req.description,
          timestamp: Date.now()
        });
      }
    }
    await deleteDoc(reqDoc);
  };

  const login = async ({ identifier, role }: any) => {
    // Demo login logic as actual auth isn't provided in snippets
    console.log(`Logging in as ${role}: ${identifier}`);
  };

  const signUpParent = async (data: any) => {
    console.log("Signing up parent", data);
  };

  const signUpChild = async (data: any) => {
    console.log("Signing up child", data);
  };

  const logout = () => {
    auth.signOut();
    setCurrentUser(null);
  };

  const updateConfig = async (newConfig: Partial<FamilyConfig>) => {
    if (config) {
      await updateDoc(doc(db, 'family_configs', config.familyCode), newConfig);
    }
  };

  const updateChildProfile = async (newProfile: Partial<UserProfile>) => {
    if (childProfile) {
      await updateDoc(doc(db, 'users', childProfile.uid), newProfile);
    }
  };

  const addPendingRequest = async (req: Omit<PendingRequest, 'id' | 'timestamp' | 'familyCode'>) => {
    if (currentUser) {
      await addDoc(collection(db, 'requests'), {
        ...req,
        familyCode: currentUser.familyCode,
        timestamp: Date.now()
      });
    }
  };

  return (
    <FamilyContext.Provider value={{ 
      config, childProfile, currentUser, pendingRequests, transactions,
      login, signUpParent, signUpChild, logout, updateConfig, 
      updateChildProfile, addPendingRequest, resolveRequest, 
      processExternalIncome, grantBarakahBonus, isLoading 
    }}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) throw new Error('useFamily must be used within a FamilyProvider');
  return context;
};
