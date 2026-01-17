import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  collection, 
  query, 
  where,
  getDoc,
  deleteDoc,
  addDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Ensure these paths match your actual folder structure
import { db, auth } from '../config/firebaseConfig';
import { applyIncomeToUser, calculateSplits } from '../services/TransactionService';

const FamilyContext = createContext();

export const FamilyProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [childProfile, setChildProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Auth & Data Sync Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.data();
            setCurrentUser(userData);
            
            if (userData.familyCode) {
              // Listen to Global Family Config (Splits/Locks)
              onSnapshot(doc(db, 'family_configs', userData.familyCode), (cs) => {
                if (cs.exists()) setConfig(cs.data());
              });
              
              // Listen to Pending Requests
              const reqsQuery = query(collection(db, 'requests'), where('familyCode', '==', userData.familyCode));
              onSnapshot(reqsQuery, (rs) => {
                const r = [];
                rs.forEach(d => r.push({ ...d.data(), id: d.id }));
                setPendingRequests(r.sort((a, b) => b.timestamp - a.timestamp));
              });

              // Listen to Transaction Ledger
              const transQuery = query(
                collection(db, 'transactions'), 
                where('familyCode', '==', userData.familyCode)
              );
              onSnapshot(transQuery, (ts) => {
                const t = [];
                ts.forEach(d => t.push({ ...d.data(), id: d.id }));
                setTransactions(t.sort((a, b) => b.timestamp - a.timestamp));
              });

              // If Parent, also watch the Child's specific profile
              if (userData.role === 'PARENT') {
                const childrenQuery = query(collection(db, 'users'), where('familyCode', '==', userData.familyCode), where('role', '==', 'CHILD'));
                onSnapshot(childrenQuery, (snap) => {
                  if (!snap.empty) setChildProfile(snap.docs[0].data());
                });
              } else {
                // If Child, my profile is the current user
                setChildProfile(userData);
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

    return () => unsubscribeAuth();
  }, []);

  // 2. Financial Logic: Processing External Income
  const processExternalIncome = async (amount) => {
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

  // 3. Parental Logic: Granting Barakah Bonus
  const grantBarakahBonus = async () => {
    if (childProfile && config) {
      const bonus = config.barakahBonusAmount;
      await updateDoc(doc(db, 'users', childProfile.uid), {
        walletBalance: (childProfile.walletBalance || 0) + bonus
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

  // 4. Request Resolution (The core "Decision" logic)
  const resolveRequest = async (id, approved) => {
    const reqDoc = doc(db, 'requests', id);
    const snap = await getDoc(reqDoc);
    if (!snap.exists()) return;
    const req = snap.data();

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
          savingsBalance: Math.max(0, (childProfile.savingsBalance || 0) - req.amount)
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

  // 5. Utility Actions
  const logout = () => {
    auth.signOut();
    setCurrentUser(null);
  };

  const updateConfig = async (newConfig) => {
    if (config) {
      await updateDoc(doc(db, 'family_configs', config.familyCode), newConfig);
    }
  };

  const addPendingRequest = async (req) => {
    if (currentUser) {
      await addDoc(collection(db, 'requests'), {
        ...req,
        familyCode: currentUser.familyCode,
        timestamp: Date.now()
      });
    }
  };

  // Placeholders for Auth UI
  const login = async (creds) => console.log("Login logic goes here", creds);
  const signUpParent = async (data) => console.log("Parent Signup", data);
  const signUpChild = async (data) => console.log("Child Signup", data);

  return (
    <FamilyContext.Provider value={{ 
      config, childProfile, currentUser, pendingRequests, transactions,
      login, signUpParent, signUpChild, logout, updateConfig, 
      addPendingRequest, resolveRequest, 
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