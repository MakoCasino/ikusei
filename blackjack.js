import { auth, db } from './firebase-init.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

let userId, currentChips = 0, betAmount = 1;
let deck = [], playerHand = [], dealerHand = [];

const chipCountEl = document.getElementById("chip-count");
const betInput = document.getElementById("bet");
const startBtn = document.getElementById("start-btn");
const hitBtn = document.getElementById("hit-btn");
const standBtn = document.getElementById("stand-btn");
const resultEl = document.getElementById("result");
const winInfoEl = document.getElementById("win-info");
const dealerCards = document.getElementById("dealer-cards");
const playerCards = document.getElementById("player-cards");
const gameArea = document.getElementById("game-area");
const returnBtn = document.getElementById("return-btn");

const suits = ['♠', '♣', '♥', '♦'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck() {
  const newDeck = [];
  for (let suit of suits) {
    for (let value of values) {
      newDeck.push({ suit, value });
    }
  }
  return newDeck.sort(() => Math.random() - 0.5);
}

function getValue(hand) {
  let total = 0;
  let aceCount = 0;

  for (let card of hand) {
    if (card.value === 'A') {
      total += 11;
      aceCount++;
    } else if (['K', 'Q', 'J'].includes(card.value)) {
      total += 10;  // K, Q, J は 10 として計算
    } else {
      total += parseInt(card.value);
    }
  }

  while (total > 21 && aceCount > 0) {
    total -= 10; // Aが11の場合、21を超えたら1として扱う
    aceCount--;
  }

  return total;
}

function displayCards(container, hand) {
  container.innerHTML = '';
  for (let card of hand) {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = `${card.suit}${card.value}`;
    container.appendChild(div);
  }
}

function endGame(message, winAmount, isPush = false) {
  if (isPush) {
    // 引き分け時はベット額を戻す
    currentChips += betAmount;
  } else {
    currentChips += winAmount; // 勝った場合はベット額の2倍を加算
  }

  chipCountEl.textContent = `所持マコ: ${currentChips}マコ`;
  winInfoEl.textContent = `勝ちマコ: ${winAmount}マコ`;
  resultEl.textContent = message;

  updateDoc(doc(db, "users", userId), { chips: currentChips });

  hitBtn.disabled = true;
  standBtn.disabled = true;
  returnBtn.disabled = false;

  if (currentChips <= 0) {
    setTimeout(() => {
      // 0チップの場合、育成ページに移動してデータリセット
      resetData();
      window.location.href = "育成.html";
    }, 5000); // 5秒後に移動
  }
}

function checkWinner() {
  const playerScore = getValue(playerHand);
  const dealerScore = getValue(dealerHand);

  if (dealerScore > 21 || playerScore > dealerScore) {
    endGame("あなたの勝ち！", betAmount * 2); // 2倍の勝ち
  } else if (playerScore === dealerScore) {
    endGame("引き分け！", 0, true); // 引き分け時はベット額を戻す
  } else {
    endGame("負けました…", 0); // すでにマイナスの処理はしているので、追加なし
  }
}

function resetData() {
  // Firebaseのデータを初期状態にリセット
  updateDoc(doc(db, "users", userId), { chips: 1000 }); // 1000マコにリセット
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    userId = user.uid;
    const userDoc = await getDoc(doc(db, "users", userId));
    currentChips = userDoc.data().chips || 0;
    chipCountEl.textContent = `所持マコ: ${currentChips}マコ`;
  } else {
    window.location.href = "login.html";
  }
});

startBtn.addEventListener("click", () => {
  betAmount = parseInt(betInput.value);
  if (betAmount < 1 || betAmount > currentChips) {
    alert("正しいマコ数を入力してください");
    return;
  }

  currentChips -= betAmount;
  chipCountEl.textContent = `所持マコ: ${currentChips}マコ`; // 現在のチップ数を更新

  deck = createDeck();
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];

  displayCards(playerCards, playerHand);
  displayCards(dealerCards, [dealerHand[0], { suit: '?', value: '?' }]);

  gameArea.style.display = 'block';
  hitBtn.disabled = false;
  standBtn.disabled = false;
  returnBtn.disabled = true;
  resultEl.textContent = '';
  winInfoEl.textContent = '';
});

hitBtn.addEventListener("click", () => {
  playerHand.push(deck.pop());
  displayCards(playerCards, playerHand);
  const playerScore = getValue(playerHand);

  if (playerScore > 21) {
    endGame("バースト！負けました。", -betAmount); // バーストの場合、チップを減らす
  }
});

standBtn.addEventListener("click", () => {
  displayCards(dealerCards, dealerHand);
  while (getValue(dealerHand) < 17) {
    dealerHand.push(deck.pop());
    displayCards(dealerCards, dealerHand);
  }
  checkWinner(); // 勝敗をチェック
});

returnBtn.addEventListener("click", () => {
  window.location.href = "育成.html"; // 戻るボタンで育成画面に移動
});
