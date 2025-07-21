import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';

const firebaseConfig = window.__firebase_config || {};
export const appId = window.__app_id || '';
const initialToken = window.__initial_auth_token || '';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export async function authenticate() {
  try {
    if (initialToken) {
      await signInWithCustomToken(auth, initialToken);
    } else {
      await signInAnonymously(auth);
    }
    return auth.currentUser?.uid;
  } catch (error) {
    console.error('Authentication error', error);
    throw error;
  }
}
