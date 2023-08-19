import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getStorage, } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAcmSB8xFyJkmtCREOsGVVOpX7_BgQtAkk",
    authDomain: "authentication-login-adbe3.firebaseapp.com",
    projectId: "authentication-login-adbe3",
    storageBucket: "authentication-login-adbe3.appspot.com",
    messagingSenderId: "899637535399",
    appId: "1:899637535399:web:ebd40c5db3d511c50db182",
    measurementId: "G-J2ZKKZ5085",
  };
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth();
  const db = getFirestore(app);
  const storage = getStorage();

  export { app, db, auth, storage }