/* ============================================================
   《名畫找碴王》Masterpiece Detective — 核心遊戲邏輯與關卡設定
   ============================================================ */

/**
 * 關卡集中設定區（使用標準化座標 0~1，對應右側修改版圖片）
 * 日後若更換圖片或擴充為多處差異，僅需調整此陣列即可。
 */
const LEVELS = [
  {
    id: 1,
    name: "第一關：藝術新手村",
    shortName: "藝術新手村",
    difficulty: "簡單",
    paintingTitle: "《戴珍珠耳環的少女》・維梅爾",
    timeLimit: 45,
    originalSrc: "assets/images/level1-original.jpg",
    modifiedSrc: "assets/images/level1-modified.webp",
    hintMessage: "Usagi 提示：仔細看看少女頭上包著的布巾顏色，和原圖一樣嗎？",
    differences: [
      {
        id: "l1-diff-1",
        x: 0.515,
        y: 0.265,
        radius: 0.145,
        label: "頭巾顏色由藍色變成紫色",
        hitZones: [
          { x: 0.46, y: 0.255, radius: 0.14 },
          { x: 0.61, y: 0.315, radius: 0.13 },
          { x: 0.865, y: 0.71, radius: 0.115 }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "第二關：藝術觀察家",
    shortName: "藝術觀察家",
    difficulty: "中等",
    paintingTitle: "《抱銀貂的女子》・達文西",
    timeLimit: 45,
    originalSrc: "assets/images/level2-original.jpg",
    modifiedSrc: "assets/images/level2-modified.webp",
    hintMessage: "Usagi 提示：看看畫中女子的脖子與胸前，是不是少了一樣飾品呢？",
    differences: [
      {
        id: "l2-diff-1",
        x: 0.48,
        y: 0.455,
        radius: 0.105,
        label: "女子脖子與胸前的黑色長項鍊不見了",
        hitZones: [
          { x: 0.485, y: 0.445, radius: 0.095 },
          { x: 0.385, y: 0.535, radius: 0.075 },
          { x: 0.535, y: 0.505, radius: 0.075 }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "第三關：名畫終極挑戰",
    shortName: "名畫終極挑戰",
    difficulty: "困難",
    paintingTitle: "《倒牛奶的女僕》・維梅爾",
    timeLimit: 45,
    originalSrc: "assets/images/level3-original.jpg",
    modifiedSrc: "assets/images/level3-modified.webp",
    hintMessage: "Usagi 提示：把視線移到房間右下角的地板附近，看看原本放了什麼東西？",
    differences: [
      {
        id: "l3-diff-1",
        x: 0.852,
        y: 0.875,
        radius: 0.105,
        label: "右下角地板上的暖腳木盒消失了",
        hitZones: [
          { x: 0.852, y: 0.875, radius: 0.105 }
        ]
      }
    ]
  }
];

/* ================= 遊戲狀態 ================= */
const state = {
  currentLevelIndex: 0,
  timeLeft: 45,
  timerId: null,
  foundIds: new Set(),
  wrongClicks: 0,
  hintsLeft: 1,
  hintUsed: false,
  isPlaying: false,
  isInspecting: false,
  soundEnabled: true,
  levelResults: [],
  toastTimerId: null,
  confettiRafId: null
};

/* ================= DOM 元素參照 ================= */
const dom = {
  screenHome: document.getElementById("screen-home"),
  screenGame: document.getElementById("screen-game"),
  screenFinal: document.getElementById("screen-final"),

  homeRuleText: document.getElementById("home-rule-text"),
  homeUsagi: document.getElementById("home-usagi"),
  gameUsagi: document.getElementById("game-usagi"),
  modalUsagi: document.getElementById("modal-usagi"),
  finalUsagi: document.getElementById("final-usagi"),

  btnStartGame: document.getElementById("btn-start-game"),
  btnBackHome: document.getElementById("btn-back-home"),
  btnHint: document.getElementById("btn-hint"),
  hintRemaining: document.getElementById("hint-remaining"),
  soundButtons: document.querySelectorAll(".sound-toggle-btn"),

  hudLevelStep: document.getElementById("hud-level-step"),
  hudLevelName: document.getElementById("hud-level-name"),
  hudDifficulty: document.getElementById("hud-difficulty"),
  hudTimerText: document.getElementById("hud-timer-text"),
  timerTrack: document.getElementById("timer-track"),
  timerFill: document.getElementById("timer-fill"),
  hudFoundCount: document.getElementById("hud-found-count"),

  inspectBar: document.getElementById("inspect-bar"),
  inspectBarText: document.getElementById("inspect-bar-text"),
  btnInspectNext: document.getElementById("btn-inspect-next"),

  paintingTitleOrig: document.getElementById("painting-title-orig"),
  paintingTitleMod: document.getElementById("painting-title-mod"),
  stageOriginal: document.getElementById("stage-original"),
  stageModified: document.getElementById("stage-modified"),
  cardModified: document.getElementById("card-modified"),
  imgOriginal: document.getElementById("img-original"),
  imgModified: document.getElementById("img-modified"),
  errOriginal: document.getElementById("err-original"),
  errModified: document.getElementById("err-modified"),
  markerLayer: document.getElementById("marker-layer"),

  levelIntroToast: document.getElementById("level-intro-toast"),
  toastLevelBadge: document.getElementById("toast-level-badge"),
  toastLevelTitle: document.getElementById("toast-level-title"),
  toastLevelDesc: document.getElementById("toast-level-desc"),
  curatorMessage: document.getElementById("curator-message"),

  modalBackdrop: document.getElementById("modal-level-result"),
  modalStars: document.getElementById("modal-stars"),
  modalTitle: document.getElementById("modal-title"),
  modalQuote: document.getElementById("modal-quote"),
  modalScorePanel: document.getElementById("modal-score-panel"),
  modalScoreTotal: document.getElementById("modal-score-total"),
  modalScoreFound: document.getElementById("modal-score-found"),
  modalScoreTime: document.getElementById("modal-score-time"),
  modalScoreAccuracy: document.getElementById("modal-score-accuracy"),
  diffSummaryHeading: document.getElementById("diff-summary-heading"),
  diffSummaryList: document.getElementById("diff-summary-list"),
  modalActions: document.getElementById("modal-actions"),

  confettiCanvas: document.getElementById("confetti-canvas"),
  finalRankBadge: document.getElementById("final-rank-badge"),
  finalUsagiComment: document.getElementById("final-usagi-comment"),
  finalTotalScore: document.getElementById("final-total-score"),
  finalTotalFound: document.getElementById("final-total-found"),
  finalTotalStars: document.getElementById("final-total-stars"),
  finalGallery: document.getElementById("final-gallery"),
  btnReplayAll: document.getElementById("btn-replay-all"),
  btnFinalHome: document.getElementById("btn-final-home")
};

/* ============================================================
   Web Audio API 輕快音效合成器（零外部素材依賴）
   ============================================================ */
const SoundFX = (() => {
  let ctx = null;

  function ensureContext() {
    if (!state.soundEnabled) return null;
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
      }
    }
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function tone(freq, startTime, duration, type = "sine", peakGain = 0.14) {
    const audio = ensureContext();
    if (!audio) return;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  return {
    playClick() {
      const audio = ensureContext();
      if (!audio) return;
      tone(660, audio.currentTime, 0.07, "triangle", 0.1);
    },
    playSuccess() {
      const audio = ensureContext();
      if (!audio) return;
      const now = audio.currentTime;
      tone(523.25, now, 0.12, "triangle", 0.14);
      tone(659.25, now + 0.08, 0.12, "triangle", 0.14);
      tone(783.99, now + 0.16, 0.22, "sine", 0.16);
    },
    playError() {
      const audio = ensureContext();
      if (!audio) return;
      const now = audio.currentTime;
      tone(240, now, 0.11, "sawtooth", 0.07);
      tone(190, now + 0.09, 0.14, "sawtooth", 0.06);
    },
    playHint() {
      const audio = ensureContext();
      if (!audio) return;
      const now = audio.currentTime;
      tone(740, now, 0.12, "sine", 0.12);
      tone(987.77, now + 0.1, 0.2, "sine", 0.13);
    },
    playLevelComplete() {
      const audio = ensureContext();
      if (!audio) return;
      const now = audio.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, idx) => {
        tone(n, now + idx * 0.09, 0.22, "triangle", 0.15);
      });
    },
    playVictory() {
      const audio = ensureContext();
      if (!audio) return;
      const now = audio.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 987.77, 1046.5];
      const delays = [0, 0.1, 0.2, 0.3, 0.44, 0.56];
      notes.forEach((n, idx) => {
        tone(n, now + delays[idx], 0.26, "triangle", 0.15);
      });
    }
  };
})();

/* ============================================================
   兔子館長 Usagi（純 SVG 角色繪製，支援多種表情）
   ============================================================ */
function renderUsagi(container, mood = "happy") {
  if (!container) return;

  const isCrown = mood === "crown";
  const isExcited = mood === "excited" || isCrown;
  const isEncourage = mood === "encourage";
  const isThinking = mood === "thinking";

  const eyesSvg = isExcited
    ? `
      <path d="M74 102 Q81 94 88 102" fill="none" stroke="#4B3222" stroke-width="4" stroke-linecap="round"/>
      <path d="M112 102 Q119 94 126 102" fill="none" stroke="#4B3222" stroke-width="4" stroke-linecap="round"/>
    `
    : isEncourage
    ? `
      <circle cx="81" cy="101" r="5" fill="#4B3222"/>
      <circle cx="119" cy="101" r="5" fill="#4B3222"/>
      <circle cx="83" cy="99" r="1.8" fill="#FFFFFF"/>
      <circle cx="121" cy="99" r="1.8" fill="#FFFFFF"/>
      <path d="M74 91 L87 94" stroke="#7A5236" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M126 91 L113 94" stroke="#7A5236" stroke-width="2.6" stroke-linecap="round"/>
    `
    : `
      <circle cx="81" cy="101" r="5.3" fill="#4B3222"/>
      <circle cx="119" cy="101" r="5.3" fill="#4B3222"/>
      <circle cx="83" cy="99" r="2" fill="#FFFFFF"/>
      <circle cx="121" cy="99" r="2" fill="#FFFFFF"/>
    `;

  const mouthSvg = isExcited
    ? `<path d="M92 114 Q100 125 108 114 Z" fill="#FF7B89" stroke="#4B3222" stroke-width="2.5" stroke-linejoin="round"/>`
    : isThinking
    ? `<circle cx="100" cy="116" r="3.5" fill="#FF8C98" stroke="#4B3222" stroke-width="2.2"/>`
    : isEncourage
    ? `<path d="M93 117 Q100 113 107 117" fill="none" stroke="#4B3222" stroke-width="2.8" stroke-linecap="round"/>`
    : `<path d="M91 114 Q96 120 100 114 Q104 120 109 114" fill="none" stroke="#4B3222" stroke-width="2.8" stroke-linecap="round"/>`;

  const hatOrCrownSvg = isCrown
    ? `
      <!-- 金色皇冠 -->
      <path d="M70 58 L76 32 L92 46 L100 26 L108 46 L124 32 L130 58 Z"
            fill="#FFD447" stroke="#A66E12" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="100" cy="24" r="4.5" fill="#FF8C69" stroke="#A66E12" stroke-width="2"/>
      <circle cx="75" cy="30" r="3.5" fill="#7CC6FE" stroke="#A66E12" stroke-width="2"/>
      <circle cx="125" cy="30" r="3.5" fill="#B99DF7" stroke="#A66E12" stroke-width="2"/>
    `
    : `
      <!-- 棕色偵探帽 -->
      <ellipse cx="100" cy="60" rx="44" ry="11" fill="#8D552B" stroke="#5A3316" stroke-width="3"/>
      <path d="M68 58 C68 35, 132 35, 132 58 Z" fill="#A46B3E" stroke="#5A3316" stroke-width="3"/>
      <path d="M70 53 Q100 59 130 53" fill="none" stroke="#FFE07D" stroke-width="5" stroke-linecap="round"/>
    `;

  const svgMarkup = `
    <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
      <!-- 兔耳朵 -->
      <ellipse cx="74" cy="40" rx="13" ry="30" transform="rotate(-12 74 40)" fill="#FFFFFF" stroke="#6E472B" stroke-width="3.2"/>
      <ellipse cx="74" cy="42" rx="6.5" ry="18" transform="rotate(-12 74 42)" fill="#FFD0D6"/>
      <ellipse cx="126" cy="40" rx="13" ry="30" transform="rotate(12 126 40)" fill="#FFFFFF" stroke="#6E472B" stroke-width="3.2"/>
      <ellipse cx="126" cy="42" rx="6.5" ry="18" transform="rotate(12 126 42)" fill="#FFD0D6"/>

      <!-- 圓滾滾身體 -->
      <ellipse cx="100" cy="158" rx="42" ry="30" fill="#FFFFFF" stroke="#6E472B" stroke-width="3.2"/>
      <!-- 小背心 / 領結 -->
      <path d="M75 142 Q100 156 125 142 L120 175 Q100 182 80 175 Z" fill="#FF9A6C" stroke="#6E472B" stroke-width="2.5"/>
      <polygon points="100,145 89,139 89,151" fill="#FFE07D" stroke="#6E472B" stroke-width="2"/>
      <polygon points="100,145 111,139 111,151" fill="#FFE07D" stroke="#6E472B" stroke-width="2"/>
      <circle cx="100" cy="145" r="4" fill="#FFD04F" stroke="#6E472B" stroke-width="2"/>

      <!-- 圓圓頭部 -->
      <ellipse cx="100" cy="100" rx="48" ry="42" fill="#FFFFFF" stroke="#6E472B" stroke-width="3.2"/>

      ${hatOrCrownSvg}

      <!-- 腮紅與五官 -->
      <ellipse cx="69" cy="111" rx="8" ry="5" fill="#FFB5BF" opacity="0.85"/>
      <ellipse cx="131" cy="111" rx="8" ry="5" fill="#FFB5BF" opacity="0.85"/>
      ${eyesSvg}
      <ellipse cx="100" cy="108" rx="3.8" ry="2.6" fill="#FF8C98"/>
      ${mouthSvg}

      <!-- 小手與放大鏡 -->
      <circle cx="62" cy="150" r="10" fill="#FFFFFF" stroke="#6E472B" stroke-width="3"/>
      <g transform="translate(128, 126) rotate(18)">
        <rect x="13" y="25" width="7" height="24" rx="3.5" fill="#A46B3E" stroke="#5A3316" stroke-width="2.5"/>
        <circle cx="16.5" cy="14" r="15" fill="#BAE2FF" fill-opacity="0.72" stroke="#8D552B" stroke-width="4.5"/>
        <path d="M9 9 Q13 5 18 7" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
      </g>
      <circle cx="136" cy="152" r="10" fill="#FFFFFF" stroke="#6E472B" stroke-width="3"/>
    </svg>
  `;

  container.innerHTML = svgMarkup;
}

/* ============================================================
   工具函式：計算 object-fit: contain 實際圖片顯示區域
   確保不論視窗縮放、裝置比例或兩圖長寬比不同，點擊與標記永不偏移
   ============================================================ */
function getContainedImageRect(imgEl, stageEl) {
  const stageRect = stageEl.getBoundingClientRect();
  const natW = imgEl.naturalWidth;
  const natH = imgEl.naturalHeight;

  if (!natW || !natH || !stageRect.width || !stageRect.height) {
    return null;
  }

  const imgRatio = natW / natH;
  const boxRatio = stageRect.width / stageRect.height;

  let renderW = stageRect.width;
  let renderH = stageRect.height;
  let offsetX = 0;
  let offsetY = 0;

  if (boxRatio > imgRatio) {
    // 左右留白
    renderH = stageRect.height;
    renderW = renderH * imgRatio;
    offsetX = (stageRect.width - renderW) / 2;
  } else {
    // 上下留白
    renderW = stageRect.width;
    renderH = renderW / imgRatio;
    offsetY = (stageRect.height - renderH) / 2;
  }

  return {
    offsetX,
    offsetY,
    renderW,
    renderH,
    clientLeft: stageRect.left + offsetX,
    clientTop: stageRect.top + offsetY
  };
}

function syncMarkerLayer() {
  const rect = getContainedImageRect(dom.imgModified, dom.stageModified);
  if (!rect) return;
  dom.markerLayer.style.left = `${rect.offsetX}px`;
  dom.markerLayer.style.top = `${rect.offsetY}px`;
  dom.markerLayer.style.width = `${rect.renderW}px`;
  dom.markerLayer.style.height = `${rect.renderH}px`;
}

/* ============================================================
   畫面切換與音效開關
   ============================================================ */
function showScreen(target) {
  [dom.screenHome, dom.screenGame, dom.screenFinal].forEach((el) => {
    el.classList.toggle("screen--active", el === target);
  });
  if (target !== dom.screenFinal) {
    stopConfetti();
  }
}

function updateSoundButtons() {
  dom.soundButtons.forEach((btn) => {
    const icon = btn.querySelector(".sound-icon");
    const label = btn.querySelector(".sound-label");
    if (icon) icon.textContent = state.soundEnabled ? "🔊" : "🔇";
    if (label) label.textContent = state.soundEnabled ? "音效：開啟" : "音效：關閉";
  });
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  updateSoundButtons();
  if (state.soundEnabled) {
    SoundFX.playClick();
  }
}

/* ============================================================
   遊戲流程控制
   ============================================================ */
function getTotalPossibleDifferences() {
  return LEVELS.reduce((sum, lvl) => sum + lvl.differences.length, 0);
}

function startNewGame() {
  SoundFX.playClick();
  stopTimer();
  state.currentLevelIndex = 0;
  state.levelResults = [];
  showScreen(dom.screenGame);
  loadLevel(0);
}

function loadLevel(index) {
  stopTimer();
  clearTimeout(state.toastTimerId);

  const level = LEVELS[index];
  state.currentLevelIndex = index;
  state.timeLeft = level.timeLimit;
  state.foundIds = new Set();
  state.wrongClicks = 0;
  state.hintsLeft = 1;
  state.hintUsed = false;
  state.isPlaying = true;
  state.isInspecting = false;

  // 隱藏彈窗與檢視列
  dom.modalBackdrop.classList.add("hidden");
  dom.inspectBar.classList.add("hidden");
  dom.markerLayer.innerHTML = "";

  // 更新 HUD
  dom.hudLevelStep.textContent = `${index + 1} / ${LEVELS.length}`;
  dom.hudLevelName.textContent = level.name;
  dom.hudDifficulty.textContent = level.difficulty;
  dom.paintingTitleOrig.textContent = level.paintingTitle;
  dom.paintingTitleMod.textContent = `點擊找出 ${level.differences.length} 處不同`;
  updateFoundHud();
  updateHintButton();
  updateTimerUI();

  // 更新兔子館長狀態
  renderUsagi(dom.gameUsagi, "thinking");
  setCuratorMessage("仔細比較左右兩幅名畫，點擊右側圖片中不一樣的地方喔！");

  // 載入圖片（確保不裁切、不變形，載入完成後精準校準疊加層）
  dom.errOriginal.classList.add("hidden");
  dom.errModified.classList.add("hidden");
  dom.imgOriginal.src = level.originalSrc;
  dom.imgModified.src = level.modifiedSrc;

  // 顯示短暫關卡提醒
  showLevelIntroToast(level, index);

  // 啟動計時器
  startTimer();
}

function showLevelIntroToast(level, index) {
  dom.toastLevelBadge.textContent = `第 ${index + 1} 關`;
  dom.toastLevelTitle.textContent = level.shortName;
  dom.toastLevelDesc.textContent = `找出 ${level.differences.length} 個差異，限時 ${level.timeLimit} 秒！`;
  dom.levelIntroToast.classList.remove("hidden");

  state.toastTimerId = setTimeout(() => {
    dom.levelIntroToast.classList.add("hidden");
  }, 2200);
}

function setCuratorMessage(text) {
  dom.curatorMessage.textContent = text;
}

function updateFoundHud() {
  const level = LEVELS[state.currentLevelIndex];
  dom.hudFoundCount.textContent = `${state.foundIds.size} / ${level.differences.length}`;
}

function updateHintButton() {
  dom.hintRemaining.textContent = String(state.hintsLeft);
  dom.btnHint.disabled = state.hintsLeft <= 0 || !state.isPlaying;
}

/* ================= 計時器 ================= */
function startTimer() {
  stopTimer();
  const level = LEVELS[state.currentLevelIndex];
  state.timerId = setInterval(() => {
    if (!state.isPlaying) return;
    state.timeLeft = Math.max(0, state.timeLeft - 1);
    updateTimerUI();

    if (state.timeLeft === 10) {
      setCuratorMessage("剩下最後 10 秒鐘了，需要提示的話可以點右上角的燈泡喔！");
    }

    if (state.timeLeft <= 0) {
      stopTimer();
      handleTimeUp(level);
    }
  }, 1000);
}

function stopTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function updateTimerUI() {
  const level = LEVELS[state.currentLevelIndex];
  const pct = Math.max(0, Math.min(100, (state.timeLeft / level.timeLimit) * 100));
  dom.hudTimerText.textContent = `${state.timeLeft} 秒`;
  dom.timerTrack.setAttribute("aria-valuenow", String(state.timeLeft));
  dom.timerFill.style.width = `${pct}%`;

  dom.timerFill.classList.toggle("is-mid", pct <= 50 && pct > 25);
  dom.timerFill.classList.toggle("is-low", pct <= 25);
  dom.hudTimerText.classList.toggle("is-warning", state.timeLeft <= 10 && state.timeLeft > 0);
}

/* ============================================================
   玩家點擊右側圖片比對邏輯
   ============================================================ */
function handleModifiedImageClick(event) {
  if (!state.isPlaying) return;
  const rect = getContainedImageRect(dom.imgModified, dom.stageModified);
  if (!rect) return;

  // 確保疊加層與圖片精準對齊
  syncMarkerLayer();

  const nx = (event.clientX - rect.clientLeft) / rect.renderW;
  const ny = (event.clientY - rect.clientTop) / rect.renderH;

  // 若點擊到留白邊緣區域，不計入錯誤點擊
  if (nx < 0 || nx > 1 || ny < 0 || ny > 1) {
    return;
  }

  const level = LEVELS[state.currentLevelIndex];
  const aspectY = rect.renderH / rect.renderW;

  // 檢查是否命中任何一個差異（含其所有 hitZones）
  let matchedDiff = null;
  for (const diff of level.differences) {
    const zones = diff.hitZones && diff.hitZones.length > 0 ? diff.hitZones : [diff];
    const hit = zones.some((zone) => {
      const dx = nx - zone.x;
      const dy = (ny - zone.y) * aspectY;
      return Math.hypot(dx, dy) <= zone.radius;
    });
    if (hit) {
      matchedDiff = diff;
      break;
    }
  }

  if (matchedDiff) {
    // 防止重複點擊同一個已找到的差異重複計分
    if (state.foundIds.has(matchedDiff.id)) {
      setCuratorMessage("這個差異已經找到囉，看看別的地方吧！");
      return;
    }

    // 命中新差異！
    state.foundIds.add(matchedDiff.id);
    removeHintRings();
    addFoundMarker(matchedDiff, false);
    spawnSparkles(matchedDiff.x, matchedDiff.y);
    SoundFX.playSuccess();
    updateFoundHud();
    renderUsagi(dom.gameUsagi, "excited");
    setCuratorMessage(`太棒了！你發現了：「${matchedDiff.label}」！`);

    if (state.foundIds.size >= level.differences.length) {
      handleLevelCleared(level);
    }
  } else {
    // 點擊錯誤：不扣已找到數量，給予短暫視覺與音效回饋
    state.wrongClicks += 1;
    spawnErrorMark(nx, ny);
    triggerModifiedCardShake();
    SoundFX.playError();
    renderUsagi(dom.gameUsagi, "thinking");
    setCuratorMessage("這裡好像和原圖一樣喔，再仔細對照看看！");
  }
}

function addFoundMarker(diff, isRevealAnswer = false) {
  const marker = document.createElement("div");
  marker.className = isRevealAnswer ? "diff-marker diff-marker--answer" : "diff-marker";
  marker.style.left = `${diff.x * 100}%`;
  marker.style.top = `${diff.y * 100}%`;
  marker.style.width = `${diff.radius * 2 * 100}%`;
  marker.style.aspectRatio = "1 / 1";
  marker.setAttribute("aria-label", diff.label);
  dom.markerLayer.appendChild(marker);
}

function spawnErrorMark(nx, ny) {
  const mark = document.createElement("div");
  mark.className = "error-mark";
  mark.style.left = `${nx * 100}%`;
  mark.style.top = `${ny * 100}%`;
  mark.textContent = "✕";
  dom.markerLayer.appendChild(mark);
  setTimeout(() => {
    mark.remove();
  }, 560);
}

function spawnSparkles(nx, ny) {
  const burst = document.createElement("div");
  burst.className = "sparkle-burst";
  burst.style.left = `${nx * 100}%`;
  burst.style.top = `${ny * 100}%`;

  const starOffsets = [
    { tx: "-36px", ty: "-34px" },
    { tx: "36px", ty: "-32px" },
    { tx: "-44px", ty: "18px" },
    { tx: "42px", ty: "22px" },
    { tx: "0px", ty: "-48px" }
  ];

  starOffsets.forEach((off) => {
    const star = document.createElement("span");
    star.className = "sparkle-star";
    star.textContent = "★";
    star.style.setProperty("--tx", off.tx);
    star.style.setProperty("--ty", off.ty);
    burst.appendChild(star);
  });

  dom.markerLayer.appendChild(burst);
  setTimeout(() => {
    burst.remove();
  }, 780);
}

function triggerModifiedCardShake() {
  dom.cardModified.classList.remove("shake");
  void dom.cardModified.offsetWidth;
  dom.cardModified.classList.add("shake");
}

function removeHintRings() {
  dom.markerLayer.querySelectorAll(".hint-ring").forEach((el) => el.remove());
}

/* ============================================================
   免費提示功能（每關 1 次，不會直接顯示全部答案）
   ============================================================ */
function handleUseHint() {
  if (!state.isPlaying || state.hintsLeft <= 0) return;

  const level = LEVELS[state.currentLevelIndex];
  const unfound = level.differences.find((d) => !state.foundIds.has(d.id));
  if (!unfound) return;

  state.hintsLeft -= 1;
  state.hintUsed = true;
  updateHintButton();
  SoundFX.playHint();

  removeHintRings();
  const ring = document.createElement("div");
  ring.className = "hint-ring";
  ring.style.left = `${unfound.x * 100}%`;
  ring.style.top = `${unfound.y * 100}%`;
  ring.style.width = `${Math.min(0.38, unfound.radius * 2.35) * 100}%`;
  ring.style.aspectRatio = "1 / 1";
  dom.markerLayer.appendChild(ring);

  setCuratorMessage(level.hintMessage);
}

/* ============================================================
   計分、單關完成與時間結束處理
   ============================================================ */
function calculateLevelScore(level, allFound) {
  const totalDiffs = level.differences.length;
  const foundCount = state.foundIds.size;

  const foundScore = Math.round((foundCount / totalDiffs) * 60);
  const timeScore = allFound ? Math.round((state.timeLeft / level.timeLimit) * 20) : 0;
  const totalClicks = foundCount + state.wrongClicks;
  const accuracyScore = foundCount === 0 ? 0 : Math.round((foundCount / totalClicks) * 20);
  const totalScore = Math.min(100, foundScore + timeScore + accuracyScore);

  let stars = 1;
  if (totalScore >= 90) stars = 3;
  else if (totalScore >= 60) stars = 2;

  return {
    foundCount,
    totalDiffs,
    foundScore,
    timeScore,
    accuracyScore,
    totalScore,
    stars
  };
}

function saveLevelResult(level, scoreInfo, cleared) {
  state.levelResults[state.currentLevelIndex] = {
    levelId: level.id,
    levelName: level.name,
    shortName: level.shortName,
    paintingTitle: level.paintingTitle,
    modifiedSrc: level.modifiedSrc,
    differences: level.differences,
    cleared,
    ...scoreInfo
  };
}

function handleLevelCleared(level) {
  state.isPlaying = false;
  stopTimer();
  dom.btnHint.disabled = true;

  const scoreInfo = calculateLevelScore(level, true);
  saveLevelResult(level, scoreInfo, true);

  setTimeout(() => {
    SoundFX.playLevelComplete();
    openResultModal({
      mode: "cleared",
      level,
      scoreInfo
    });
  }, 420);
}

function handleTimeUp(level) {
  state.isPlaying = false;
  dom.btnHint.disabled = true;

  const scoreInfo = calculateLevelScore(level, false);
  saveLevelResult(level, scoreInfo, false);

  SoundFX.playError();
  renderUsagi(dom.gameUsagi, "encourage");
  openResultModal({
    mode: "timeout",
    level,
    scoreInfo
  });
}

function createDiffThumbCanvas(diff) {
  const canvas = document.createElement("canvas");
  canvas.width = 124;
  canvas.height = 124;
  canvas.className = "diff-thumb-canvas";
  const ctx = canvas.getContext("2d");

  const img = dom.imgModified;
  if (img && img.complete && img.naturalWidth > 0) {
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const cropSize = Math.max(80, Math.min(nw, nh) * Math.max(0.28, diff.radius * 2.6));
    const cx = diff.x * nw;
    const cy = diff.y * nh;
    const sx = Math.max(0, Math.min(nw - cropSize, cx - cropSize / 2));
    const sy = Math.max(0, Math.min(nh - cropSize, cy - cropSize / 2));
    ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, 124, 124);

    // 在縮圖上畫出細緻綠圈標記位置
    const relX = ((cx - sx) / cropSize) * 124;
    const relY = ((cy - sy) / cropSize) * 124;
    ctx.strokeStyle = "#2ecc71";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(relX, relY, 26, 0, Math.PI * 2);
    ctx.stroke();
  }
  return canvas;
}

function openResultModal({ mode, level, scoreInfo }) {
  const isLastLevel = state.currentLevelIndex === LEVELS.length - 1;
  const isCleared = mode === "cleared";

  renderUsagi(dom.modalUsagi, isCleared ? "excited" : "encourage");

  // 星星呈現
  dom.modalStars.innerHTML = "";
  if (isCleared) {
    for (let i = 1; i <= 3; i++) {
      const s = document.createElement("span");
      s.className = i <= scoreInfo.stars ? "star-on" : "star-off";
      s.textContent = "★";
      dom.modalStars.appendChild(s);
    }
    dom.modalTitle.textContent = "恭喜完成本關！";
    dom.modalQuote.textContent =
      scoreInfo.stars === 3
        ? "太神啦！你簡直就是火眼金睛的藝術偵探！"
        : "表現得很棒喔！再接再厲挑戰下一幅名畫吧！";
  } else {
    dom.modalTitle.textContent = "時間到囉！別灰心～";
    dom.modalQuote.textContent = `你在本關找到了 ${scoreInfo.foundCount} / ${scoreInfo.totalDiffs} 個差異，可以再挑戰一次，或先看答案再繼續！`;
  }

  // 分數明細
  dom.modalScoreTotal.textContent = `${scoreInfo.totalScore} 分`;
  dom.modalScoreFound.textContent = `${scoreInfo.foundScore} 分`;
  dom.modalScoreTime.textContent = `${scoreInfo.timeScore} 分`;
  dom.modalScoreAccuracy.textContent = `${scoreInfo.accuracyScore} 分`;

  // 差異縮圖與說明列表
  dom.diffSummaryHeading.textContent = isCleared ? "本關找到的差異" : "目前尋獲紀錄";
  dom.diffSummaryList.innerHTML = "";

  level.differences.forEach((diff) => {
    const found = state.foundIds.has(diff.id);
    const item = document.createElement("div");
    item.className = "diff-summary-item";

    if (found || isCleared) {
      item.appendChild(createDiffThumbCanvas(diff));
    }

    const textWrap = document.createElement("div");
    textWrap.className = "diff-summary-text";

    const label = document.createElement("span");
    label.className = "diff-summary-label";
    label.textContent = found || isCleared ? diff.label : "尚未找到的神秘差異（點擊查看答案即可揭曉）";

    const status = document.createElement("span");
    status.className = found ? "diff-summary-status" : "diff-summary-status is-missed";
    status.textContent = found ? "✔ 已成功找到" : "⏳ 尚未找出";

    textWrap.appendChild(label);
    textWrap.appendChild(status);
    item.appendChild(textWrap);
    dom.diffSummaryList.appendChild(item);
  });

  // 動作按鈕
  dom.modalActions.innerHTML = "";

  if (isCleared) {
    const btnInspect = document.createElement("button");
    btnInspect.type = "button";
    btnInspect.className = "btn-soft";
    btnInspect.textContent = "🔍 再看一次名畫";
    btnInspect.addEventListener("click", () => {
      SoundFX.playClick();
      enterInspectMode(false);
    });
    dom.modalActions.appendChild(btnInspect);

    const btnNext = document.createElement("button");
    btnNext.type = "button";
    btnNext.className = "btn-primary";
    btnNext.textContent = isLastLevel ? "🏆 查看最終成果" : "下一關 ➔";
    btnNext.addEventListener("click", () => {
      SoundFX.playClick();
      proceedNextStep();
    });
    dom.modalActions.appendChild(btnNext);
  } else {
    const btnRetry = document.createElement("button");
    btnRetry.type = "button";
    btnRetry.className = "btn-primary";
    btnRetry.textContent = "🔄 再挑戰一次";
    btnRetry.addEventListener("click", () => {
      SoundFX.playClick();
      loadLevel(state.currentLevelIndex);
    });
    dom.modalActions.appendChild(btnRetry);

    const btnReveal = document.createElement("button");
    btnReveal.type = "button";
    btnReveal.className = "btn-soft";
    btnReveal.textContent = "👀 查看答案並繼續";
    btnReveal.addEventListener("click", () => {
      SoundFX.playClick();
      enterInspectMode(true);
    });
    dom.modalActions.appendChild(btnReveal);
  }

  dom.modalBackdrop.classList.remove("hidden");
}

function enterInspectMode(revealMissing) {
  dom.modalBackdrop.classList.add("hidden");
  state.isInspecting = true;
  removeHintRings();

  const level = LEVELS[state.currentLevelIndex];
  const isLastLevel = state.currentLevelIndex === LEVELS.length - 1;

  if (revealMissing) {
    const labels = [];
    level.differences.forEach((diff) => {
      if (!state.foundIds.has(diff.id)) {
        addFoundMarker(diff, true);
      }
      labels.push(diff.label);
    });
    setCuratorMessage(`答案揭曉：${labels.join("、")}！看清楚後就可以繼續下一關囉～`);
    dom.inspectBarText.textContent = `👀 答案揭曉：${labels.join("、")}`;
  } else {
    dom.inspectBarText.textContent = "🔍 正在欣賞本關名畫與差異標記";
  }

  dom.btnInspectNext.textContent = isLastLevel ? "🏆 查看最終成果" : "前往下一關 ➔";
  dom.inspectBar.classList.remove("hidden");
  syncMarkerLayer();
}

function proceedNextStep() {
  dom.modalBackdrop.classList.add("hidden");
  dom.inspectBar.classList.add("hidden");

  if (state.currentLevelIndex < LEVELS.length - 1) {
    loadLevel(state.currentLevelIndex + 1);
  } else {
    showFinalScreen();
  }
}

/* ============================================================
   最終通關畫面與彩帶特效
   ============================================================ */
function showFinalScreen() {
  stopTimer();
  showScreen(dom.screenFinal);
  renderUsagi(dom.finalUsagi, "crown");
  SoundFX.playVictory();

  const totalScore = state.levelResults.reduce((acc, r) => acc + (r ? r.totalScore : 0), 0);
  const totalFound = state.levelResults.reduce((acc, r) => acc + (r ? r.foundCount : 0), 0);
  const totalPossible = getTotalPossibleDifferences();
  const totalStars = state.levelResults.reduce((acc, r) => acc + (r ? r.stars : 0), 0);
  const maxStars = LEVELS.length * 3;

  let rankText = "🎨 藝術探索新手";
  let commentText = "勇敢完成三幅世界名畫大冒險！多觀察幾次，你會越來越厲害喔！";
  if (totalStars >= 8) {
    rankText = "🏆 超級名畫偵探";
    commentText = "驚人的觀察力！Usagi 館長要把美術館榮譽皇冠頒發給你！";
  } else if (totalStars >= 5) {
    rankText = "🔎 敏銳觀察家";
    commentText = "很棒的表現！你已經掌握了名畫細節的觀察技巧囉！";
  }

  dom.finalRankBadge.textContent = rankText;
  dom.finalUsagiComment.textContent = commentText;
  dom.finalTotalScore.textContent = `${totalScore} / ${LEVELS.length * 100} 分`;
  dom.finalTotalFound.textContent = `${totalFound} / ${totalPossible} 個差異`;
  dom.finalTotalStars.textContent = `${totalStars} / ${maxStars} 顆星`;

  // 建立三關縮圖回顧
  dom.finalGallery.innerHTML = "";
  LEVELS.forEach((level, idx) => {
    const res = state.levelResults[idx];
    const card = document.createElement("div");
    card.className = "gallery-item";

    const thumbWrap = document.createElement("div");
    thumbWrap.className = "gallery-thumb-wrap";
    const img = document.createElement("img");
    img.className = "gallery-thumb-img";
    img.src = level.modifiedSrc;
    img.alt = level.paintingTitle;
    thumbWrap.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "gallery-meta";
    const titleSpan = document.createElement("span");
    titleSpan.textContent = `第 ${idx + 1} 關`;
    const starSpan = document.createElement("span");
    const stars = res ? res.stars : 1;
    const score = res ? res.totalScore : 0;
    starSpan.textContent = `${"★".repeat(stars)}${"☆".repeat(3 - stars)} (${score} 分)`;
    meta.appendChild(titleSpan);
    meta.appendChild(starSpan);

    const desc = document.createElement("p");
    desc.className = "gallery-diff-desc";
    desc.textContent = `差異：${level.differences.map((d) => d.label).join("、")}`;

    card.appendChild(thumbWrap);
    card.appendChild(meta);
    card.appendChild(desc);
    dom.finalGallery.appendChild(card);
  });

  startConfetti();
}

function startConfetti() {
  stopConfetti();
  const canvas = dom.confettiCanvas;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();

  const colors = ["#FF9466", "#FFE07D", "#73C2FB", "#B497F5", "#2ECC71"];
  const pieces = Array.from({ length: 55 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    size: 6 + Math.random() * 7,
    speedY: 1.6 + Math.random() * 2.4,
    speedX: (Math.random() - 0.5) * 1.5,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.1,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));

  function frame() {
    if (!dom.screenFinal.classList.contains("screen--active")) {
      stopConfetti();
      return;
    }
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      resize();
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of pieces) {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rot += p.rotSpeed;

      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
      ctx.restore();
    }

    state.confettiRafId = requestAnimationFrame(frame);
  }

  state.confettiRafId = requestAnimationFrame(frame);
}

function stopConfetti() {
  if (state.confettiRafId) {
    cancelAnimationFrame(state.confettiRafId);
    state.confettiRafId = null;
  }
  const ctx = dom.confettiCanvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, dom.confettiCanvas.width, dom.confettiCanvas.height);
  }
}

/* ============================================================
   初始化與事件綁定
   ============================================================ */
function init() {
  // 動態更新首頁玩法說明的差異數量文字，確保與關卡設定完全一致
  const totalDiffs = getTotalPossibleDifferences();
  dom.homeRuleText.textContent = `比較左右兩幅名畫，找出右側「找不同」圖片中不同的地方！共有 ${LEVELS.length} 道關卡（合計 ${totalDiffs} 處差異），每關限時 45 秒。`;

  renderUsagi(dom.homeUsagi, "happy");
  renderUsagi(dom.gameUsagi, "thinking");
  updateSoundButtons();

  dom.btnStartGame.addEventListener("click", startNewGame);

  dom.btnBackHome.addEventListener("click", () => {
    SoundFX.playClick();
    stopTimer();
    state.isPlaying = false;
    dom.modalBackdrop.classList.add("hidden");
    dom.inspectBar.classList.add("hidden");
    showScreen(dom.screenHome);
  });

  dom.btnHint.addEventListener("click", handleUseHint);

  dom.soundButtons.forEach((btn) => {
    btn.addEventListener("click", toggleSound);
  });

  dom.stageModified.addEventListener("click", handleModifiedImageClick);

  dom.btnInspectNext.addEventListener("click", () => {
    SoundFX.playClick();
    proceedNextStep();
  });

  dom.btnReplayAll.addEventListener("click", () => {
    startNewGame();
  });

  dom.btnFinalHome.addEventListener("click", () => {
    SoundFX.playClick();
    showScreen(dom.screenHome);
  });

  // 圖片載入與錯誤監聽
  dom.imgOriginal.addEventListener("load", () => {
    dom.errOriginal.classList.add("hidden");
  });
  dom.imgOriginal.addEventListener("error", () => {
    dom.errOriginal.classList.remove("hidden");
  });

  dom.imgModified.addEventListener("load", () => {
    dom.errModified.classList.add("hidden");
    syncMarkerLayer();
  });
  dom.imgModified.addEventListener("error", () => {
    dom.errModified.classList.remove("hidden");
  });

  // 視窗或容器縮放時，自動重新對齊標記層
  window.addEventListener("resize", syncMarkerLayer);
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(syncMarkerLayer);
    ro.observe(dom.stageModified);
  }
}

document.addEventListener("DOMContentLoaded", init);
