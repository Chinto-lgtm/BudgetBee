
export type UserRole = 'PARENT' | 'CHILD';

export interface FamilyConfig {
  id: string;
  adminId: string;
  familyCode: string;
  sadaqahSplit: number;
  savingsSplit: number;
  allowanceAmount: number;
  barakahThreshold: number;
  barakahBonusAmount: number;
  isAppFrozen: boolean;
}

export interface UserProfile {
  uid: string;
  role: UserRole;
  displayName: string;
  username?: string;
  email?: string;
  familyCode: string;
  walletBalance: number;
  sadaqahBalance: number;
  savingsBalance: number;
  streakDays: number;
}

export type TransactionType = 'INCOME_SPLIT' | 'SADAQAH_GIVEN' | 'WITHDRAWAL' | 'BONUS' | 'ALLOWANCE';

export interface Transaction {
  id: string;
  userId: string;
  familyCode: string;
  type: TransactionType;
  amount: number;
  note: string;
  timestamp: number;
  splits?: {
    sadaqah: number;
    savings: number;
    wallet: number;
  };
}

export type RequestType = 'WITHDRAWAL' | 'TASK_COMPLETION' | 'SADAQAH_DISCHARGE';

export interface PendingRequest {
  id: string;
  userId: string;
  familyCode: string;
  type: RequestType;
  title: string;
  description: string;
  amount?: number;
  aiFeedback: string;
  aiScore?: number;
  timestamp: number;
  metadata?: any;
}
