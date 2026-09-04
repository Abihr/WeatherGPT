// Firebase app initialization.
//
// This file is a placeholder wiring point. Replace the config below with
// your project's Firebase config (from the Firebase console) and, if you
// want the app to talk to real Firebase services instead of the mock data
// in `src/data/mockData.js`, flip `USE_FIREBASE` to true.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const USE_FIREBASE = false;

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

let app, auth, db;

if (USE_FIREBASE) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
