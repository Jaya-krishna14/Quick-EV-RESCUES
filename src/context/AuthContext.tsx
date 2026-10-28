import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  User,
  getAdditionalUserInfo,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';

export type UserRole = 'user' | 'provider' | 'admin';

export interface UserProfile {
  userId: string;
  name: string;
  phoneNumber?: string;
  email: string;
  photoURL?: string;
  role?: UserRole;
  currentBattery?: number;
  maxRange?: number;
  vehicleModel?: string;
  updatedAt: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    // Handle redirect result
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Redirect sign-in success:', result.user.email);
        }
      } catch (err: any) {
        console.error('Redirect sign-in error:', err);
        setError(err.message);
      }
    };

    checkRedirect();

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous profile listener if it exists
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      setUser(firebaseUser);
      
      if (firebaseUser && db) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen for profile changes
        unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserProfile(snapshot.data() as UserProfile);
          } else {
            // Profile doesn't exist (likely Google login for first time)
            const initialProfile: UserProfile = {
              userId: firebaseUser.uid,
              name: firebaseUser.displayName || 'EV Rider',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || undefined,
              role: 'user',
              updatedAt: serverTimestamp()
            };
            setDoc(userDocRef, initialProfile).catch(console.error);
          }
          setLoading(false);
        }, (err) => {
          console.error('Profile snapshot error:', err);
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    }, (error) => {
      console.error('Auth state change error:', error);
      setError(error.message);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) {
      const msg = 'Firebase is not configured. Please add your credentials to src/firebase-applet-config.json';
      setError(msg);
      throw new Error(msg);
    }
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const additionalInfo = getAdditionalUserInfo(result);
      console.log('User signed in via popup:', result.user.email, additionalInfo);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      let message = 'Failed to sign in with Google.';
      
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Google sign-in was cancelled. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'The sign-in popup was blocked by your browser. Please allow popups or use redirect instead.';
      } else if (err.code === 'auth/unauthorized-domain') {
        message = 'This domain is not authorized for Google Sign-In in the Firebase console.';
      } else if (err.code === 'auth/configuration-not-found') {
        message = 'Firebase configuration is incomplete. Please check your config.';
      }
      
      setError(message);
      throw err;
    }
  };

  const signInWithGoogleRedirect = async () => {
    if (!auth) return;
    setError(null);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      console.error('Google redirect error:', err);
      setError('Failed to start Google sign-in redirect.');
      throw err;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (!auth) return;
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      let message = 'Failed to log in.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'The email address is badly formatted.';
      } else if (err.code === 'auth/user-disabled') {
        message = 'This account has been disabled.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed login attempts. Please try again later.';
      }
      setError(message);
      throw err;
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    if (!auth || !db) return;
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (result.user) {
        await updateProfile(result.user, { displayName: name });
        
        // Create initial profile doc in Firestore
        const userDocRef = doc(db, 'users', result.user.uid);
        const initialProfile: UserProfile = {
          userId: result.user.uid,
          name: name,
          email: email,
          role: 'user',
          updatedAt: serverTimestamp()
        };
        await setDoc(userDocRef, initialProfile);
        
        // State is handled by onSnapshot
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      let message = 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please login instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'The password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'The email address is badly formatted.';
      }
      setError(message);
      throw err;
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || !db) return;
    setError(null);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Also update Auth profile if name changed
      if (data.name) {
        await updateProfile(user, { displayName: data.name });
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError('Failed to update profile.');
      throw err;
    }
  };

  const setRole = async (role: UserRole) => {
    if (!user || !db) return;
    setError(null);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        role,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err: any) {
      console.error('Set role error:', err);
      setError('Failed to update role.');
      throw err;
    }
  };

  const logout = async () => {
    if (!auth) return;
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Logout error:', err);
      setError('Failed to log out.');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, signInWithGoogleRedirect, loginWithEmail, registerWithEmail, updateUserProfile, setRole, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
