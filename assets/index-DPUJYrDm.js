var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _numbers, _winningNumbers, _bonusNumber;
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const DOM = {
  purchaseForm: document.getElementById("purchase-form"),
  purchaseButton: document.getElementById("purchase-button"),
  purchaseInput: document.getElementById("purchase-input"),
  result: document.getElementById("result"),
  systemMessage: document.getElementById("system-message"),
  winningInputs: document.querySelectorAll(".winning-number"),
  bonusInput: document.getElementById("bonusNumber"),
  divInputNumber: document.getElementById("number-input"),
  resultButton: document.getElementById("result-button"),
  modal: document.querySelector(".modal"),
  threeCount: document.getElementById("three-count"),
  fourCount: document.getElementById("four-count"),
  fiveCount: document.getElementById("five-count"),
  fiveCountWithBonus: document.getElementById("five-count-with-bonus"),
  sixCount: document.getElementById("six-count"),
  revenueContainer: document.getElementById("revenue-container")
};
const ERROR = Object.freeze({
  EMPTY_VALUE: "입력 값은 빈 값이 아니여야 해요.",
  NOT_POSITIVE_INTEGER: "입력 값은 양의 정수여야 해요",
  LOWER_THAN_MINIMUM_OF_PUCHASE_PRICE: "구입 금액은 1000원 이상이어야 해요.",
  NOT_RANGE_OF_WINNING_NUMBER: "당첨 번호는 1~45 사이여야 해요.",
  NOT_SAME_LENGTH_OF_WINNING_NUMBER: "당첨 번호는 6개여야 해요.",
  DUPLICATED_WINNING_NUMBER: "당첨 번호는 중복될 수 없어요.",
  DUPLICATED_BONUS_NUMBER: "보너스 번호는 당첨 번호와 중복될 수 없어요.",
  CHECK_REPLAY_GAME: "재시작 여부는 y 또는 n으로 입력해 주세요."
});
const LOTTO_SYSTEM = Object.freeze({
  MIN_PURCHASE_PRICE: 1e3,
  SIZE: Object.freeze({
    MAX_LOTTO_NUMBER: 45,
    MIN_LOTTO_NUMBER: 1,
    MAX_LENGTH: 6
  }),
  FIVE_WITH_BONUS_MATCH_IDX: 7,
  SIX_MATCH: 6,
  FIVE_WITH_BONUS_MATCH: 5.5,
  FIVE_MATCH: 5,
  FOUR_MATCH: 4,
  THREE_MATCH: 3
});
const PRIZE_OF_MATCH_COUNT = Object.freeze({
  [LOTTO_SYSTEM.SIX_MATCH]: 2e9,
  [LOTTO_SYSTEM.FIVE_WITH_BONUS_MATCH_IDX]: 3e7,
  [LOTTO_SYSTEM.FIVE_MATCH]: 15e5,
  [LOTTO_SYSTEM.FOUR_MATCH]: 5e4,
  [LOTTO_SYSTEM.THREE_MATCH]: 5e3
});
const hasEmptyString = (input) => input === "";
const isValueInteger = (input) => Number.isInteger(input);
const validatePurchasePrice = (input) => {
  const value = Number(input);
  if (hasEmptyString(input)) throw new Error(ERROR.EMPTY_VALUE);
  if (!isValueInteger(value)) throw new Error(ERROR.NOT_POSITIVE_INTEGER);
  if (value < LOTTO_SYSTEM.MIN_PURCHASE_PRICE) {
    throw new Error(ERROR.LOWER_THAN_MINIMUM_OF_PUCHASE_PRICE);
  }
};
const errorHandler = (message) => {
  alert(message);
};
const LottoGame = {
  purchasePrice: 0,
  lottos: [],
  bonusNumber: 0,
  winningNumbers: []
};
const WEB_OUTPUT = Object.freeze({
  PURCHASED_QUANTITY: (quantity) => `총 ${quantity}개를 구매하였습니다.`,
  MATCH_COUNT: (count) => `${count}개`,
  TOTAL_REVENUE: (revenue) => `당신의 총 수익률은 ${revenue}%입니다`
});
const showPurchaseResult = (quantity) => {
  DOM.result.innerHTML = "";
  const div = document.createElement("div");
  div.id = "quantity";
  div.textContent = WEB_OUTPUT.PURCHASED_QUANTITY(quantity);
  DOM.result.appendChild(div);
};
const showLottos = (lottos) => {
  const existingContainer = document.getElementById("lottoContainer");
  if (existingContainer) {
    existingContainer.remove();
  }
  const container = document.createElement("div");
  container.id = "lotto-container";
  lottos.forEach((lotto) => {
    container.appendChild(showLotto(lotto));
  });
  DOM.result.appendChild(container);
};
const showLotto = (lotto) => {
  const container = document.createElement("div");
  container.id = "lotto";
  const img = new Image();
  img.id = "lotto-image";
  img.src = "../../../images/lottoImage.png";
  img.alt = "lotto-image";
  const numbersDiv = document.createElement("div");
  numbersDiv.innerHTML = lotto.getNumbers().join(", ");
  container.appendChild(img);
  container.appendChild(numbersDiv);
  return container;
};
const showResultsModal = (matchCounts, revenue) => {
  DOM.threeCount.innerText = WEB_OUTPUT.MATCH_COUNT(matchCounts[LOTTO_SYSTEM.THREE_MATCH]);
  DOM.fourCount.innerText = WEB_OUTPUT.MATCH_COUNT(matchCounts[LOTTO_SYSTEM.FOUR_MATCH]);
  DOM.fiveCount.innerText = WEB_OUTPUT.MATCH_COUNT(matchCounts[LOTTO_SYSTEM.FIVE_MATCH]);
  DOM.fiveCountWithBonus.innerText = WEB_OUTPUT.MATCH_COUNT(matchCounts[LOTTO_SYSTEM.FIVE_WITH_BONUS_MATCH_IDX]);
  DOM.sixCount.innerText = WEB_OUTPUT.MATCH_COUNT(matchCounts[LOTTO_SYSTEM.SIX_MATCH]);
  DOM.revenueContainer.innerText = WEB_OUTPUT.TOTAL_REVENUE(revenue);
  DOM.modal.style.display = "flex";
};
const validateLottoNumbers = (lottoNumbers) => {
  if (!Array.isArray(lottoNumbers)) {
    lottoNumbers = [lottoNumbers];
  }
  lottoNumbers.forEach((value) => {
    const lottoNumber = Number(value);
    if (hasEmptyString(value)) throw new Error(ERROR.EMPTY_VALUE);
    if (!isValueInteger(lottoNumber)) throw new Error(ERROR.NOT_POSITIVE_INTEGER);
    if (!isInRangeOfLottoNumber(lottoNumber)) throw new Error(ERROR.NOT_RANGE_OF_WINNING_NUMBER);
  });
};
const isInRangeOfLottoNumber = (input) => input >= LOTTO_SYSTEM.SIZE.MIN_LOTTO_NUMBER && input <= LOTTO_SYSTEM.SIZE.MAX_LOTTO_NUMBER;
const validateWinningNumbers = (input) => {
  const winningNumbers = typeof input === "string" ? input.split(",") : input;
  const winningNumberSet = new Set(winningNumbers);
  if (winningNumbers.length !== LOTTO_SYSTEM.SIZE.MAX_LENGTH) {
    throw new Error(ERROR.NOT_SAME_LENGTH_OF_WINNING_NUMBER);
  }
  if (winningNumberSet.size !== LOTTO_SYSTEM.SIZE.MAX_LENGTH) {
    throw new Error(ERROR.DUPLICATED_WINNING_NUMBER);
  }
  validateLottoNumbers(winningNumbers);
};
const validateBonusNumber = (winningNumbers) => (input) => {
  const bonusNumber = Number(input);
  validateLottoNumbers(input);
  if (winningNumbers.includes(bonusNumber)) {
    throw new Error(ERROR.DUPLICATED_BONUS_NUMBER);
  }
};
class Lotto {
  constructor(numbers) {
    __privateAdd(this, _numbers);
    validateLottoNumbers(numbers);
    __privateSet(this, _numbers, numbers);
  }
  getNumbers() {
    return [...__privateGet(this, _numbers)];
  }
  includes(number) {
    return __privateGet(this, _numbers).includes(number);
  }
  getMatchingCount(winningNumbers) {
    return __privateGet(this, _numbers).filter((num) => winningNumbers.includes(num)).length;
  }
}
_numbers = new WeakMap();
const NUMBERS = Array.from({ length: LOTTO_SYSTEM.SIZE.MAX_LOTTO_NUMBER }, (_, index) => index + 1);
const generateLottos = (quantity) => {
  return Array.from({ length: quantity }, () => new Lotto(generateLotto()));
};
const generateLotto = () => {
  const shuffle = (arr) => {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  return shuffle(NUMBERS).slice(0, 6).sort((a, b) => a - b);
};
const disableWinningInputs = () => {
  DOM.bonusInput.disabled = true;
  DOM.bonusInput.style.cursor = "not-allowed";
  DOM.winningInputs.forEach((input) => {
    input.disabled = true;
    input.style.cursor = "not-allowed";
  });
};
const disablePurchaseInputs = () => {
  DOM.purchaseButton.disabled = true;
  DOM.purchaseButton.style.cursor = "not-allowed";
  DOM.purchaseInput.disabled = true;
  DOM.purchaseInput.style.cursor = "not-allowed";
};
const handleModalCloseClick = () => {
  DOM.modal.style.display = "none";
  document.body.style.overflow = "";
};
const handlePurchaseSubmit = (event) => {
  event.preventDefault();
  try {
    const purchasePrice = DOM.purchaseInput.value;
    validatePurchasePrice(purchasePrice);
    LottoGame.purchasePrice = purchasePrice;
    disablePurchaseInputs();
    purchaseLottos();
  } catch (error) {
    errorHandler(error);
  }
};
const purchaseLottos = () => {
  const quantity = Math.floor(LottoGame.purchasePrice / LOTTO_SYSTEM.MIN_PURCHASE_PRICE);
  showPurchaseResult(quantity);
  LottoGame.lottos = generateLottos(quantity);
  showLottos(LottoGame.lottos);
  DOM.systemMessage.style.display = "flex";
};
const handleWinningNumberInput = (index, value) => {
  LottoGame.winningNumbers[index] = Number(value);
};
const handleBonusNumberInput = (value) => {
  LottoGame.bonusNumber = Number(value);
};
const calculateRevenue = (matchCounts, purchasePrice) => {
  const totalRevenue = matchCounts.map((matchCount, idx) => ({ matchCount, idx })).filter(({ idx }) => idx >= LOTTO_SYSTEM.THREE_MATCH).reduce((acc, { matchCount, idx }) => acc + matchCount * calculateRevenueByMatch(idx), 0);
  return Number((totalRevenue / purchasePrice * 100).toFixed(1));
};
const calculateRevenueByMatch = (matchCount) => {
  return PRIZE_OF_MATCH_COUNT[matchCount] || 0;
};
const getWinningMatchCount = (lottos, winningLotto) => {
  return lottos.reduce(
    (matchCounts, lotto) => {
      const tmpMatch = lotto.getMatchingCount(winningLotto.getWinningNumbers());
      const match = tmpMatch === LOTTO_SYSTEM.FIVE_MATCH && lotto.includes(winningLotto.getBonusNumber()) ? LOTTO_SYSTEM.FIVE_WITH_BONUS_MATCH_IDX : tmpMatch;
      matchCounts[match]++;
      return matchCounts;
    },
    [0, 0, 0, 0, 0, 0, 0, 0]
  );
};
class WinningLotto {
  constructor(winningNumbers, bonusNumber) {
    __privateAdd(this, _winningNumbers);
    __privateAdd(this, _bonusNumber);
    __privateSet(this, _winningNumbers, new Lotto(winningNumbers));
    __privateSet(this, _bonusNumber, bonusNumber);
  }
  getBonusNumber() {
    return __privateGet(this, _bonusNumber);
  }
  getWinningNumbers() {
    return __privateGet(this, _winningNumbers).getNumbers();
  }
  getMatchingCount(lotto) {
    return __privateGet(this, _winningNumbers).getMatchingCount(lotto.getNumbers());
  }
}
_winningNumbers = new WeakMap();
_bonusNumber = new WeakMap();
const handleResultButtonClick = () => {
  try {
    validateWinningNumbers(LottoGame.winningNumbers);
    validateBonusNumber(LottoGame.winningNumbers)(LottoGame.bonusNumber);
    disableWinningInputs();
    const lottoNumbers = new WinningLotto(LottoGame.winningNumbers, LottoGame.bonusNumber);
    const matchCounts = getWinningMatchCount(LottoGame.lottos, lottoNumbers);
    const revenue = calculateRevenue(matchCounts, LottoGame.purchasePrice);
    showResultsModal(matchCounts, revenue);
  } catch (error) {
    errorHandler(error);
  }
};
const handleRestartButtonClick = () => {
  location.reload();
};
DOM.purchaseForm.addEventListener("submit", handlePurchaseSubmit);
DOM.winningInputs.forEach((input, index) => {
  input.addEventListener("input", (event) => {
    handleWinningNumberInput(index, event.target.value);
  });
});
DOM.bonusInput.addEventListener("input", (event) => {
  handleBonusNumberInput(event.target.value);
});
document.addEventListener("click", (event) => {
  if (event.target && event.target.id === "result-button") handleResultButtonClick();
  if (event.target && event.target.classList.contains("modal-close")) handleModalCloseClick();
  if (event.target && event.target.id === "restart-button") handleRestartButtonClick();
});
