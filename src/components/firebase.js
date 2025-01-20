// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJTpBbPRg_ablYSg6MMWsd5zfXViKwFp4",
  authDomain: "resihub-bd446.firebaseapp.com",
  projectId: "resihub-bd446",
  storageBucket: "resihub-bd446.appspot.com",
  messagingSenderId: "24074216585",
  appId: "1:24074216585:web:dfe30e28c34fab5c345258"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const storage = getStorage(app);
export const db=getFirestore(app);
export default app;
