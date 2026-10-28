import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Validate config before initialization
const isConfigValid = firebaseConfig && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('PASTE_YOUR');

// Initialize Firebase only once
const app = !getApps().length && isConfigValid ? initializeApp(firebaseConfig) : (getApps().length ? getApp() : null);

export const auth = app ? getAuth(app) : (null as any);
export const db = app ? getFirestore(app) : (null as any);
export const googleProvider = new GoogleAuthProvider();

// Custom claims are not supported in this environment, but we can use standard Google Auth
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
