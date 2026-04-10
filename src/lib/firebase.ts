import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCS4FBR3P0LwU0-3ok_lVVHFhYeMGjJZBQ",
  authDomain: "mundodasbebidas2026.firebaseapp.com",
  projectId: "mundodasbebidas2026",
  storageBucket: "mundodasbebidas2026.firebasestorage.app",
  messagingSenderId: "481383186337",
  appId: "1:481383186337:web:fcfadafc515e058172d5e0",
  measurementId: "G-D72XQFN0J2"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Analytics (Safe for SSR)
const analytics = typeof window !== 'undefined' ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;

export { app, auth, analytics };

