import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export type RequestStatus = 'Pending' | 'Accepted' | 'Provider on the Way' | 'Service Started' | 'Completed';

export interface RescueRequest {
  id: string;
  userId: string;
  type: 'Charging' | 'Workshop';
  vehicleType: string;
  location: string;
  problem: string;
  batteryLevel?: string;
  instructions?: string;
  provider: {
    name: string;
    distance: string;
    fee: string;
  };
  status: RequestStatus;
  rating?: number;
  review?: string;
  lat?: number;
  lng?: number;
  workerLocation?: { lat: number; lng: number };
  createdAt: any;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useRequests() {
  const [requests, setRequests] = useState<RescueRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !db) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const path = 'requests';
    const q = query(
      collection(db, path), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newRequests = snapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
      } as RescueRequest));
      setRequests(newRequests);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const addRequest = async (request: Omit<RescueRequest, 'userId' | 'createdAt'>) => {
    if (!user || !db) return;
    
    const path = 'requests';
    const docRef = doc(db, path, request.id);
    const fullRequest = {
      ...request,
      userId: user.uid,
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(docRef, fullRequest);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${path}/${request.id}`);
    }
  };

  const updateRequestStatus = async (id: string, status: RequestStatus) => {
    if (!db) return;
    const path = 'requests';
    const docRef = doc(db, path, id);
    try {
      await updateDoc(docRef, { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${path}/${id}`);
    }
  };

  const deleteRequest = async (id: string) => {
    if (!db) return;
    const path = 'requests';
    const docRef = doc(db, path, id);
    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
    }
  };

  const addRequestReview = async (id: string, rating: number, review: string) => {
    if (!db) return;
    const path = 'requests';
    const docRef = doc(db, path, id);
    try {
      await updateDoc(docRef, { rating, review });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${path}/${id}`);
    }
  };

  const updateWorkerLocation = async (id: string, location: { lat: number; lng: number }) => {
    if (!db) return;
    const path = 'requests';
    const docRef = doc(db, path, id);
    try {
      await updateDoc(docRef, { workerLocation: location });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${path}/${id}`);
    }
  };

  return {
    requests,
    loading,
    addRequest,
    updateRequestStatus,
    updateWorkerLocation,
    addRequestReview,
    deleteRequest
  };
}
