import { auth } from '@/utils/firebase';
import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile, User } from 'firebase/auth';

export const observeAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const signUpWithEmail = async (name: string, email: string, password: string) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }
    return { success: true, user: cred.user, error: null };
  } catch (error) {
    return { success: false, user: null, error };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: cred.user, error: null };
  } catch (error) {
    return { success: false, user: null, error };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};

export const sendResetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};


