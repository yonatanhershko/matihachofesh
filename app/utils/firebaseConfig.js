// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDDIXySz2BlQtYyQJzu4NiNOTyOViB4bjA",
  authDomain: "mati-hachofeh.firebaseapp.com",
  projectId: "mati-hachofeh",
  storageBucket: "mati-hachofeh.firebasestorage.app",
  messagingSenderId: "56246644326",
  appId: "1:56246644326:web:1a364e81c56a602eb747a7",
  measurementId: "G-YRJBX19F5V",
  databaseURL: "https://mati-hachofeh-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics may not work properly in Expo development mode, but will work in production
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn("Firebase analytics initialization failed:", error.message);
}

// Initialize Realtime Database
const database = getDatabase(app);

// Export Firebase instances
export { app, database, analytics, firebaseConfig as default };
