import {getAuth, GoogleAuthProvider} from "firebase/auth"
import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY ,
  authDomain: "loginvirtualcourses-b9b5e.firebaseapp.com",
  projectId: "loginvirtualcourses-b9b5e",
  storageBucket: "loginvirtualcourses-b9b5e.firebasestorage.app",
  messagingSenderId: "552628997183",
  appId: "1:552628997183:web:9df1a42d06d9cee3e77c8a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
export {auth,provider}




