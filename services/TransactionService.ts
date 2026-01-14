
import { FamilyConfig, UserProfile } from '../types';

export interface SplitResult {
  charity: number;
  savings: number;
  wallet: number;
}

export const calculateSplits = (amount: number, config: FamilyConfig): SplitResult => {
  const charity = amount * (config.sadaqahSplit / 100);
  const savings = amount * (config.savingsSplit / 100);
  const wallet = amount - charity - savings;

  return { charity, savings, wallet };
};

export const applyIncomeToUser = (user: UserProfile, amount: number, config: FamilyConfig): UserProfile => {
  const { charity, savings, wallet } = calculateSplits(amount, config);
  
  return {
    ...user,
    walletBalance: user.walletBalance + wallet,
    sadaqahBalance: user.sadaqahBalance + charity,
    savingsBalance: user.savingsBalance + savings,
  };
};
