// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDR2yB8Rj48CW_FsvQWbzszzVqO8g2ZkGA",
  authDomain: "makoto-casi.firebaseapp.com",
  projectId: "makoto-casi",
  storageBucket: "makoto-casi.firebasestorage.app",
  messagingSenderId: "288373107326",
  appId: "1:288373107326:web:9c5c6279611c46438ec62f",
  measurementId: "G-SJ6KF9L3N7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
