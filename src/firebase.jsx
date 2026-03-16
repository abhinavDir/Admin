// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyArKOjuemzRkDFIAio4lhrdNrBuRl3Ar80",
  authDomain: "fusionxcanteen.firebaseapp.com",
  projectId: "fusionxcanteen",
  storageBucket: "fusionxcanteen.appspot.com", messagingSenderId: "379007831432",
  appId: "1:379007831432:web:36944b094266f38a45fe3d",
  measurementId: "G-4GL2Z8GPBH"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);