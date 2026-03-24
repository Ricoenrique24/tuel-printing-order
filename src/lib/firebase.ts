import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDXHonZ72_NXP63V7YblQbpDCsSLZUrEJc",
  authDomain: "tuel-printing.firebaseapp.com",
  projectId: "tuel-printing",
  storageBucket: "tuel-printing.firebasestorage.app",
  messagingSenderId: "967509301476",
  appId: "1:967509301476:web:d504454c14244e99dd74f1"
};

// Initialize Firebase
let app;
if (getApps().length > 0) {
  app = getApp();
} else {
  app = initializeApp(firebaseConfig);
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Debug: Log active project ID in dev mode
if (process.env.NODE_ENV === "development") {
  console.log("Firebase App Initialized for Project:", firebaseConfig.projectId);
}

export { app, auth, db, storage };

