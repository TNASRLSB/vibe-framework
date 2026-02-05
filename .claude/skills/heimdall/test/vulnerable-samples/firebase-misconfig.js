/**
 * TEST FILE: Firebase Misconfiguration
 *
 * This file contains INTENTIONALLY VULNERABLE Firebase code for testing.
 *
 * Expected detections:
 * - FB-CFG-004: Service account in client
 * - FB-CFG-005: Admin SDK in client
 * - BAAS-001: Admin SDK patterns
 */

// ============================================
// CRITICAL: Admin SDK in Client Code
// ============================================

// FB-CFG-005: firebase-admin should NEVER be in client
import admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';

// FB-CFG-004: Service account credentials in code
const serviceAccount = {
  "type": "service_account",
  "project_id": "my-project",
  "private_key_id": "abc123",
  "private_key": "-----BEGIN PRIVATE KEY-----\nFAKE_KEY_FOR_TESTING\n-----END PRIVATE KEY-----",
  "client_email": "firebase-admin@my-project.iam.gserviceaccount.com"
};

// Initialize admin SDK (should only be on server!)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// ============================================
// CLIENT-SIDE FIREBASE
// ============================================

import { initializeApp as initClientApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyFAKE_API_KEY_FOR_TESTING",
  authDomain: "my-project.firebaseapp.com",
  projectId: "my-project",
  storageBucket: "my-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

const app = initClientApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ============================================
// INSECURE DATA ACCESS
// ============================================

// Reading data without proper security rules check
async function getAllDocuments(collectionName) {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => doc.data());
}

// Direct write without validation
async function createDocument(collectionName, data) {
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
}

export {
  getAllDocuments,
  createDocument,
  admin  // Exporting admin SDK!
};
