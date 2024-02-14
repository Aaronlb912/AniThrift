// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBm07IEdU_vL-Qw5V1n_a-ocUnNALiHUTg",
  authDomain: "anithrift-e77a9.firebaseapp.com",
  projectId: "anithrift-e77a9",
  storageBucket: "anithrift-e77a9.appspot.com",
  messagingSenderId: "1094057328928",
  appId: "1:1094057328928:web:98da67c646c7965fa15745",
  measurementId: "G-TV1DPFSM7S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
