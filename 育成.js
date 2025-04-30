import { auth, db } from './firebase-init.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const chipDisplay = document.getElementById("chip-display");
const makotoImage = document.getElementById("makoto-image");
const makotoStatus = document.getElementById("makoto-status");

const determineStatus = (chips) => {
  if (chips === 0) return { label: "死亡まこと", image: "images/makoto0.png" };
  if (chips < 1000) return { label: "死にかけまこと", image: "images/makoto999.png" };
  if (chips <= 5000) return { label: "普通のまこと", image: "images/makoto5000.png" };
  if (chips <= 15000) return { label: "イキリまこと", image: "images/makoto15000.png" };
  if (chips <= 50000) return { label: "小金持ちまこと", image: "images/makoto50000.png" };
  if (chips <= 100000) return { label: "金持ちまこと", image: "images/makoto100000.png" };
  if (chips <= 300000) return { label: "前澤まこと", image: "images/makoto300000.png" };
  if (chips >= 1000000) return { label: "VIPまこと", image: "images/makoto1000000.png" };
  return { label: "謎まこと", image: "images/makoto0.png" };
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const chips = data.chips || 0;

      // 表示更新
      chipDisplay.textContent = `所持マコ: ${chips}マコ`;
      const status = determineStatus(chips);
      makotoImage.src = status.image;
      makotoStatus.textContent = status.label;
    } else {
      console.error("ユーザーデータが存在しません");
    }
  } else {
    window.location.href = "login.html";
  }
});

window.goToBlackjack = () => {
  window.location.href = "blackjack.html";
};
