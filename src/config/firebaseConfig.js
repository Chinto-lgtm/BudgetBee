import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyAs-Example-Key", // ⚠️ REPLACE THIS WITH YOUR REAL KEY
  authDomain: "budgetbee-halal.firebaseapp.com",
  projectId: "budgetbee-halal",
  storageBucket: "budgetbee-halal.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);