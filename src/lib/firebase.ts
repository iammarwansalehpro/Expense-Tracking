import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBbfJEIkgGwopcLhQP39RhloBVYgaSFB8c",
  authDomain: "canvaai-database-project-99b7b.firebaseapp.com",
  databaseURL: "https://canvaai-database-project-99b7b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "canvaai-database-project-99b7b",
  storageBucket: "canvaai-database-project-99b7b.firebasestorage.app",
  messagingSenderId: "99229141071",
  appId: "1:99229141071:web:52196e96af2c67d76d423a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
