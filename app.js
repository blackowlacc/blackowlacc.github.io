(() => {
  const STORAGE_KEY = "black_owl_wheel_auto_prize_v3_bgstudio";
  const $ = (id) => document.getElementById(id);

  const canvas = $("wheelCanvas");
  const ctx = canvas.getContext("2d");

  const confettiCanvas = $("confettiCanvas");
  const cctx = confettiCanvas.getContext("2d");

  const spinBtn = $("spinBtn");
  const winnerInline = $("winnerInline");
  const winnerInlineText = $("winnerInlineText");

  const openDrawerBtn = $("openDrawerBtn");
  const fullscreenBtn = $("fullscreenBtn");
  const fabFullscreenBtn = $("fabFullscreenBtn");

  const drawer = $("drawer");
  const drawerBackdrop = $("drawerBackdrop");
  const drawerCloseBtn = $("drawerCloseBtn");
  const tabBtns = Array.from(document.querySelectorAll(".tabBtn"));
  const tabPanels = Array.from(document.querySelectorAll(".tabPanel"));

  // List tab
  const quickName = $("quickName");
  const quickTable = $("quickTable");
  const quickAddBtn = $("quickAddBtn");
  const autoColorsBtn = $("autoColorsBtn");
  const autoTextBtn = $("autoTextBtn");
  const clearWinnerBtn = $("clearWinnerBtn");
  const searchInput = $("searchInput");
  const countPill = $("countPill");
  const bulkInput = $("bulkInput");
  const bulkReplaceBtn = $("bulkReplaceBtn");
  const bulkAppendBtn = $("bulkAppendBtn");
  const itemsList = $("itemsList");

  // Prize + celebration
  const prizeListInput = $("prizeListInput");
  const prizeExhausted = $("prizeExhausted");
  const resetPrizeCursorBtn = $("resetPrizeCursorBtn");
  const prizeNextPill = $("prizeNextPill");
  const spinCountPill = $("spinCountPill");

  const confettiEnabled = $("confettiEnabled");
  const soundEnabled = $("soundEnabled");
  const soundVolume = $("soundVolume");
  const soundFileInput = $("soundFileInput");

  // Wheel tab
  const gradientMode = $("gradientMode");
  const removeAfterWin = $("removeAfterWin");
  const contourWidth = $("contourWidth");
  const contourColor = $("contourColor");
  const outerBorderWidth = $("outerBorderWidth");
  const outerBorderColor = $("outerBorderColor");
  const spinDurationMs = $("spinDurationMs");
  const minSpins = $("minSpins");
  const maxSpins = $("maxSpins");
  const textOrientation = $("textOrientation");
  const nameFontSize = $("nameFontSize");
  const tableFontSize = $("tableFontSize");

  // Theme tab (slices)
  const themePaletteList = $("themePaletteList");
  const addThemeColorBtn = $("addThemeColorBtn");
  const removeThemeColorBtn = $("removeThemeColorBtn");
  const themeText = $("themeText");
  const themeMode = $("themeMode");
  const themeLighten = $("themeLighten");
  const themeDarken = $("themeDarken");
  const applyThemeBtn = $("applyThemeBtn");
  const randomThemeBtn = $("randomThemeBtn");

  // Theme tab (background studio) NEW
  const bgMode = $("bgMode");
  const bgSolid = $("bgSolid");
  const bgTop = $("bgTop");
  const bgBottom = $("bgBottom");
  const bgGlowA = $("bgGlowA");
  const bgGlowB = $("bgGlowB");
  const applyBgBtn = $("applyBgBtn");
  const resetBgBtn = $("resetBgBtn");

  // Export tab
  const exportBtn = $("exportBtn");
  const importBtn = $("importBtn");
  const resetAllBtn = $("resetAllBtn");
  const clearStorageBtn = $("clearStorageBtn");
  const jsonBox = $("jsonBox");

  // Winner modal
  const winnerModalBackdrop = $("winnerModalBackdrop");
  const winnerModal = $("winnerModal");
  const winnerMain = $("winnerMain");
  const winnerPrize = $("winnerPrize");
  const winnerCloseBtn = $("winnerCloseBtn");
  const spinAgainBtn = $("spinAgainBtn");
  const undoRemoveBtn = $("undoRemoveBtn");

  // Toast
  const toastEl = $("toast");

  const TWO_PI = Math.PI * 2;
  const START_ANGLE_OFFSET = -Math.PI / 2;

  const clone = (obj) => (typeof structuredClone === "function")
    ? structuredClone(obj)
    : JSON.parse(JSON.stringify(obj));

  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

  function normalizeAngle(rad){
    rad = rad % TWO_PI;
    if (rad < 0) rad += TWO_PI;
    return rad;
  }

  function safeColor(value, fallback){
    let v = (value || "").toString().trim();
    if (!v) return fallback;
    if (!v.startsWith("#")) v = "#" + v;
    if (v.length === 4) v = "#" + v.slice(1).split("").map(ch => ch + ch).join("");
    if (v.length !== 7) return fallback;
    return v;
  }

  function mixChannel(channel, amt){
    if (amt < 0) return Math.round(channel * (1 + amt));
    return Math.round(channel + (255 - channel) * amt);
  }

  function adjustHex(hex, amt){
    let h = (hex || "").trim();
    if (!h) return "#999999";
    if (h[0] !== "#") h = "#" + h;
    h = h.replace("#", "");
    if (h.length === 3) h = h.split("").map(ch => ch + ch).join("");
    if (h.length !== 6) return "#999999";

    const num = parseInt(h, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;

    r = clamp(mixChannel(r, amt), 0, 255);
    g = clamp(mixChannel(g, amt), 0, 255);
    b = clamp(mixChannel(b, amt), 0, 255);

    const out = (1 << 24) + (r << 16) + (g << 8) + b;
    return "#" + out.toString(16).slice(1);
  }

  function hexToRgb(hex){
    hex = (hex || "#000000").replace("#","").trim();
    if (hex.length === 3) hex = hex.split("").map(c=>c+c).join("");
    const n = parseInt(hex, 16);
    return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
  }

  function rgbToHex({r,g,b}){
    const to = v => clamp(Math.round(v),0,255).toString(16).padStart(2,"0");
    return "#" + to(r) + to(g) + to(b);
  }

  function mixHex(a, b, t){
    const A = hexToRgb(a), B = hexToRgb(b);
    const lerp = (x,y,t) => x + (y-x)*t;
    return rgbToHex({ r: lerp(A.r,B.r,t), g: lerp(A.g,B.g,t), b: lerp(A.b,B.b,t) });
  }

  function hslToHex(h, s, l){
    s/=100; l/=100;
    const k = n => (n + h/30) % 12;
    const a = s * Math.min(l, 1-l);
    const f = n => l - a * Math.max(-1, Math.min(k(n)-3, Math.min(9-k(n), 1)));
    const r = Math.round(255*f(0));
    const g = Math.round(255*f(8));
    const b = Math.round(255*f(4));
    return "#" + [r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("");
  }

  function toast(msg, variant="info"){
    toastEl.textContent = msg;
    toastEl.dataset.variant = variant;
    toastEl.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(()=>toastEl.classList.remove("show"), 2200);
  }

  // ------------------ AUDIO ------------------
  let audioCtx = null;
  let uploadedAudioUrl = null;

  function ensureAudioCtx(){
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume().catch(()=>{});
    return audioCtx;
  }

  function playUploadedAudio(){
    if (!uploadedAudioUrl) return false;
    try{
      const audio = new Audio(uploadedAudioUrl);
      audio.volume = clamp(Number(state.settings.soundVolume) || 0.7, 0, 1);
      audio.play().catch(()=>{});
      return true;
    }catch{
      return false;
    }
  }

  function playCheerSynth(){
    const ctxA = ensureAudioCtx();
    const master = ctxA.createGain();
    master.gain.value = clamp(Number(state.settings.soundVolume) || 0.7, 0, 1);
    master.connect(ctxA.destination);

    const now = ctxA.currentTime;

    const dur = 0.25;
    const buf = ctxA.createBuffer(1, ctxA.sampleRate * dur, ctxA.sampleRate);
    const data = buf.getChannelData(0);
    for (let i=0;i<data.length;i++){
      data[i] = (Math.random()*2-1) * (1 - i/data.length);
    }

    const burst = (t, amp) => {
      const src = ctxA.createBufferSource();
      src.buffer = buf;
      const g = ctxA.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(amp, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(g);
      g.connect(master);
      src.start(t);
      src.stop(t + dur);
    };

    burst(now + 0.00, 0.55);
    burst(now + 0.08, 0.50);
    burst(now + 0.16, 0.45);
    burst(now + 0.24, 0.38);

    const tone = (t, freq, length, amp) => {
      const o = ctxA.createOscillator();
      const g = ctxA.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(amp, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + length);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + length);
    };

    tone(now + 0.02, 523.25, 0.18, 0.16);
    tone(now + 0.10, 659.25, 0.18, 0.14);
    tone(now + 0.18, 783.99, 0.22, 0.12);
  }

  function playWinSound(){
    if (state.settings.soundEnabled !== "on") return;
    if (playUploadedAudio()) return;
    playCheerSynth();
  }

  // ------------------ CONFETTI ------------------
  let confetti = [];
  let confettiRAF = null;

  function resizeConfetti(){
    const rect = confettiCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    confettiCanvas.width = Math.floor(rect.width * dpr);
    confettiCanvas.height = Math.floor(rect.height * dpr);
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnConfetti(){
    if (state.settings.confettiEnabled !== "on") return;
    resizeConfetti();

    const rect = confettiCanvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;

    confetti = [];
    const count = 220;

    const palette = [
      "#ff6b6b","#ffd43b","#69db7c","#74c0fc","#b197fc",
      "#ffa94d","#22c55e","#60a5fa","#a78bfa","#e599f7"
    ];

    for (let i=0;i<count;i++){
      const size = 6 + Math.random()*10;
      confetti.push({
        x: w * 0.5 + (Math.random()*120 - 60),
        y: h * 0.15 + (Math.random()*20),
        vx: (Math.random()*2 - 1) * (2 + Math.random()*3),
        vy: 1 + Math.random()*3,
        rot: Math.random()*Math.PI,
        vr: (Math.random()*2 - 1) * 0.18,
        size,
        color: palette[Math.floor(Math.random()*palette.length)],
        life: 0,
        ttl: 120 + Math.random()*80,
        shape: Math.random() < 0.7 ? "rect" : "tri"
      });
    }

    const gravity = 0.07;
    const drag = 0.995;

    const tick = () => {
      const rect2 = confettiCanvas.getBoundingClientRect();
      const W = rect2.width, H = rect2.height;

      cctx.clearRect(0,0,W,H);

      let alive = 0;
      for (const p of confetti){
        p.life++;
        if (p.life > p.ttl) continue;
        alive++;

        p.vy += gravity;
        p.vx *= drag;
        p.vy *= drag;

        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        cctx.save();
        cctx.translate(p.x, p.y);
        cctx.rotate(p.rot);
        cctx.fillStyle = p.color;
        cctx.globalAlpha = Math.max(0, 1 - (p.life / p.ttl));

        if (p.shape === "rect") {
          cctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
        } else {
          cctx.beginPath();
          cctx.moveTo(0, -p.size/2);
          cctx.lineTo(p.size/2, p.size/2);
          cctx.lineTo(-p.size/2, p.size/2);
          cctx.closePath();
          cctx.fill();
        }
        cctx.restore();
      }

      if (alive > 0){
        confettiRAF = requestAnimationFrame(tick);
      } else {
        cctx.clearRect(0,0,W,H);
        confettiRAF = null;
      }
    };

    if (confettiRAF) cancelAnimationFrame(confettiRAF);
    confettiRAF = requestAnimationFrame(tick);
  }

  // ------------------ BACKGROUND STUDIO APPLY ------------------
  function rgbaFromHex(hex, alpha){
    const {r,g,b} = hexToRgb(hex);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function applyBackgroundToDOM(){
    const bg = state.settings.background;
    document.body.dataset.bg = bg.mode;

    const root = document.documentElement.style;
    root.setProperty("--bg-solid", bg.solid);
    root.setProperty("--bg-top", bg.top);
    root.setProperty("--bg-bottom", bg.bottom);
    root.setProperty("--bg-glow-a", rgbaFromHex(bg.glowA, bg.glowAAlpha));
    root.setProperty("--bg-glow-b", rgbaFromHex(bg.glowB, bg.glowBAlpha));
  }

  // ------------------ STATE ------------------
  const defaultState = {
    rotation: 0,
    isSpinning: false,
    activeTab: "list",
    lastWinner: null,
    lastRemoved: null,
    options: [
      { name: "Mr James", table: "T2", color1: "#74c0fc", color2: "#1c7ed6", textColor: "#ffffff" },
      { name: "Budi", table: "S1", color1: "#ff6b6b", color2: "#c92a2a", textColor: "#ffffff" },
      { name: "Citra", table: "V1", color1: "#ffd43b", color2: "#e67700", textColor: "#111111" },
      { name: "Dewi", table: "T1", color1: "#69db7c", color2: "#2f9e44", textColor: "#111111" },
      { name: "Eka",  table: "S2", color1: "#b197fc", color2: "#7048e8", textColor: "#ffffff" },
    ],
    settings: {
      prizeList: ["MOTOR", "HP", "TIKET JALAN-JALAN"],
      prizeCursor: 0,
      spinCount: 0,
      prizeExhausted: "loop",

      confettiEnabled: "on",
      soundEnabled: "on",
      soundVolume: 0.7,

      gradient: "on",
      removeAfterWin: "on",
      contourWidth: 2,
      contourColor: "#0b1020",
      outerBorderWidth: 6,
      outerBorderColor: "#ffffff",
      spinDurationMs: 4200,
      minSpins: 6,
      maxSpins: 10,
      textOrientation: "wheel",
      nameFontSize: 16,
      tableFontSize: 13,

      themeStudio: {
        colors: ["#60a5fa", "#a78bfa", "#22c55e", "#f97316", "#facc15", "#ec4899"],
        text: "#ffffff",
        mode: "spectrum",
        lighten: 0.08,
        darken: -0.22,
      },

      // NEW: Background settings
      background: {
        mode: "glow",            // solid | gradient | glow
        solid: "#0b1020",
        top: "#070814",
        bottom: "#040508",
        glowA: "#60a5fa",
        glowB: "#a78bfa",
        glowAAlpha: 0.18,
        glowBAlpha: 0.14,
      }
    }
  };

  let state = loadState();
  let saveTimer = null;
  let frozenWheel = null;

  function saveState(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function scheduleSave(){
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 180);
  }

  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(defaultState);
      const parsed = JSON.parse(raw);

      const merged = clone(defaultState);
      Object.assign(merged, parsed);

      merged.settings = Object.assign(clone(defaultState.settings), parsed.settings || {});
      merged.settings.themeStudio = Object.assign(clone(defaultState.settings.themeStudio), parsed.settings?.themeStudio || {});
      merged.settings.background = Object.assign(clone(defaultState.settings.background), parsed.settings?.background || {});
      merged.options = Array.isArray(parsed.options) ? parsed.options : clone(defaultState.options);

      const legacyTheme = parsed.settings?.themeStudio || {};
      const legacyColors = [legacyTheme.a, legacyTheme.b, legacyTheme.c].filter(Boolean);
      merged.settings.themeStudio.colors = Array.isArray(merged.settings.themeStudio.colors)
        ? merged.settings.themeStudio.colors.filter(Boolean)
        : legacyColors;
      if (!merged.settings.themeStudio.colors.length) merged.settings.themeStudio.colors = clone(defaultState.settings.themeStudio.colors);

      if (!Array.isArray(merged.settings.prizeList)) merged.settings.prizeList = clone(defaultState.settings.prizeList);
      merged.settings.prizeCursor = clamp(Number(merged.settings.prizeCursor)||0, 0, merged.settings.prizeList.length);
      merged.settings.spinCount = clamp(Number(merged.settings.spinCount)||0, 0, 999999);
      merged.settings.soundVolume = clamp(Number(merged.settings.soundVolume)||0.7, 0, 1);
      merged.settings.nameFontSize = Math.max(1, Number(merged.settings.nameFontSize) || defaultState.settings.nameFontSize);
      merged.settings.tableFontSize = Math.max(1, Number(merged.settings.tableFontSize) || defaultState.settings.tableFontSize);

      // sanitize bg
      merged.settings.background.mode = ["solid","gradient","glow"].includes(merged.settings.background.mode) ? merged.settings.background.mode : "glow";
      merged.settings.background.solid = safeColor(merged.settings.background.solid, defaultState.settings.background.solid);
      merged.settings.background.top = safeColor(merged.settings.background.top, defaultState.settings.background.top);
      merged.settings.background.bottom = safeColor(merged.settings.background.bottom, defaultState.settings.background.bottom);
      merged.settings.background.glowA = safeColor(merged.settings.background.glowA, defaultState.settings.background.glowA);
      merged.settings.background.glowB = safeColor(merged.settings.background.glowB, defaultState.settings.background.glowB);
      merged.settings.background.glowAAlpha = clamp(Number(merged.settings.background.glowAAlpha) || 0.18, 0, 0.5);
      merged.settings.background.glowBAlpha = clamp(Number(merged.settings.background.glowBAlpha) || 0.14, 0, 0.5);

      return merged;
    }catch{
      return clone(defaultState);
    }
  }

  // ------------------ Drawer ------------------
  function openDrawer(tab = state.activeTab || "list"){
    state.activeTab = tab;
    saveState();
    document.body.classList.add("drawer-open");
    drawer.setAttribute("aria-hidden", "false");
    drawerBackdrop.setAttribute("aria-hidden", "false");
    setActiveTab(tab);
  }

  function closeDrawer(){
    document.body.classList.remove("drawer-open");
    drawer.setAttribute("aria-hidden", "true");
    drawerBackdrop.setAttribute("aria-hidden", "true");
  }

  function setActiveTab(tab){
    tabBtns.forEach(btn => btn.classList.toggle("isActive", btn.dataset.tab === tab));
    tabPanels.forEach(p => p.classList.toggle("isActive", p.dataset.tabPanel === tab));
  }

  // ------------------ Winner modal ------------------
  function openWinnerModal(){
    if (!state.lastWinner) return;
    const w = state.lastWinner;
    winnerMain.textContent = `${(w.name||"-").toUpperCase()} - ${(w.table||"-").toUpperCase()}`;
    winnerPrize.textContent = (w.prize || "—").toString().toUpperCase();
    undoRemoveBtn.style.display = state.lastRemoved ? "" : "none";

    document.body.classList.add("modal-open");
    winnerModalBackdrop.setAttribute("aria-hidden", "false");
    winnerModal.setAttribute("aria-hidden", "false");
  }

  function closeWinnerModal(){
    document.body.classList.remove("modal-open");
    winnerModalBackdrop.setAttribute("aria-hidden", "true");
    winnerModal.setAttribute("aria-hidden", "true");
    frozenWheel = null;
    drawWheel();
  }

  // ------------------ Canvas draw ------------------
  function resizeCanvasLike(elCanvas, context){
    const rect = elCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(10, Math.floor(rect.width));
    const h = Math.max(10, Math.floor(rect.height));
    elCanvas.width = Math.floor(w * dpr);
    elCanvas.height = Math.floor(h * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  function getSelectedIndex(rotation, optionsLen){
    const n = optionsLen;
    if (!n) return null;
    const arc = TWO_PI / n;
    const rel = normalizeAngle(-rotation);
    return clamp(Math.floor(rel / arc), 0, n - 1);
  }

  function fitTextSize(text, targetSize, maxWidth, weight = 700, minSize = 8){
    const content = (text ?? "").toString();
    let size = Math.max(minSize, Number(targetSize) || minSize);
    if (!content) return size;

    while (size > minSize) {
      ctx.font = `${weight} ${size}px system-ui`;
      if (ctx.measureText(content).width <= maxWidth) break;
      size -= 1;
    }
    return Math.max(minSize, size);
  }

  function drawWheel(){
    const { w, h } = resizeCanvasLike(canvas, ctx);
    ctx.clearRect(0, 0, w, h);

    const cx = w/2, cy = h/2;
    const radius = Math.min(w,h)/2 - 22;

    const wheelOptions = frozenWheel ? frozenWheel.options : state.options;
    const rotation = frozenWheel ? frozenWheel.rotation : state.rotation;
    const n = wheelOptions.length;

    if (!n) {
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,.75)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "700 16px system-ui";
      ctx.fillText("No items. Open List to add.", cx, cy);
      ctx.restore();
      return;
    }

    const arc = TWO_PI / n;

    for (let i=0; i<n; i++){
      const o = wheelOptions[i];
      const start = rotation + START_ANGLE_OFFSET + i*arc;
      const end = start + arc;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();

      if (state.settings.gradient === "on") {
        ctx.clip();
        const c1 = o.color1 || "#888888";
        const c2 = o.color2 || adjustHex(c1, -0.22);
        const rg = ctx.createRadialGradient(cx, cy, radius*0.06, cx, cy, radius);
        rg.addColorStop(0, c1);
        rg.addColorStop(1, c2);
        ctx.fillStyle = rg;
        ctx.fillRect(cx-radius, cy-radius, radius*2, radius*2);
      } else {
        ctx.fillStyle = o.color1 || "#888888";
        ctx.fill();
      }
      ctx.restore();

      const cw = clamp(Number(state.settings.contourWidth) || 0, 0, 30);
      if (cw > 0){
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, end);
        ctx.closePath();
        ctx.lineWidth = cw;
        ctx.strokeStyle = state.settings.contourColor || "#0b1020";
        ctx.stroke();
        ctx.restore();
      }

      const mid = start + arc/2;
      const name = (o.name ?? "").toString();
      const table = (o.table ?? "").toString();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      ctx.translate(radius*0.66, 0);

      const orientation = state.settings.textOrientation || "wheel";
      const ang = normalizeAngle(mid);

      let flip = false;
      if (orientation === "upright") {
        flip = ang > Math.PI/2 && ang < 3*Math.PI/2;
        if (flip) ctx.rotate(Math.PI);
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = o.textColor || "#ffffff";

      const desiredNameSize = Math.max(1, Number(state.settings.nameFontSize) || 16);
      const desiredTableSize = Math.max(1, Number(state.settings.tableFontSize) || 13);
      const sliceChord = 2 * radius * Math.sin(arc / 2);
      const maxTextWidth = Math.max(28, sliceChord * 0.78);
      const nameSize = fitTextSize(name, desiredNameSize, maxTextWidth, 900, 8);
      const tableSize = fitTextSize(table, desiredTableSize, maxTextWidth * 0.92, 700, 7);

      const lineGap = Math.max(8, Math.max(nameSize, tableSize) * 0.22);
      let nameY = -(table ? (tableSize * 0.5 + lineGap) : 0);
      let tableY = table ? (nameSize * 0.5 + lineGap) : 0;
      if (flip) { nameY = -nameY; tableY = -tableY; }

      ctx.font = `900 ${nameSize}px system-ui`;
      ctx.fillText(name, 0, nameY);

      if (table) {
        ctx.font = `700 ${tableSize}px system-ui`;
        ctx.fillText(table, 0, tableY);
      }

      ctx.restore();
    }

    const obw = clamp(Number(state.settings.outerBorderWidth) || 0, 0, 40);
    if (obw > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, TWO_PI);
      ctx.strokeStyle = state.settings.outerBorderColor || "#ffffff";
      ctx.lineWidth = obw;
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 76, 0, TWO_PI);
    ctx.fillStyle = "rgba(15,23,48,.92)";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.92)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 18px system-ui";
    ctx.fillText("SPIN", cx, cy);
    ctx.restore();
  }

  // ------------------ List rendering ------------------
  function syncCount(){ countPill.textContent = `${state.options.length} items`; }
  function syncWinnerInline(){
    if (!state.lastWinner) { winnerInlineText.textContent = "-"; return; }
    winnerInlineText.textContent = `${state.lastWinner.name} • ${state.lastWinner.table}`;
  }

  function renderItems(){
    const q = (searchInput.value || "").trim().toLowerCase();
    itemsList.innerHTML = "";

    state.options.forEach((o, idx) => {
      const match = !q ||
        (o.name || "").toLowerCase().includes(q) ||
        (o.table || "").toLowerCase().includes(q);
      if (!match) return;

      const card = document.createElement("div");
      card.className = "itemCard";

      const top = document.createElement("div");
      top.className = "itemTop";

      const no = document.createElement("div");
      no.className = "itemNo";
      no.textContent = `#${idx+1}`;

      const name = document.createElement("input");
      name.className = "input";
      name.value = o.name ?? "";
      name.placeholder = "Nama";
      name.dataset.field = "name";
      name.dataset.index = String(idx);

      const table = document.createElement("input");
      table.className = "input";
      table.value = o.table ?? "";
      table.placeholder = "S1 / V1 / T1";
      table.dataset.field = "table";
      table.dataset.index = String(idx);

      const up = document.createElement("button");
      up.className = "smallBtn";
      up.textContent = "↑";
      up.dataset.action = "up";
      up.dataset.index = String(idx);

      const down = document.createElement("button");
      down.className = "smallBtn";
      down.textContent = "↓";
      down.dataset.action = "down";
      down.dataset.index = String(idx);

      const del = document.createElement("button");
      del.className = "btn danger";
      del.style.padding = "8px 10px";
      del.style.borderRadius = "12px";
      del.textContent = "Del";
      del.dataset.action = "delete";
      del.dataset.index = String(idx);

      top.append(no, name, table, up, down, del);
      card.append(top);
      itemsList.appendChild(card);
    });

    syncCount();
  }

  itemsList.addEventListener("input", (e) => {
    const t = e.target;
    const idx = Number(t.dataset.index);
    const field = t.dataset.field;
    if (!Number.isFinite(idx) || !field) return;
    if (!state.options[idx]) return;

    if (field === "name" || field === "table") {
      state.options[idx][field] = t.value;
      scheduleSave();
      drawWheel();
    }
  });

  itemsList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const action = btn.dataset.action;
    const idx = Number(btn.dataset.index);
    if (!action || !Number.isFinite(idx)) return;

    if (action === "delete") {
      if (!confirm("Hapus item ini?")) return;
      state.options.splice(idx, 1);
      saveState();
      renderItems();
      drawWheel();
      toast("Item deleted.", "info");
      return;
    }
    if (action === "up" && idx > 0) {
      const tmp = state.options[idx-1];
      state.options[idx-1] = state.options[idx];
      state.options[idx] = tmp;
      saveState();
      renderItems();
      drawWheel();
      return;
    }
    if (action === "down" && idx < state.options.length - 1) {
      const tmp = state.options[idx+1];
      state.options[idx+1] = state.options[idx];
      state.options[idx] = tmp;
      saveState();
      renderItems();
      drawWheel();
      return;
    }
  });

  function parseBulk(text){
    const lines = text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    const out = [];
    for (const line of lines){
      const parts = line.includes("|") ? line.split("|") : line.split(",");
      const p = parts.map(x=>x.trim()).filter(x => x.length>0);
      if (p.length < 2) continue;
      const c1 = p[2] ? safeColor(p[2], "#888888") : "#888888";
      out.push({
        name: p[0],
        table: p[1],
        color1: c1,
        color2: p[3] ? safeColor(p[3], adjustHex(c1, -0.22)) : adjustHex(c1, -0.22),
        textColor: p[4] ? safeColor(p[4], "#ffffff") : "#ffffff",
      });
    }
    return out;
  }

  // ------------------ Prize Sequential ------------------
  function cleanPrizeList(text){
    return (text || "")
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  function getNextPrizeAndAdvance(){
    const list = state.settings.prizeList || [];
    if (!list.length) return "";

    let cursor = Number(state.settings.prizeCursor) || 0;
    if (cursor >= list.length){
      if (state.settings.prizeExhausted === "loop") cursor = 0;
      else return "";
    }

    const prize = (list[cursor] || "").toString();
    state.settings.prizeCursor = cursor + 1;
    return prize;
  }

  function syncPrizePills(){
    const list = state.settings.prizeList || [];
    const cursor = clamp(Number(state.settings.prizeCursor)||0, 0, list.length);

    if (!list.length) prizeNextPill.textContent = "Next: -";
    else if (cursor >= list.length) prizeNextPill.textContent = "Next: (end)";
    else prizeNextPill.textContent = `Next: ${list[cursor]}`;

    spinCountPill.textContent = `Spin: ${Number(state.settings.spinCount)||0}`;
  }

  // ------------------ Spin ------------------
  function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

  function doSpin(){
    if (state.isSpinning) return;
    if (state.options.length < 2) return toast("Minimal 2 opsi untuk spin.", "error");
    if (document.body.classList.contains("modal-open")) closeWinnerModal();

    if (state.settings.soundEnabled === "on") ensureAudioCtx();

    state.isSpinning = true;
    document.body.classList.add("spinning");
    spinBtn.disabled = true;

    const preOptions = state.options;
    const n = preOptions.length;
    const arc = TWO_PI / n;

    const winnerIdx = Math.floor(Math.random() * n);
    const safeOffset = (Math.random() * arc * 0.85) + (arc * 0.075);
    const rel = winnerIdx * arc + safeOffset;

    const finalNorm = normalizeAngle(TWO_PI - rel);
    const currentNorm = normalizeAngle(state.rotation);
    const deltaToFinal = normalizeAngle(finalNorm - currentNorm);

    const minS = clamp(Number(state.settings.minSpins) || 6, 1, 80);
    const maxS = clamp(Number(state.settings.maxSpins) || 10, minS, 120);
    const extraSpins = minS + Math.floor(Math.random() * (maxS - minS + 1));

    const startRot = state.rotation;
    const targetRot = state.rotation + extraSpins * TWO_PI + deltaToFinal;
    const duration = clamp(Number(state.settings.spinDurationMs) || 4200, 800, 20000);

    const t0 = performance.now();

    const tick = (now) => {
      const t = clamp((now - t0) / duration, 0, 1);
      const eased = easeOutCubic(t);

      state.rotation = startRot + (targetRot - startRot) * eased;
      drawWheel();

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        state.isSpinning = false;
        document.body.classList.remove("spinning");
        spinBtn.disabled = false;

        const finalIndex = getSelectedIndex(state.rotation, preOptions.length);
        const winnerItem = preOptions[finalIndex];

        frozenWheel = { rotation: state.rotation, options: clone(preOptions), winnerIndex: finalIndex };

        const prize = getNextPrizeAndAdvance();
        state.settings.spinCount = (Number(state.settings.spinCount) || 0) + 1;

        state.lastWinner = {
          name: winnerItem?.name ?? "",
          table: winnerItem?.table ?? "",
          prize: prize || "—"
        };

        state.lastRemoved = null;
        if (state.settings.removeAfterWin === "on") {
          state.lastRemoved = { item: clone(winnerItem), index: finalIndex };
          state.options.splice(finalIndex, 1);
          toast("Winner removed from list.", "info");
        }

        saveState();
        renderItems();
        syncWinnerInline();
        syncPrizePills();
        drawWheel();

        spawnConfetti();
        playWinSound();
        openWinnerModal();
      }
    };

    requestAnimationFrame(tick);
  }

  async function toggleFullscreen(){
    try{
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    }catch{
      toast("Fullscreen blocked by browser.", "error");
    }
  }

  // ------------------ Theme apply (Slices) ------------------
  function getThemeBaseColor(i, n, mode, colors){
    const palette = Array.isArray(colors) ? colors.filter(Boolean) : [];
    const safePalette = palette.length ? palette : clone(defaultState.settings.themeStudio.colors);
    if (mode === "mono") return safePalette[0];
    if (mode === "alternate") return safePalette[i % safePalette.length];
    if (safePalette.length === 1 || n <= 1) return safePalette[0];

    const t = i / Math.max(1, n - 1);
    const scaled = t * (safePalette.length - 1);
    const leftIndex = Math.floor(scaled);
    const rightIndex = Math.min(safePalette.length - 1, leftIndex + 1);
    const mixT = scaled - leftIndex;
    return mixHex(safePalette[leftIndex], safePalette[rightIndex], mixT);
  }

  function applyThemeToAll(){
    const ts = state.settings.themeStudio;
    const palette = Array.isArray(ts.colors) && ts.colors.length ? ts.colors : clone(defaultState.settings.themeStudio.colors);
    const mode = ts.mode;
    const lighten = Number(ts.lighten), darken = Number(ts.darken);
    const txt = ts.text;

    const n = state.options.length;
    state.options = state.options.map((o,i) => {
      const base = getThemeBaseColor(i, Math.max(1,n), mode, palette);
      const c1 = adjustHex(base, lighten);
      const c2 = adjustHex(base, darken);
      return { ...o, color1: c1, color2: c2, textColor: txt };
    });

    saveState();
    renderItems();
    drawWheel();
    toast("Theme applied to all slices.", "success");
  }

  function randomizeTheme(){
    const randHex = () => "#" + Math.floor(Math.random()*0xffffff).toString(16).padStart(6,"0");
    const current = Array.isArray(state.settings.themeStudio.colors) && state.settings.themeStudio.colors.length
      ? state.settings.themeStudio.colors.length
      : defaultState.settings.themeStudio.colors.length;
    state.settings.themeStudio.colors = Array.from({ length: current }, randHex);
    syncThemeInputs();
    saveState();
    toast("Random theme generated.", "info");
  }

  function renderThemePalette(){
    const colors = state.settings.themeStudio.colors;
    themePaletteList.innerHTML = "";
    colors.forEach((color, idx) => {
      const item = document.createElement("label");
      item.className = "themeColorItem";

      const label = document.createElement("span");
      label.textContent = `Color ${idx + 1}`;

      const input = document.createElement("input");
      input.type = "color";
      input.value = safeColor(color, defaultState.settings.themeStudio.colors[idx % defaultState.settings.themeStudio.colors.length]);
      input.dataset.index = String(idx);

      item.append(label, input);
      themePaletteList.appendChild(item);
    });
  }

  function syncThemeInputs(){
    const ts = state.settings.themeStudio;
    if (!Array.isArray(ts.colors) || !ts.colors.length) ts.colors = clone(defaultState.settings.themeStudio.colors);
    themeText.value = safeColor(ts.text, "#ffffff");
    themeMode.value = ts.mode;
    themeLighten.value = String(ts.lighten);
    themeDarken.value = String(ts.darken);
    renderThemePalette();
  }

  // Background Studio sync
  function syncBackgroundInputs(){
    const bg = state.settings.background;
    bgMode.value = bg.mode;
    bgSolid.value = safeColor(bg.solid, "#0b1020");
    bgTop.value = safeColor(bg.top, "#070814");
    bgBottom.value = safeColor(bg.bottom, "#040508");
    bgGlowA.value = safeColor(bg.glowA, "#60a5fa");
    bgGlowB.value = safeColor(bg.glowB, "#a78bfa");
  }

  function syncAllInputs(){
    prizeListInput.value = (state.settings.prizeList || []).join("\n");
    prizeExhausted.value = state.settings.prizeExhausted || "loop";

    confettiEnabled.value = state.settings.confettiEnabled || "on";
    soundEnabled.value = state.settings.soundEnabled || "on";
    soundVolume.value = String(clamp(Number(state.settings.soundVolume)||0.7, 0, 1));

    gradientMode.value = state.settings.gradient;
    removeAfterWin.value = state.settings.removeAfterWin;
    contourWidth.value = String(state.settings.contourWidth);
    contourColor.value = safeColor(state.settings.contourColor, "#0b1020");
    outerBorderWidth.value = String(state.settings.outerBorderWidth);
    outerBorderColor.value = safeColor(state.settings.outerBorderColor, "#ffffff");
    spinDurationMs.value = String(state.settings.spinDurationMs);
    minSpins.value = String(state.settings.minSpins);
    maxSpins.value = String(state.settings.maxSpins);
    textOrientation.value = state.settings.textOrientation || "wheel";
    nameFontSize.value = String(Math.max(1, Number(state.settings.nameFontSize) || defaultState.settings.nameFontSize));
    tableFontSize.value = String(Math.max(1, Number(state.settings.tableFontSize) || defaultState.settings.tableFontSize));

    syncThemeInputs();
    syncBackgroundInputs();

    syncWinnerInline();
    syncCount();
    syncPrizePills();

    applyBackgroundToDOM(); // 🔥 ensure body bg applied on load
  }

  // ------------------ Events ------------------
  openDrawerBtn.addEventListener("click", () => openDrawer(state.activeTab || "list"));
  drawerCloseBtn.addEventListener("click", closeDrawer);
  drawerBackdrop.addEventListener("click", closeDrawer);

  tabBtns.forEach(btn => btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    state.activeTab = tab;
    saveState();
    setActiveTab(tab);
  }));

  document.querySelector(".fabStack").addEventListener("click", (e) => {
    const b = e.target.closest(".fabBtn");
    if (!b) return;
    const tab = b.dataset.openTab;
    if (tab) openDrawer(tab);
  });

  spinBtn.addEventListener("click", doSpin);
  winnerInline.addEventListener("click", openWinnerModal);

  winnerCloseBtn.addEventListener("click", closeWinnerModal);
  winnerModalBackdrop.addEventListener("click", closeWinnerModal);
  spinAgainBtn.addEventListener("click", () => { closeWinnerModal(); doSpin(); });

  undoRemoveBtn.addEventListener("click", () => {
    if (!state.lastRemoved) return;
    const { item, index } = state.lastRemoved;
    const insertAt = clamp(Number(index) || 0, 0, state.options.length);
    state.options.splice(insertAt, 0, item);
    state.lastRemoved = null;
    saveState();
    renderItems();
    drawWheel();
    toast("Undo: winner restored.", "success");
    undoRemoveBtn.style.display = "none";
  });

  quickAddBtn.addEventListener("click", () => {
    const name = (quickName.value || "").trim();
    const table = (quickTable.value || "").trim();
    if (!name) return toast("Nama wajib diisi.", "error");

    state.options.push({ name, table, color1:"#888888", color2:"#555555", textColor:"#ffffff" });

    quickName.value = "";
    quickTable.value = "";
    saveState();
    renderItems();
    drawWheel();
    toast("Item added.", "success");
  });

  autoColorsBtn.addEventListener("click", () => {
    const n = state.options.length;
    state.options = state.options.map((o,i) => {
      const h = (i * 360 / Math.max(1,n)) % 360;
      const base = hslToHex(h, 85, 60);
      return { ...o, color1: adjustHex(base, +0.08), color2: adjustHex(base, -0.22) };
    });
    saveState();
    renderItems();
    drawWheel();
    toast("Auto colors applied.", "success");
  });

  autoTextBtn.addEventListener("click", () => {
    function luminance(hex){
      const {r,g,b} = hexToRgb(hex);
      const a = [r,g,b].map(v => {
        v/=255;
        return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
      });
      return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2];
    }
    state.options = state.options.map(o => {
      const c = safeColor(o.color1, "#888888");
      return { ...o, textColor: (luminance(c) > 0.55 ? "#111111" : "#ffffff") };
    });
    saveState();
    renderItems();
    drawWheel();
    toast("Auto text applied.", "success");
  });

  clearWinnerBtn.addEventListener("click", () => {
    state.lastWinner = null;
    state.lastRemoved = null;
    frozenWheel = null;
    saveState();
    syncWinnerInline();
    drawWheel();
    toast("Winner cleared.", "info");
  });

  searchInput.addEventListener("input", renderItems);

  bulkReplaceBtn.addEventListener("click", () => {
    const parsed = parseBulk(bulkInput.value);
    if (!parsed.length) return toast("Bulk invalid. Minimal: Nama|S1 per baris.", "error");
    state.options = parsed;
    state.lastWinner = null;
    state.lastRemoved = null;
    frozenWheel = null;
    saveState();
    renderItems();
    drawWheel();
    syncWinnerInline();
    toast("List replaced from bulk.", "success");
  });

  bulkAppendBtn.addEventListener("click", () => {
    const parsed = parseBulk(bulkInput.value);
    if (!parsed.length) return toast("Bulk invalid. Minimal: Nama|S1 per baris.", "error");
    state.options.push(...parsed);
    saveState();
    renderItems();
    drawWheel();
    toast("Bulk appended.", "success");
  });

  // Prize settings
  prizeListInput.addEventListener("input", () => {
    state.settings.prizeList = cleanPrizeList(prizeListInput.value);
    state.settings.prizeCursor = clamp(Number(state.settings.prizeCursor)||0, 0, state.settings.prizeList.length);
    scheduleSave();
    syncPrizePills();
  });

  prizeExhausted.addEventListener("change", () => {
    state.settings.prizeExhausted = prizeExhausted.value;
    saveState();
    syncPrizePills();
  });

  resetPrizeCursorBtn.addEventListener("click", () => {
    state.settings.prizeCursor = 0;
    state.settings.spinCount = 0;
    saveState();
    syncPrizePills();
    toast("Prize reset to #1.", "info");
  });

  // Celebration settings
  confettiEnabled.addEventListener("change", () => { state.settings.confettiEnabled = confettiEnabled.value; saveState(); });
  soundEnabled.addEventListener("change", () => { state.settings.soundEnabled = soundEnabled.value; saveState(); });
  soundVolume.addEventListener("input", () => {
    state.settings.soundVolume = clamp(Number(soundVolume.value)||0.7, 0, 1);
    scheduleSave();
  });

  soundFileInput.addEventListener("change", () => {
    const f = soundFileInput.files && soundFileInput.files[0];
    if (!f) return;
    if (uploadedAudioUrl) URL.revokeObjectURL(uploadedAudioUrl);
    uploadedAudioUrl = URL.createObjectURL(f);
    toast("Custom sound loaded.", "success");
  });

  // Wheel settings
  gradientMode.addEventListener("change", () => { state.settings.gradient = gradientMode.value; saveState(); drawWheel(); });
  removeAfterWin.addEventListener("change", () => { state.settings.removeAfterWin = removeAfterWin.value; saveState(); toast(`Auto remove: ${removeAfterWin.value.toUpperCase()}`, "info"); });
  contourWidth.addEventListener("input", () => { state.settings.contourWidth = clamp(Number(contourWidth.value)||0,0,30); saveState(); drawWheel(); });
  contourColor.addEventListener("input", () => { state.settings.contourColor = contourColor.value; saveState(); drawWheel(); });
  outerBorderWidth.addEventListener("input", () => { state.settings.outerBorderWidth = clamp(Number(outerBorderWidth.value)||0,0,40); saveState(); drawWheel(); });
  outerBorderColor.addEventListener("input", () => { state.settings.outerBorderColor = outerBorderColor.value; saveState(); drawWheel(); });
  spinDurationMs.addEventListener("input", () => { state.settings.spinDurationMs = clamp(Number(spinDurationMs.value)||4200,800,20000); saveState(); });
  minSpins.addEventListener("input", () => {
    state.settings.minSpins = clamp(Number(minSpins.value)||1,1,80);
    state.settings.maxSpins = Math.max(state.settings.maxSpins, state.settings.minSpins);
    maxSpins.value = String(state.settings.maxSpins);
    saveState();
  });
  maxSpins.addEventListener("input", () => {
    state.settings.maxSpins = clamp(Number(maxSpins.value)||1,1,120);
    state.settings.minSpins = Math.min(state.settings.minSpins, state.settings.maxSpins);
    minSpins.value = String(state.settings.minSpins);
    saveState();
  });
  textOrientation.addEventListener("change", () => { state.settings.textOrientation = textOrientation.value; saveState(); drawWheel(); });
  nameFontSize.addEventListener("input", () => {
    state.settings.nameFontSize = Math.max(1, Number(nameFontSize.value) || defaultState.settings.nameFontSize);
    scheduleSave();
    drawWheel();
  });
  tableFontSize.addEventListener("input", () => {
    state.settings.tableFontSize = Math.max(1, Number(tableFontSize.value) || defaultState.settings.tableFontSize);
    scheduleSave();
    drawWheel();
  });

  // Theme studio (slices)
  themeText.addEventListener("input", () => {
    state.settings.themeStudio.text = themeText.value;
    saveState();
  });
  themeMode.addEventListener("change", () => { state.settings.themeStudio.mode = themeMode.value; saveState(); });
  themeLighten.addEventListener("input", () => { state.settings.themeStudio.lighten = Number(themeLighten.value); saveState(); });
  themeDarken.addEventListener("input", () => { state.settings.themeStudio.darken = Number(themeDarken.value); saveState(); });
  themePaletteList.addEventListener("input", (e) => {
    const input = e.target.closest('input[type="color"]');
    if (!input) return;
    const idx = Number(input.dataset.index);
    if (!Number.isFinite(idx)) return;
    state.settings.themeStudio.colors[idx] = input.value;
    saveState();
  });
  addThemeColorBtn.addEventListener("click", () => {
    const palette = state.settings.themeStudio.colors;
    const seed = defaultState.settings.themeStudio.colors[palette.length % defaultState.settings.themeStudio.colors.length];
    palette.push(seed);
    syncThemeInputs();
    saveState();
    toast("Theme color added.", "info");
  });
  removeThemeColorBtn.addEventListener("click", () => {
    const palette = state.settings.themeStudio.colors;
    if (palette.length <= 2) return toast("Minimal 2 warna untuk palette.", "error");
    palette.pop();
    syncThemeInputs();
    saveState();
    toast("Theme color removed.", "info");
  });
  applyThemeBtn.addEventListener("click", applyThemeToAll);
  randomThemeBtn.addEventListener("click", randomizeTheme);

  // Background studio bindings
  bgMode.addEventListener("change", () => {
    state.settings.background.mode = bgMode.value;
    saveState();
    applyBackgroundToDOM();
  });

  [bgSolid, bgTop, bgBottom, bgGlowA, bgGlowB].forEach(inp => inp.addEventListener("input", () => {
    state.settings.background.solid = bgSolid.value;
    state.settings.background.top = bgTop.value;
    state.settings.background.bottom = bgBottom.value;
    state.settings.background.glowA = bgGlowA.value;
    state.settings.background.glowB = bgGlowB.value;
    // apply live
    scheduleSave();
    applyBackgroundToDOM();
  }));

  applyBgBtn.addEventListener("click", () => {
    applyBackgroundToDOM();
    saveState();
    toast("Background applied.", "success");
  });

  resetBgBtn.addEventListener("click", () => {
    state.settings.background = clone(defaultState.settings.background);
    saveState();
    syncBackgroundInputs();
    applyBackgroundToDOM();
    toast("Background reset.", "info");
  });

  // Export/Import
  exportBtn.addEventListener("click", async () => {
    const data = JSON.stringify(state, null, 2);
    jsonBox.value = data;
    try{
      await navigator.clipboard.writeText(data);
      toast("Export copied to clipboard.", "success");
    }catch{
      toast("Export in box (clipboard blocked).", "info");
    }
  });

  importBtn.addEventListener("click", () => {
    const raw = (jsonBox.value || "").trim();
    if (!raw) return toast("Paste JSON first.", "error");
    try{
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.options)) throw new Error("options must be array");

      state = Object.assign(clone(defaultState), parsed);
      state.settings = Object.assign(clone(defaultState.settings), parsed.settings || {});
      state.settings.themeStudio = Object.assign(clone(defaultState.settings.themeStudio), parsed.settings?.themeStudio || {});
      state.settings.background = Object.assign(clone(defaultState.settings.background), parsed.settings?.background || {});
      state.options = Array.isArray(state.options) ? state.options : clone(defaultState.options);

      const importedLegacyTheme = parsed.settings?.themeStudio || {};
      const importedLegacyColors = [importedLegacyTheme.a, importedLegacyTheme.b, importedLegacyTheme.c].filter(Boolean);
      state.settings.themeStudio.colors = Array.isArray(state.settings.themeStudio.colors)
        ? state.settings.themeStudio.colors.filter(Boolean)
        : importedLegacyColors;
      if (!state.settings.themeStudio.colors.length) state.settings.themeStudio.colors = clone(defaultState.settings.themeStudio.colors);

      if (!Array.isArray(state.settings.prizeList)) state.settings.prizeList = clone(defaultState.settings.prizeList);
      state.settings.prizeCursor = clamp(Number(state.settings.prizeCursor)||0, 0, state.settings.prizeList.length);
      state.settings.spinCount = clamp(Number(state.settings.spinCount)||0, 0, 999999);
      state.settings.soundVolume = clamp(Number(state.settings.soundVolume)||0.7, 0, 1);
      state.settings.nameFontSize = Math.max(1, Number(state.settings.nameFontSize) || defaultState.settings.nameFontSize);
      state.settings.tableFontSize = Math.max(1, Number(state.settings.tableFontSize) || defaultState.settings.tableFontSize);

      frozenWheel = null;
      saveState();

      syncAllInputs();
      renderItems();
      drawWheel();
      syncWinnerInline();
      applyBackgroundToDOM();

      toast("Import success.", "success");
    }catch(err){
      toast("Import failed: " + (err?.message || "Invalid JSON"), "error");
    }
  });

  resetAllBtn.addEventListener("click", () => {
    if (!confirm("Reset to defaults?")) return;
    state = clone(defaultState);
    frozenWheel = null;
    saveState();
    syncAllInputs();
    renderItems();
    drawWheel();
    toast("Reset done.", "info");
  });

  clearStorageBtn.addEventListener("click", () => {
    if (!confirm("Clear storage (localStorage)?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = clone(defaultState);
    frozenWheel = null;
    saveState();
    syncAllInputs();
    renderItems();
    drawWheel();
    toast("Storage cleared.", "info");
  });

  fullscreenBtn.addEventListener("click", toggleFullscreen);
  fabFullscreenBtn.addEventListener("click", toggleFullscreen);

  // Shortcuts (disable when typing / inside drawer)
  window.addEventListener("keydown", (e) => {
    const t = e.target;
    const isTyping =
      t instanceof HTMLElement &&
      (t.matches("input, textarea, select") || t.isContentEditable || t.closest("aside.drawer"));

    if (isTyping) return;

    if (e.key === " " && !e.repeat) { e.preventDefault(); doSpin(); return; }

    if (e.key === "Escape") {
      if (document.body.classList.contains("modal-open")) { closeWinnerModal(); return; }
      if (document.body.classList.contains("drawer-open")) { closeDrawer(); return; }
      return;
    }

    if (e.key.toLowerCase() === "s") openDrawer(state.activeTab || "list");
    if (e.key.toLowerCase() === "f") toggleFullscreen();
  });

  // init
  syncAllInputs();
  setActiveTab(state.activeTab || "list");
  renderItems();
  syncWinnerInline();
  applyBackgroundToDOM();
  drawWheel();
  resizeConfetti();

  window.addEventListener("resize", () => {
    drawWheel();
    resizeConfetti();
  });
})();
