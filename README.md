# BudgetBee: Halal Edition 🐝

BudgetBee is a specialized family finance application designed to instill Islamic financial principles in children through real-time feedback, automated splitting, and AI-powered mindfulness.

## 🌟 Core Philosophy: Barakah & Growth

The app operates on the principle of *Barakah* (blessing) — where money is seen as a tool for growth and charity, rather than just consumption.

### Key Features

1.  **Automated Halal Splitter**: Every dollar earned is automatically divided into three jars:
    *   **Sadaqah (Charity)**: Purifying the wealth.
    *   **Locked Savings**: Building long-term stability.
    *   **Spendable Wallet**: Reward for hard work.
2.  **AI Niyat Auditor**: Powered by Gemini 3, children must state their *Niyat* (intention) before spending savings. The AI provides gentle wisdom on whether the purchase aligns with mindful spending.
3.  **Vision Verification**: Tasks are verified via real-time image analysis using Gemini 3 Flash. No more arguments about whether a room is "clean enough."
4.  **Growth Garden Visuals**: The UI evolves from a seedling to a fruitful tree as the child's savings balance increases.
5.  **Master App Lock**: Parents can freeze all activity during prayer times or study hours.

## 🛠 Tech Stack

*   **Frontend**: React / React Native (Web Compatibility).
*   **Intelligence**: Google Gemini API (`gemini-3-flash-preview`) for vision and text reasoning.
*   **Database**: Firebase Firestore for real-time synchronization.
*   **Icons**: FontAwesome 6.

## 📂 File-by-File Analysis

### Core Configuration & Metadata
*   **`metadata.json`**: Requests **camera** permissions for the Vision AI task verification and defines the app's identity.
*   **`index.html`**: Entry point. Loads external dependencies like **FontAwesome** and **QRCode.js**.
*   **`firebaseConfig.ts`**: Initializes the connection to Firebase for real-time updates and user sessions.
*   **`aiConfig.ts`**: Configures the **Gemini 3** client using `process.env.API_KEY`.

### Data Models & Logic
*   **`types.ts`**: The "source of truth" for data structures (Profiles, Configs, Transactions).
*   **`constants.ts`**: Defines the "Bee" brand palette and contains `WISDOM_QUOTES` (Hadith-inspired advice).
*   **`services/TransactionService.ts`**: The "Halal Splitter" logic for calculating Sadaqah, Savings, and Wallet distributions.
*   **`services/geminiService.ts`**: Interfaces with Gemini to analyze intentions (`checkNiyat`) and verify task completion photos (`verifyTaskImage`).

### State & Navigation
*   **`contexts/FamilyContext.tsx`**: The heart of the app. Synchronizes Parent and Child devices in real-time using Firebase `onSnapshot`.
*   **`App.tsx`**: Main controller handling the "Harvesting Barakah" loading state and view switching.

### UI Screens (Cross-Platform)
*   **`screens/LoginScreen.tsx`**: Portal for Parents (Email/Google) and Children (Username + Family Code).
*   **`screens/ChildDashboard.tsx`**: The child's "Garden" featuring growth visuals, jar balances, and action buttons for AI tasks.
*   **`screens/ParentDashboard.tsx`**: The "Control Tower" for reviewing AI-scored tasks, approving withdrawals, and granting bonuses.
*   **`screens/ParentSettings.tsx`**: Configuration area for splitting percentages, allowance amounts, and the Master App Lock.

## 🔐 Setup

1. Ensure `process.env.API_KEY` is configured for the Gemini SDK.
2. The app uses Firebase for real-time syncing between Parent and Child.
3. Use the **Family Access Code** generated in the Parent Dashboard to link Child accounts.

## 📜 Ethical Guidelines
BudgetBee encourages "Wasatiyyah" (moderation) in spending and highlights that "Wealth does not decrease by giving in charity."