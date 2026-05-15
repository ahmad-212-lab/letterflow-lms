import * as admin from 'firebase-admin';

let initializationError: string | null = null;

// Initialize Firebase Admin if it hasn't been initialized already
if (!admin.apps.length) {
  try {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error("Missing Firebase environment variables");
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Bulletproof private key parsing
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '').trim(),
      }),
    });
    console.log("Firebase Admin Initialized successfully.");
  } catch (error: any) {
    console.error("Firebase Admin Initialization Error", error);
    initializationError = error.message || "Unknown error";
  }
}

const db = admin.apps.length ? admin.firestore() : null;

export { admin, db, initializationError };
