// src/services/TransactionService.js

/**
 * Calculates the split of an amount based on family configuration.
 * @param {number} amount - The total income amount
 * @param {object} config - The family configuration object containing split percentages
 */
export const calculateSplits = (amount, config) => {
  // Ensure we have valid numbers, default to 0 if missing
  const sadaqahSplit = config?.sadaqahSplit || 0;
  const savingsSplit = config?.savingsSplit || 0;

  const charity = amount * (sadaqahSplit / 100);
  const savings = amount * (savingsSplit / 100);
  
  // The remainder goes to the wallet
  const wallet = amount - charity - savings;

  return { charity, savings, wallet };
};

/**
 * Updates a user profile object with the new income splits.
 * @param {object} user - The current user profile
 * @param {number} amount - The income amount to add
 * @param {object} config - The family configuration
 */
export const applyIncomeToUser = (user, amount, config) => {
  const { charity, savings, wallet } = calculateSplits(amount, config);
  
  return {
    ...user,
    walletBalance: (user.walletBalance || 0) + wallet,
    sadaqahBalance: (user.sadaqahBalance || 0) + charity,
    savingsBalance: (user.savingsBalance || 0) + savings,
  };
};