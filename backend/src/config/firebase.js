import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadServiceAccount() {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const localPath = path.resolve(__dirname, '../../firebase-service-account.json');

  const candidates = [envPath, localPath].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(p)) {
      const content = JSON.parse(readFileSync(p, 'utf8'));
      if (content && content.project_id) return content;
    }
  }
  return null;
}

const serviceAccount = loadServiceAccount();

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.firebasestorage.app`,
  });
} else if (process.env.FIREBASE_PROJECT_ID) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
  });
} else {
  throw new Error('No Firebase credentials found.');
}

export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage().bucket();
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;
export default admin;
