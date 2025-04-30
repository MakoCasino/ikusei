import { auth } from './firebase-init.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

document.getElementById("login-btn").addEventListener("click", async () => {
  const id = document.getElementById("login-id").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const errorEl = document.getElementById("login-error");

  const email = `${id}@makoto.com`; // 会員登録時と同じ形式にする

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // ログイン成功 → 育成画面へ移動
    window.location.href = "育成.html";
  } catch (error) {
    errorEl.textContent = "ログインに失敗しました：" + error.message;
  }
});
