import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDocFromServer,
  collection, 
  onSnapshot, 
  deleteDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId as second argument
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Test connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase configuration offline check:', error.message);
    }
  }
}

// Error handling types and helper as required by the Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Mutex to prevent concurrent popup requests that cause "INTERNAL ASSERTION FAILED: Pending promise was never set"
let isAuthInProgress = false;

// Google OAuth Sign In
export async function signInWithGoogle(): Promise<{ user: User | null; error?: string }> {
  if (isAuthInProgress) {
    return { user: null, error: 'in_progress' };
  }

  isAuthInProgress = true;

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userRef, {
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'CHROS User',
          photoURL: user.photoURL || '',
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }
    }
    return { user };
  } catch (error: any) {
    const code = error?.code;
    const msg = error?.message || String(error);

    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return { user: null };
    }

    if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
      console.warn('[CHROS Auth] Browser popup blocked. Prompting user to allow popups in browser.');
      return { user: null, error: 'popup-blocked' };
    }

    if (msg.includes('Pending promise was never set')) {
      console.warn('[CHROS Auth] Intercepted internal popup state reset.');
      return { user: null, error: 'pending-promise' };
    }

    console.warn('[CHROS Auth] Google sign-in note:', msg);
    return { user: null, error: msg };
  } finally {
    // Release the mutex after a short debounce to allow Firebase Auth internal state to settle
    setTimeout(() => {
      isAuthInProgress = false;
    }, 600);
  }
}

// Sign Out
export async function logOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// Sync Search History to Firestore for authenticated user
export async function syncHistoryItemToFirestore(userId: string, item: {
  id: string;
  query: string;
  category: string;
  resultsCount: number;
  timestamp: number;
}) {
  const path = `users/${userId}/history/${item.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'history', item.id), {
      id: item.id,
      userId,
      query: item.query,
      category: item.category,
      resultsCount: item.resultsCount,
      timestamp: item.timestamp,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Save/Bookmark search result
export async function saveResultToFirestore(userId: string, result: {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  query?: string;
  timestamp: number;
}) {
  const path = `users/${userId}/saved/${result.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'saved', result.id), {
      id: result.id,
      userId,
      title: result.title,
      url: result.url,
      domain: result.domain,
      snippet: result.snippet || '',
      query: result.query || '',
      timestamp: result.timestamp,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Delete saved result
export async function deleteSavedResultFromFirestore(userId: string, savedId: string) {
  const path = `users/${userId}/saved/${savedId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'saved', savedId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
