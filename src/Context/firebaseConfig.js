// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC6GYGVUuthrKtymC5h2vjFSOmxDQ5TFmA",
    authDomain: "adstra-digital.firebaseapp.com",
    projectId: "adstra-digital",
    storageBucket: "adstra-digital.firebasestorage.app",
    messagingSenderId: "184165807631",
    appId: "1:184165807631:web:cf54d44bfc264e4901d57a",
    measurementId: "G-R6R2GZJSXZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
