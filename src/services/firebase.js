import { auth, hasFirebaseConfig } from '../config/firebase.js';

function checkInit() {
  if (!hasFirebaseConfig || !auth) {
    throw new Error('Firebase not configured. Set VITE_FIREBASE_* env variables to enable auth.');
  }
}

export async function getCurrentUser() {
  if (!hasFirebaseConfig || !auth) return null;
  const { onAuthStateChanged } = await import('firebase/auth');
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => { unsub(); resolve(user); });
  });
}

export async function getIdToken(forceRefresh) {
  if (!hasFirebaseConfig || !auth || !auth.currentUser) return null;
  return auth.currentUser.getIdToken(!!forceRefresh);
}

export async function loginWithEmail(email, password) {
  checkInit();
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return { user: cred.user, idToken: await cred.user.getIdToken() };
}

export async function registerWithEmail(email, password) {
  checkInit();
  const { createUserWithEmailAndPassword, sendEmailVerification } = await import('firebase/auth');
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(cred.user);
  return { user: cred.user, idToken: await cred.user.getIdToken() };
}

export async function logoutUser() {
  if (!hasFirebaseConfig || !auth) return;
  const { signOut } = await import('firebase/auth');
  await signOut(auth);
}

export async function sendResetEmail(email) {
  checkInit();
  const { sendPasswordResetEmail } = await import('firebase/auth');
  await sendPasswordResetEmail(auth, email);
}

export async function resendVerification() {
  checkInit();
  const { sendEmailVerification } = await import('firebase/auth');
  const user = auth.currentUser;
  if (user && !user.emailVerified) {
    await sendEmailVerification(user);
  }
}

export function onAuthChange(callback) {
  if (!hasFirebaseConfig || !auth) { callback(null); return () => {}; }
  import('firebase/auth').then(({ onAuthStateChanged }) => {
    return onAuthStateChanged(auth, callback);
  });
  return () => {};
}

// ─── Google Sign-In (popup — works on localhost without emulator) ───

export async function signInWithGoogle() {
  checkInit();
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    return { user: result.user, idToken };
  } catch (err) {
    throw err;
  }
}

export async function getGoogleRedirectResult() {
  if (!hasFirebaseConfig || !auth) return null;
  const { GoogleAuthProvider, getRedirectResult } = await import('firebase/auth');
  try {
    const result = await getRedirectResult(auth);
    if (!result) return null;
    const idToken = await result.user.getIdToken();
    return { user: result.user, idToken };
  } catch (err) {
    console.error('Google redirect result error:', err);
    throw err;
  }
}
