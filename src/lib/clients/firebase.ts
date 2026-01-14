import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase configuration
if (typeof window !== "undefined") {
  const missingVars = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value || value.includes("your_"))
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error(
      "⚠️ Firebase configuration missing! Please set these environment variables:",
      missingVars
    );
    console.error(
      "📖 See FIREBASE_SETUP.md for instructions"
    );
  }
}

// Initialize Firebase
let app;
let db: ReturnType<typeof getFirestore> | undefined;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  if (typeof window !== "undefined") {
    console.error(
      "💡 Make sure you've created .env.local with your Firebase credentials"
    );
  }
  db = undefined;
}

export { app, db };

