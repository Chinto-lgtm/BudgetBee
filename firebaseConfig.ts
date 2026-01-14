
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

export const firebaseConfig = {
  apiKey: "AIzaSyAs-Example-Key", // These are handled by the environment in production
  authDomain: "budgetbee-halal.firebaseapp.com",
  projectId: "budgetbee-halal",
  storageBucket: "budgetbee-halal.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
