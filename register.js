import { auth, db } from './firebase-init.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

document.getElementById("register-btn").addEventListener("click", async () => {
  const id = document.getElementById("register-id").value.trim();
  const password = document.getElementById("register-password").value.trim();
  const errorEl = document.getElementById("register-error");

  if (id.length < 5 || password.length < 8) {
    errorEl.textContent = "IDは5文字以上、パスワードは8文字以上にしてください。";
    return;
  }

  const email = `${id}@makoto.com`; // Firebase登録用の仮メールアドレス形式

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    // Firestoreに初期データを保存
    await setDoc(doc(db, "users", userId), {
      id: id,
      chips: 0,
      rewardFlags: {
        makoto15000: false,
        makoto50000: false,
        makoto100000: false,
        makoto300000: false
      }
    });

    // ログイン画面へ遷移
    window.location.href = "login.html";
  } catch (error) {
    errorEl.textContent = "登録に失敗しました：" + error.message;
  }
});
