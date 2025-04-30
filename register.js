import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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

document.getElementById("register-btn").addEventListener("click", async () => {
  const id = document.getElementById("register-id").value;
  const password = document.getElementById("register-password").value;
  const errorMsg = document.getElementById("register-error");

  if (id.length < 5 || password.length < 8) {
    errorMsg.textContent = "IDは5文字以上、パスワードは8文字以上にしてください。";
    return;
  }

  const email = id + "@makoto.com"; // 仮のメールとして扱う

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Firestore に初期データを登録（1000マコ）
    await setDoc(doc(db, "users", uid), {
      chips: 1000,
      lastBonusStage: null,
      createdAt: new Date()
    });

    window.location.href = "login.html";
  } catch (error) {
    errorMsg.textContent = "登録に失敗しました：" + error.message;
  }
});
