// 既存のimportはそのまま

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
const dealerTotalEl = document.getElementById("dealer-total");
const playerTotalEl = document.getElementById("player-total");
const growthMsgEl = document.getElementById("growth-message");

let growthNotified = {
  5001: false,
  15001: false,
  50001: false,
  100001: false,
  1000000: false,
};

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
      total += 10;
    } else {
      total += parseInt(card.value);
    }
  }

  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount--;
  }

  return total;
}

function displayCards(container, hand, isDealer = false) {
  container.innerHTML = '';
  for (let i = 0; i < hand.length; i++) {
    const card = hand[i];
    const div = document.createElement("div");
    div.className = "card";
    if (isDealer && i === 1 && hitBtn.disabled === false) {
      div.textContent = '??';
    } else {
      div.textContent = `${card.suit}${card.value}`;
    }
    container.appendChild(div);
  }

  if (isDealer) {
    dealerTotalEl.textContent = hitBtn.disabled ? `ディーラー合計: ${getValue(hand)}` : `ディーラー合計: ?`;
  } else {
    playerTotalEl.textContent = `あなたの合計: ${getValue(hand)}`;
  }
}

function showGrowthNotification(chips) {
  const thresholds = [5001, 15001, 50001, 100001, 1000000];
  for (const threshold of thresholds) {
    if (chips >= threshold && !growthNotified[threshold]) {
      growthNotified[threshold] = true;
      if (threshold === 1000000) {
        growthMsgEl.textContent = "VIPまことになりました！";
      } else {
        growthMsgEl.textContent = "まことが成長しました！";
      }
      setTimeout(() => {
        growthMsgEl.textContent = '';
      }, 5000);
    }
  }
}

function endGame(message, winAmount, isPush = false) {
  if (isPush) {
    currentChips += betAmount;
  } else {
    currentChips += winAmount;
  }

  chipCountEl.textContent = `所持マコ: ${currentChips}マコ`;
  winInfoEl.textContent = `勝ちマコ: ${winAmount}マコ`;
  resultEl.textContent = message;
  showGrowthNotification(currentChips);
  updateDoc(doc(db, "users", userId), { chips: currentChips });

  hitBtn.disabled = true;
  standBtn.disabled = true;
  returnBtn.disabled = false;

  displayCards(dealerCards, dealerHand, true);

  if (currentChips <= 0) {
    resultEl.textContent = "0マコになりました。5秒後に育成画面へ移動します。";
    setTimeout(async () => {
      await resetData();
      window.location.href = "育成.html";
    }, 5000);
  }
}

function checkWinner() {
  const playerScore = getValue(playerHand);
  const dealerScore = getValue(dealerHand);

  if (dealerScore > 21 || playerScore > dealerScore) {
    endGame("あなたの勝ち！", betAmount * 2);
  } else if (playerScore === dealerScore) {
    endGame("引き分け！", 0, true);
  } else {
    endGame("負けました…", 0);
  }
}

function resetData() {
  return updateDoc(doc(db, "users", userId), { chips: 1000 });
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    userId = user.uid;
    const userDoc = await getDoc(doc(db, "users", userId));
    currentChips = userDoc.data().chips || 1000; // 初期所持マコを1000に設定
    chipCountEl.textContent = `所持マコ: ${currentChips}マコ`;
    showGrowthNotification(currentChips);
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
  chipCountEl.textContent = `所持マコ: ${currentChips}マコ`;

  deck = createDeck();
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];

  gameArea.style.display = 'block';
  hitBtn.disabled = false;
  standBtn.disabled = false;
  returnBtn.disabled = true;
  resultEl.textContent = '';
  winInfoEl.textContent = '';
  growthMsgEl.textContent = '';

  displayCards(playerCards, playerHand);
  displayCards(dealerCards, dealerHand, true);
});

hitBtn.addEventListener("click", () => {
  playerHand.push(deck.pop());
  displayCards(playerCards, playerHand);
  const playerScore = getValue(playerHand);

  if (playerScore > 21) {
    endGame("バースト！負けました。", -betAmount);
  }
});

standBtn.addEventListener("click", () => {
  while (getValue(dealerHand) < 17) {
    dealerHand.push(deck.pop());
  }
  displayCards(dealerCards, dealerHand, true);
  checkWinner();
});

returnBtn.addEventListener("click", () => {
  window.location.href = "育成.html";
});
