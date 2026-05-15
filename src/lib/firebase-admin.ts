import * as admin from 'firebase-admin';

// Initialize Firebase Admin if it hasn't been initialized already
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Bulletproof private key parsing
        privateKey: process.env.FIREBASE_PRIVATE_KEY 
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '').trim()
          : undefined,
      }),
    });
    console.log("Firebase Admin Initialized successfully.");
  } catch (error) {
    console.error("Firebase Admin Initialization Error", error);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

export { admin, db };
