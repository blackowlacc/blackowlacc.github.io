(() => {
  const STORAGE_KEY = "black_owl_wheel_v3_1";
  const $ = (id) => document.getElementById(id);

  // Canvas
  const canvas = $("wheelCanvas");
  const ctx = canvas.getContext("2d");

  // Main controls
  const spinBtn = $("spinBtn");
  const winnerInline = $("winnerInline");
  const winnerInlineText = $("winnerInlineText");

  // Header buttons
  const openDrawerBtn = $("openDrawerBtn");
  const fullscreenBtn = $("fullscreenBtn");
  const fabFullscreenBtn = $("fabFullscreenBtn");

  // FAB
  const fabStack = document.querySelector(".fabStack");

  // Drawer
  const drawer = $("drawer");
  const drawerBackdrop = $("drawerBackdrop");
  const drawerCloseBtn = $("drawerCloseBtn");
  const tabBtns = Array.from(document.querySelectorAll(".tabBtn"));
  const tabPanels = Array.from(document.querySelectorAll(".tabPanel"));

  // List tab elements
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

  // Theme tab
  const themeA = $("themeA");
  const themeB = $("themeB");
  const themeC = $("themeC");
  const themeText = $("themeText");
  const themeMode = $("themeMode");
  const themeStops = $("themeStops");
  const themeLighten = $("themeLighten");
  const themeDarken = $("themeDarken");
  const applyThemeBtn = $("applyThemeBtn");
  const randomThemeBtn = $("randomThemeBtn");
  const palettePreview = $("palettePreview");
  const paletteLabel = $("paletteLabel");

  const overlayEnabled = $("overlayEnabled");
  const overlayAlpha = $("overlayAlpha");
  const overlayA = $("overlayA");
  const overlayB = $("overlayB");

  // UI colors advanced
  const uiBg0 = $("uiBg0");
  const uiBg1 = $("uiBg1");
  const uiAccentA = $("uiAccentA");
  const uiAccentB = $("uiAccentB");
  const uiText = $("uiText");
  const uiMuted = $("uiMuted");
  const uiLine = $("uiLine");
  const uiDanger = $("uiDanger");
  const uiBrandGold = $("uiBrandGold");
  const uiPointerOuter = $("uiPointerOuter");
  const uiPointerInner = $("uiPointerInner");
  const uiEffects = $("uiEffects");
  const uiGrid = $("uiGrid");
  const resetUiBtn = $("resetUiBtn");

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

  // Text settings
  const fontFamily = $("fontFamily");
  const fontStyle = $("fontStyle");
  const nameFontSize = $("nameFontSize");
  const tableFontSize = $("tableFontSize");
  const nameFontWeight = $("nameFontWeight");
  const tableFontWeight = $("tableFontWeight");
  const textOrientation = $("textOrientation");

  // Center tab
  const centerImageInput = $("centerImageInput");
  const removeCenterImageBtn = $("removeCenterImageBtn");
  const centerRadius = $("centerRadius");
  const centerBg = $("centerBg");
  const centerImageScale = $("centerImageScale");
  const centerPreview = $("centerPreview");

  // Export tab
  const exportBtn = $("exportBtn");
  const importBtn = $("importBtn");
  const resetAllBtn = $("resetAllBtn");
  const clearStorageBtn = $("clearStorageBtn");
  const jsonBox = $("jsonBox");

  // Winner modal
  const winnerModalBackdrop = $("winnerModalBackdrop");
  const winnerModal = $("winnerModal");
  const winnerCloseBtn = $("winnerCloseBtn");
  const winnerName = $("winnerName");
  const winnerTable = $("winnerTable");
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
  function hexToRgba(hex, a){
    const {r,g,b} = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
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

  function mixHex(a, b, t){
    const A = hexToRgb(a), B = hexToRgb(b);
    const lerp = (x,y,t) => x + (y-x)*t;
    return rgbToHex({ r: lerp(A.r,B.r,t), g: lerp(A.g,B.g,t), b: lerp(A.b,B.b,t) });
  }

  function safeColor(value, fallback){
    let v = (value || "").toString().trim();
    if (!v) return fallback;
    if (!v.startsWith("#")) v = "#" + v;
    if (v.length === 4) v = "#" + v.slice(1).split("").map(ch => ch + ch).join("");
    if (v.length !== 7) return fallback;
    return v;
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

  const defaultState = {
    rotation: 0,
    isSpinning: false,
    activeTab: "list",
    lastWinner: null,
    lastRemoved: null, // { item, index }
    centerImageDataUrl: null,
    options: [
      { name: "Budi", table: "S1", color1: "#ff6b6b", color2: "#c92a2a", textColor: "#ffffff" },
      { name: "Citra", table: "V1", color1: "#ffd43b", color2: "#e67700", textColor: "#111111" },
      { name: "Dewi", table: "T1", color1: "#69db7c", color2: "#2f9e44", textColor: "#111111" },
      { name: "Eka",  table: "S2", color1: "#74c0fc", color2: "#1c7ed6", textColor: "#ffffff" },
      { name: "Fajar",table: "V2", color1: "#b197fc", color2: "#7048e8", textColor: "#ffffff" },
    ],
    settings: {
      gradient: "on",
      removeAfterWin: "on",

      contourWidth: 2,
      contourColor: "#0b1020",
      outerBorderWidth: 6,
      outerBorderColor: "#ffffff",
      spinDurationMs: 4200,
      minSpins: 6,
      maxSpins: 10,

      // text settings
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
      fontStyle: "normal",
      nameFontSize: 16,
      tableFontSize: 13,
      nameFontWeight: 900,
      tableFontWeight: 700,
      textOrientation: "wheel", // wheel | upright

      centerRadius: 78,
      centerBg: "#0f1730",
      centerImageScale: 1.0,

      themeStudio: {
        a: "#60a5fa",
        b: "#a78bfa",
        c: "#22c55e",
        stops: 2, // 2 or 3
        text: "#ffffff",
        mode: "spectrum", // spectrum | alternate | mono
        lighten: 0.08,
        darken: -0.22,
      },
      overlay: {
        enabled: "off",
        alpha: 0.18,
        a: "#22c55e",
        b: "#3b82f6",
      },
      ui: {
        bg0: "#070a14",
        bg1: "#0b1022",
        accentA: "#60a5fa",
        accentB: "#a78bfa",
        text: "#eaf0ff",
        muted: "#aab3d7",
        line: "#ffffff",
        danger: "#ff6b6b",
        brandGold: "#c8a85a",
        pointerOuter: "#ffffff",
        pointerInner: "#60a5fa",
        effects: "on",
        grid: "on",
      }
    }
  };

  let state = loadState();
  let centerImage = null;
  let saveTimer = null;
  let toastTimer = null;

  // freeze wheel render (so winner slice stays visible behind modal even after auto-remove)
  let frozenWheel = null;

  function toast(msg, variant="info"){
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.dataset.variant = variant;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>toastEl.classList.remove("show"), 2200);
  }

  function scheduleSave(){
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 180);
  }

  function saveState(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(defaultState);
      const parsed = JSON.parse(raw);

      const merged = clone(defaultState);
      Object.assign(merged, parsed);

      merged.settings = Object.assign(clone(defaultState.settings), parsed.settings || {});
      merged.settings.themeStudio = Object.assign(clone(defaultState.settings.themeStudio), (parsed.settings?.themeStudio)||{});
      merged.settings.overlay = Object.assign(clone(defaultState.settings.overlay), (parsed.settings?.overlay)||{});
      merged.settings.ui = Object.assign(clone(defaultState.settings.ui), (parsed.settings?.ui)||{});
      merged.options = Array.isArray(parsed.options) ? parsed.options : clone(defaultState.options);

      // ensure new fields exist
      merged.settings.themeStudio.c = merged.settings.themeStudio.c || defaultState.settings.themeStudio.c;
      merged.settings.themeStudio.stops = Number(merged.settings.themeStudio.stops || defaultState.settings.themeStudio.stops);

      merged.settings.nameFontSize = Number(merged.settings.nameFontSize || defaultState.settings.nameFontSize);
      merged.settings.tableFontSize = Number(merged.settings.tableFontSize || defaultState.settings.tableFontSize);
      merged.settings.nameFontWeight = Number(merged.settings.nameFontWeight || defaultState.settings.nameFontWeight);
      merged.settings.tableFontWeight = Number(merged.settings.tableFontWeight || defaultState.settings.tableFontWeight);
      merged.settings.textOrientation = merged.settings.textOrientation || defaultState.settings.textOrientation;

      return merged;
    }catch{
      return clone(defaultState);
    }
  }

  function applyUiTheme(){
    const ui = state.settings.ui;

    document.documentElement.style.setProperty("--bg0", ui.bg0);
    document.documentElement.style.setProperty("--bg1", ui.bg1);

    document.documentElement.style.setProperty("--text", ui.text);
    document.documentElement.style.setProperty("--muted", ui.muted);
    document.documentElement.style.setProperty("--line", hexToRgba(ui.line, 0.10));

    document.documentElement.style.setProperty("--accentA", ui.accentA);
    document.documentElement.style.setProperty("--accentB", ui.accentB);

    document.documentElement.style.setProperty("--accentA_glow", hexToRgba(ui.accentA, 0.22));
    document.documentElement.style.setProperty("--accentB_glow", hexToRgba(ui.accentB, 0.18));
    document.documentElement.style.setProperty("--accentA_btn1", hexToRgba(ui.accentA, 0.45));
    document.documentElement.style.setProperty("--accentA_btn2", hexToRgba(ui.accentA, 0.20));
    document.documentElement.style.setProperty("--accentA_border", hexToRgba(ui.accentA, 0.55));
    document.documentElement.style.setProperty("--accentA_shadow", hexToRgba(ui.accentA, 0.14));

    document.documentElement.style.setProperty("--danger", ui.danger);
    document.documentElement.style.setProperty("--danger_border", hexToRgba(ui.danger, 0.55));

    document.documentElement.style.setProperty("--brandGold", ui.brandGold);
    document.documentElement.style.setProperty("--pointerOuter", ui.pointerOuter);
    document.documentElement.style.setProperty("--pointerInner", ui.pointerInner);

    document.body.classList.toggle("no-effects", ui.effects === "off");
    document.body.classList.toggle("no-grid", ui.grid === "off");
  }

  // ---------- Drawer ----------
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

  // ---------- Winner Modal ----------
  function openWinnerModal(){
    if (!state.lastWinner) return;

    const w = state.lastWinner;
    winnerName.textContent = w.name || "-";
    winnerTable.textContent = w.table ? `Table: ${w.table}` : "-";

    const a = w.color1 || "#60a5fa";
    const b = w.color2 || adjustHex(a, -0.22);
    winnerModal.style.background =
      `radial-gradient(700px 300px at 20% 0%, ${hexToRgba(a, 0.18)}, transparent 60%),
       radial-gradient(700px 300px at 90% 10%, ${hexToRgba(b, 0.14)}, transparent 60%),
       linear-gradient(180deg, rgba(0,0,0,.42), rgba(0,0,0,.24))`;

    // show undo only if we removed someone
    undoRemoveBtn.style.display = state.lastRemoved ? "" : "none";

    document.body.classList.add("modal-open");
    winnerModalBackdrop.setAttribute("aria-hidden", "false");
    winnerModal.setAttribute("aria-hidden", "false");
  }

  function closeWinnerModal(){
    document.body.classList.remove("modal-open");
    winnerModalBackdrop.setAttribute("aria-hidden", "true");
    winnerModal.setAttribute("aria-hidden", "true");

    // unfreeze wheel now that popup is closed
    frozenWheel = null;
    drawWheel();
  }

  // ---------- canvas ----------
  function resizeCanvas(){
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(10, Math.floor(rect.width));
    const h = Math.max(10, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  function getSelectedIndex(rotation, optionsLen){
    const n = optionsLen;
    if (!n) return null;
    const arc = TWO_PI / n;
    const rel = normalizeAngle(-rotation);
    return clamp(Math.floor(rel / arc), 0, n - 1);
  }

  function drawCenter(cx, cy){
    const r = clamp(Number(state.settings.centerRadius) || 78, 20, 260);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TWO_PI);
    ctx.fillStyle = state.settings.centerBg || "#0f1730";
    ctx.fill();
    ctx.restore();

    if (centerImage) {
      const scaleMul = clamp(Number(state.settings.centerImageScale) || 1, 0.6, 2);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TWO_PI);
      ctx.clip();

      const iw = centerImage.naturalWidth || centerImage.width;
      const ih = centerImage.naturalHeight || centerImage.height;
      const target = r * 2;

      const coverScale = Math.max(target / iw, target / ih) * scaleMul;
      const dw = iw * coverScale;
      const dh = ih * coverScale;
      ctx.drawImage(centerImage, cx - dw/2, cy - dh/2, dw, dh);

      ctx.restore();
    } else {
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,.92)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `900 18px ${state.settings.fontFamily || "system-ui"}`;
      ctx.fillText("SPIN", cx, cy);
      ctx.restore();
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TWO_PI);
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  function drawWheel(){
    const { w, h } = resizeCanvas();
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

    // back plate
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 3, 0, TWO_PI);
    ctx.fillStyle = "rgba(0,0,0,.14)";
    ctx.fill();
    ctx.restore();

    const ff = state.settings.fontFamily || "system-ui";
    const fstyle = state.settings.fontStyle || "normal";
    const nameSize = clamp(Number(state.settings.nameFontSize) || 16, 10, 40);
    const tableSize = clamp(Number(state.settings.tableFontSize) || 13, 8, 32);
    const nameW = clamp(Number(state.settings.nameFontWeight) || 900, 100, 950);
    const tableW = clamp(Number(state.settings.tableFontWeight) || 700, 100, 950);
    const orientation = state.settings.textOrientation || "wheel";

    for (let i=0; i<n; i++){
      const o = wheelOptions[i];
      const start = rotation + START_ANGLE_OFFSET + i*arc;
      const end = start + arc;

      // slice fill
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();

      const gradMode = state.settings.gradient === "on";
      if (gradMode) {
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

      // contour per slice
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

      // text 2 lines
      const mid = start + arc/2;
      const name = (o.name ?? "").toString();
      const table = (o.table ?? "").toString();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      ctx.translate(radius*0.66, 0);

      const ang = normalizeAngle(mid);

      // Fix "posisi tiba2 berubah":
      // default = follow wheel (no flip), optional upright flip with stable line order.
      let flip = false;
      if (orientation === "upright") {
        flip = ang > Math.PI/2 && ang < 3*Math.PI/2;
        if (flip) ctx.rotate(Math.PI);
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = o.textColor || "#ffffff";

      let nameY = -Math.max(8, nameSize * 0.55);
      let tableY = Math.max(10, tableSize * 0.85);

      // keep line order stable even if flipped
      if (flip) {
        nameY = -nameY;
        tableY = -tableY;
      }

      ctx.font = `${fstyle} ${nameW} ${nameSize}px ${ff}`;
      ctx.fillText(name, 0, nameY);

      ctx.font = `${fstyle} ${tableW} ${tableSize}px ${ff}`;
      ctx.fillText(table, 0, tableY);

      ctx.restore();
    }

    // overlay
    if (state.settings.overlay.enabled === "on" && Number(state.settings.overlay.alpha) > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, TWO_PI);
      ctx.clip();

      const g = ctx.createLinearGradient(cx-radius, cy-radius, cx+radius, cy+radius);
      g.addColorStop(0, state.settings.overlay.a || "#22c55e");
      g.addColorStop(1, state.settings.overlay.b || "#3b82f6");

      ctx.globalAlpha = clamp(Number(state.settings.overlay.alpha) || 0.18, 0, 0.8);
      ctx.fillStyle = g;
      ctx.fillRect(cx-radius, cy-radius, radius*2, radius*2);
      ctx.restore();
    }

    // outer border
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

    // highlight winner (when frozen wheel exists)
    if (frozenWheel && frozenWheel.winnerIndex != null) {
      const i = frozenWheel.winnerIndex;
      if (i >= 0 && i < n) {
        const start = rotation + START_ANGLE_OFFSET + i*arc;
        const end = start + arc;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, end);
        ctx.closePath();
        ctx.lineWidth = 7;
        ctx.strokeStyle = "rgba(255,255,255,.82)";
        ctx.stroke();
        ctx.restore();
      }
    }

    drawCenter(cx, cy);
  }

  // ---------- Theme Studio ----------
  function getThemeBaseColor(i, n, mode, a, b, c, stops){
    if (mode === "mono") return a;

    if (mode === "alternate") {
      if (stops === 3) {
        const m = i % 3;
        return m === 0 ? a : (m === 1 ? b : c);
      }
      return (i % 2 === 0) ? a : b;
    }

    // spectrum
    const t = (n === 1) ? 0 : (i/(n-1));
    if (stops === 3) {
      if (t < 0.5) return mixHex(a, b, t*2);
      return mixHex(b, c, (t-0.5)*2);
    }
    return mixHex(a, b, t);
  }

  function renderPalette(){
    const ts = state.settings.themeStudio;
    const a = ts.a, b = ts.b, c = ts.c;
    const mode = ts.mode;
    const stops = Number(ts.stops) === 3 ? 3 : 2;
    const lighten = Number(ts.lighten), darken = Number(ts.darken);

    // disable Color C input if stops=2 (UX)
    themeC.disabled = stops !== 3;
    themeC.title = (stops !== 3) ? "Set Stops=3 untuk pakai Color C" : "";

    const chipCount = Math.max(8, Math.min(16, state.options.length || 8));
    palettePreview.innerHTML = "";

    for (let i=0; i<chipCount; i++){
      const base = getThemeBaseColor(i, chipCount, mode, a, b, c, stops);
      const c1 = adjustHex(base, lighten);
      const c2 = adjustHex(base, darken);

      const chip = document.createElement("div");
      chip.className = "chip";

      const top = document.createElement("div");
      top.className = "chipTop";
      top.style.background = c1;

      const bot = document.createElement("div");
      bot.className = "chipBot";
      bot.style.background = c2;

      chip.append(top, bot);
      chip.title = `Color1: ${c1}\nColor2: ${c2}`;
      palettePreview.appendChild(chip);
    }

    const g = state.settings.gradient === "on" ? "Gradient ON" : "Gradient OFF";
    paletteLabel.textContent = `${mode} • ${stops} stops • ${g}`;
  }

  function applyThemeToAll(){
    const ts = state.settings.themeStudio;
    const a = ts.a, b = ts.b, c = ts.c;
    const mode = ts.mode;
    const stops = Number(ts.stops) === 3 ? 3 : 2;
    const lighten = Number(ts.lighten), darken = Number(ts.darken);
    const txt = ts.text;

    const n = state.options.length;
    state.options = state.options.map((o,i) => {
      const base = getThemeBaseColor(i, Math.max(1,n), mode, a, b, c, stops);
      return {
        ...o,
        color1: adjustHex(base, lighten),
        color2: adjustHex(base, darken),
        textColor: txt,
      };
    });

    saveState();
    renderItems();
    drawWheel();
    toast("Theme applied to all slices.", "success");
  }

  function randomizeTheme(){
    const randHex = () => "#" + Math.floor(Math.random()*0xffffff).toString(16).padStart(6,"0");
    state.settings.themeStudio.a = randHex();
    state.settings.themeStudio.b = randHex();
    state.settings.themeStudio.c = randHex();
    saveState();
    syncThemeUI();
    renderPalette();
    drawWheel();
    toast("Random theme generated.", "info");
  }

  function applyPreset(name){
    const ts = state.settings.themeStudio;

    if (name === "neon") {
      ts.a = "#22d3ee"; ts.b = "#a78bfa"; ts.c = "#22c55e";
      ts.stops = 3;
      ts.text = "#0b1022";
      ts.mode = "spectrum";
      ts.lighten = 0.10; ts.darken = -0.30;
      state.settings.overlay.enabled = "on";
      state.settings.overlay.alpha = 0.18;
      state.settings.overlay.a = "#22c55e";
      state.settings.overlay.b = "#3b82f6";
    } else if (name === "pastel") {
      ts.a = "#fca5a5"; ts.b = "#93c5fd"; ts.c = "#a7f3d0";
      ts.stops = 3;
      ts.text = "#111827";
      ts.mode = "spectrum";
      ts.lighten = 0.12; ts.darken = -0.18;
      state.settings.overlay.enabled = "off";
    } else if (name === "corporate") {
      ts.a = "#60a5fa"; ts.b = "#22c55e"; ts.c = "#94a3b8";
      ts.stops = 2;
      ts.text = "#0b1022";
      ts.mode = "alternate";
      ts.lighten = 0.06; ts.darken = -0.22;
      state.settings.overlay.enabled = "off";
    } else if (name === "gold") {
      ts.a = "#c8a85a"; ts.b = "#6b7280"; ts.c = "#111827";
      ts.stops = 3;
      ts.text = "#ffffff";
      ts.mode = "alternate";
      ts.lighten = 0.08; ts.darken = -0.26;
      state.settings.overlay.enabled = "on";
      state.settings.overlay.alpha = 0.12;
      state.settings.overlay.a = "#c8a85a";
      state.settings.overlay.b = "#111827";
    } else if (name === "mono") {
      ts.a = "#94a3b8"; ts.b = "#94a3b8"; ts.c = "#94a3b8";
      ts.stops = 2;
      ts.text = "#0b1022";
      ts.mode = "mono";
      ts.lighten = 0.10; ts.darken = -0.18;
      state.settings.overlay.enabled = "off";
    }

    saveState();
    syncThemeUI();
    renderPalette();
    drawWheel();
    toast(`Preset applied: ${name}`, "success");
  }

  // ---------- List ----------
  function syncCount(){
    countPill.textContent = `${state.options.length} items`;
  }

  function syncWinnerInline(){
    if (!state.lastWinner) {
      winnerInlineText.textContent = "-";
      return;
    }
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
      card.dataset.index = String(idx);

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
      up.title = "Move up";

      const down = document.createElement("button");
      down.className = "smallBtn";
      down.textContent = "↓";
      down.dataset.action = "down";
      down.dataset.index = String(idx);
      down.title = "Move down";

      const del = document.createElement("button");
      del.className = "btn danger";
      del.style.padding = "8px 10px";
      del.style.borderRadius = "12px";
      del.textContent = "Del";
      del.dataset.action = "delete";
      del.dataset.index = String(idx);

      top.append(no, name, table, up, down, del);

      const details = document.createElement("details");
      details.className = "colorsDetails";

      const summary = document.createElement("summary");
      summary.className = "colorsSummary";

      const sw = document.createElement("span");
      sw.className = "swatch";
      sw.style.background = o.color1 || "#888888";
      summary.append(sw, document.createTextNode("Colors"));

      const grid = document.createElement("div");
      grid.className = "colorGrid";

      const c1 = document.createElement("input");
      c1.type = "color";
      c1.value = safeColor(o.color1, "#888888");
      c1.dataset.field = "color1";
      c1.dataset.index = String(idx);

      const c2 = document.createElement("input");
      c2.type = "color";
      c2.value = safeColor(o.color2, adjustHex(c1.value, -0.22));
      c2.dataset.field = "color2";
      c2.dataset.index = String(idx);
      c2.disabled = state.settings.gradient !== "on";
      c2.title = c2.disabled ? "Enable Gradient to use Color2" : "";

      const tx = document.createElement("input");
      tx.type = "color";
      tx.value = safeColor(o.textColor, "#ffffff");
      tx.dataset.field = "textColor";
      tx.dataset.index = String(idx);

      grid.append(c1, c2, tx);
      details.append(summary, grid);

      card.append(top, details);
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
      return;
    }

    if (field === "color1") {
      state.options[idx].color1 = t.value;
      const card = t.closest(".itemCard");
      const sw = card?.querySelector(".swatch");
      if (sw) sw.style.background = t.value;

      if (!state.options[idx].color2) state.options[idx].color2 = adjustHex(t.value, -0.22);
      scheduleSave();
      drawWheel();
      return;
    }

    if (field === "color2") {
      state.options[idx].color2 = t.value;
      scheduleSave();
      drawWheel();
      return;
    }

    if (field === "textColor") {
      state.options[idx].textColor = t.value;
      scheduleSave();
      drawWheel();
      return;
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

  // ---------- Bulk ----------
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

  // ---------- Spin ----------
  function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

  function doSpin(){
    if (state.isSpinning) return;
    if (state.options.length < 2) return toast("Minimal 2 opsi untuk spin.", "error");

    // close modal if open
    if (document.body.classList.contains("modal-open")) closeWinnerModal();

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

        // resolve winner on PRE-REMOVE wheel
        const finalIndex = getSelectedIndex(state.rotation, preOptions.length);
        const winnerItem = preOptions[finalIndex];

        // freeze wheel snapshot so it still shows correct winner slice behind modal
        frozenWheel = {
          rotation: state.rotation,
          options: clone(preOptions),
          winnerIndex: finalIndex,
        };

        state.lastWinner = {
          name: winnerItem?.name ?? "",
          table: winnerItem?.table ?? "",
          color1: winnerItem?.color1 ?? "#60a5fa",
          color2: winnerItem?.color2 ?? adjustHex(winnerItem?.color1 ?? "#60a5fa", -0.22),
          textColor: winnerItem?.textColor ?? "#ffffff"
        };

        // AUTO REMOVE winner from live list (so next spin won't include it)
        state.lastRemoved = null;
        if (state.settings.removeAfterWin === "on") {
          state.lastRemoved = { item: clone(winnerItem), index: finalIndex };
          state.options.splice(finalIndex, 1);
          toast("Winner removed from list.", "info");
        }

        saveState();
        renderItems();
        syncWinnerInline();
        drawWheel(); // uses frozenWheel => still shows winner slice
        openWinnerModal();
      }
    };

    requestAnimationFrame(tick);
  }

  // ---------- Center image ----------
  function loadCenterImage(){
    centerImage = null;
    centerPreview.src = "";
    if (!state.centerImageDataUrl) return;

    const img = new Image();
    img.onload = () => {
      centerImage = img;
      centerPreview.src = state.centerImageDataUrl;
      drawWheel();
    };
    img.src = state.centerImageDataUrl;
  }

  // ---------- Fullscreen ----------
  async function toggleFullscreen(){
    try{
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    }catch{
      toast("Fullscreen failed (browser blocked).", "error");
    }
  }

  // ---------- Sync UI inputs ----------
  function syncThemeUI(){
    const ts = state.settings.themeStudio;
    themeA.value = safeColor(ts.a, "#60a5fa");
    themeB.value = safeColor(ts.b, "#a78bfa");
    themeC.value = safeColor(ts.c, "#22c55e");
    themeText.value = safeColor(ts.text, "#ffffff");
    themeMode.value = ts.mode;
    themeStops.value = String(Number(ts.stops) === 3 ? 3 : 2);
    themeLighten.value = String(ts.lighten);
    themeDarken.value = String(ts.darken);
  }

  function syncAllInputsFromState(){
    syncCount();
    syncWinnerInline();

    // Theme
    syncThemeUI();

    // Overlay
    overlayEnabled.value = state.settings.overlay.enabled;
    overlayAlpha.value = String(state.settings.overlay.alpha);
    overlayA.value = safeColor(state.settings.overlay.a, "#22c55e");
    overlayB.value = safeColor(state.settings.overlay.b, "#3b82f6");

    // Wheel
    gradientMode.value = state.settings.gradient;
    removeAfterWin.value = state.settings.removeAfterWin;
    contourWidth.value = String(state.settings.contourWidth);
    contourColor.value = safeColor(state.settings.contourColor, "#0b1020");
    outerBorderWidth.value = String(state.settings.outerBorderWidth);
    outerBorderColor.value = safeColor(state.settings.outerBorderColor, "#ffffff");
    spinDurationMs.value = String(state.settings.spinDurationMs);
    minSpins.value = String(state.settings.minSpins);
    maxSpins.value = String(state.settings.maxSpins);

    // Text
    fontFamily.value = state.settings.fontFamily;
    fontStyle.value = state.settings.fontStyle;
    nameFontSize.value = String(state.settings.nameFontSize);
    tableFontSize.value = String(state.settings.tableFontSize);
    nameFontWeight.value = String(state.settings.nameFontWeight);
    tableFontWeight.value = String(state.settings.tableFontWeight);
    textOrientation.value = state.settings.textOrientation;

    // Center
    centerRadius.value = String(state.settings.centerRadius);
    centerBg.value = safeColor(state.settings.centerBg, "#0f1730");
    centerImageScale.value = String(state.settings.centerImageScale);

    // UI colors
    const ui = state.settings.ui;
    uiBg0.value = safeColor(ui.bg0, "#070a14");
    uiBg1.value = safeColor(ui.bg1, "#0b1022");
    uiAccentA.value = safeColor(ui.accentA, "#60a5fa");
    uiAccentB.value = safeColor(ui.accentB, "#a78bfa");
    uiText.value = safeColor(ui.text, "#eaf0ff");
    uiMuted.value = safeColor(ui.muted, "#aab3d7");
    uiLine.value = safeColor(ui.line, "#ffffff");
    uiDanger.value = safeColor(ui.danger, "#ff6b6b");
    uiBrandGold.value = safeColor(ui.brandGold, "#c8a85a");
    uiPointerOuter.value = safeColor(ui.pointerOuter, "#ffffff");
    uiPointerInner.value = safeColor(ui.pointerInner, "#60a5fa");
    uiEffects.value = ui.effects;
    uiGrid.value = ui.grid;
  }

  // ---------- Events ----------
  // Drawer open/close
  openDrawerBtn.addEventListener("click", () => openDrawer(state.activeTab || "list"));
  drawerCloseBtn.addEventListener("click", closeDrawer);
  drawerBackdrop.addEventListener("click", closeDrawer);

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      state.activeTab = tab;
      saveState();
      setActiveTab(tab);
    });
  });

  // FAB open tabs
  fabStack.addEventListener("click", (e) => {
    const b = e.target.closest(".fabBtn");
    if (!b) return;
    const tab = b.dataset.openTab;
    if (tab) openDrawer(tab);
  });

  // Spin + winner inline
  spinBtn.addEventListener("click", doSpin);
  winnerInline.addEventListener("click", () => {
    if (!state.lastWinner) return;
    openWinnerModal();
  });

  // Winner modal actions
  winnerCloseBtn.addEventListener("click", closeWinnerModal);
  winnerModalBackdrop.addEventListener("click", closeWinnerModal);
  spinAgainBtn.addEventListener("click", () => {
    closeWinnerModal();
    doSpin();
  });

  undoRemoveBtn.addEventListener("click", () => {
    if (!state.lastRemoved) return;
    const { item, index } = state.lastRemoved;
    const insertAt = clamp(Number(index) || 0, 0, state.options.length);
    state.options.splice(insertAt, 0, item);
    state.lastRemoved = null;
    saveState();
    renderItems();
    drawWheel();
    toast("Undo: winner restored to list.", "success");
    // keep modal open; button will hide next refresh
    undoRemoveBtn.style.display = "none";
  });

  // Quick add
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
    renderPalette();
    toast("Item added.", "success");
  });

  // Auto colors + auto text
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

  // Bulk
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
    renderPalette();
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
    renderPalette();
    toast("Bulk appended.", "success");
  });

  // Theme inputs
  [themeA, themeB, themeC, themeText].forEach(inp => inp.addEventListener("input", () => {
    state.settings.themeStudio.a = themeA.value;
    state.settings.themeStudio.b = themeB.value;
    state.settings.themeStudio.c = themeC.value;
    state.settings.themeStudio.text = themeText.value;
    saveState();
    renderPalette();
  }));

  themeMode.addEventListener("change", () => {
    state.settings.themeStudio.mode = themeMode.value;
    saveState();
    renderPalette();
  });

  themeStops.addEventListener("change", () => {
    state.settings.themeStudio.stops = Number(themeStops.value) === 3 ? 3 : 2;
    saveState();
    renderPalette();
  });

  themeLighten.addEventListener("input", () => {
    state.settings.themeStudio.lighten = Number(themeLighten.value);
    saveState();
    renderPalette();
  });

  themeDarken.addEventListener("input", () => {
    state.settings.themeStudio.darken = Number(themeDarken.value);
    saveState();
    renderPalette();
  });

  applyThemeBtn.addEventListener("click", applyThemeToAll);
  randomThemeBtn.addEventListener("click", randomizeTheme);

  document.querySelectorAll(".chipBtn").forEach(btn => {
    btn.addEventListener("click", () => applyPreset(btn.dataset.preset));
  });

  // Overlay
  overlayEnabled.addEventListener("change", () => { state.settings.overlay.enabled = overlayEnabled.value; saveState(); drawWheel(); });
  overlayAlpha.addEventListener("input", () => { state.settings.overlay.alpha = Number(overlayAlpha.value); saveState(); drawWheel(); });
  overlayA.addEventListener("input", () => { state.settings.overlay.a = overlayA.value; saveState(); drawWheel(); });
  overlayB.addEventListener("input", () => { state.settings.overlay.b = overlayB.value; saveState(); drawWheel(); });

  // Wheel settings
  gradientMode.addEventListener("change", () => {
    state.settings.gradient = gradientMode.value;
    saveState();
    renderItems();
    drawWheel();
    renderPalette();
  });

  removeAfterWin.addEventListener("change", () => {
    state.settings.removeAfterWin = removeAfterWin.value;
    saveState();
    toast(`Auto remove winners: ${removeAfterWin.value.toUpperCase()}`, "info");
  });

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

  // Text settings
  fontFamily.addEventListener("change", () => { state.settings.fontFamily = fontFamily.value; saveState(); drawWheel(); });
  fontStyle.addEventListener("change", () => { state.settings.fontStyle = fontStyle.value; saveState(); drawWheel(); });
  nameFontSize.addEventListener("input", () => { state.settings.nameFontSize = Number(nameFontSize.value); saveState(); drawWheel(); });
  tableFontSize.addEventListener("input", () => { state.settings.tableFontSize = Number(tableFontSize.value); saveState(); drawWheel(); });
  nameFontWeight.addEventListener("change", () => { state.settings.nameFontWeight = Number(nameFontWeight.value); saveState(); drawWheel(); });
  tableFontWeight.addEventListener("change", () => { state.settings.tableFontWeight = Number(tableFontWeight.value); saveState(); drawWheel(); });
  textOrientation.addEventListener("change", () => { state.settings.textOrientation = textOrientation.value; saveState(); drawWheel(); });

  // Center settings
  centerRadius.addEventListener("input", () => { state.settings.centerRadius = clamp(Number(centerRadius.value)||78,20,260); saveState(); drawWheel(); });
  centerBg.addEventListener("input", () => { state.settings.centerBg = centerBg.value; saveState(); drawWheel(); });
  centerImageScale.addEventListener("input", () => { state.settings.centerImageScale = clamp(Number(centerImageScale.value)||1,0.6,2); saveState(); drawWheel(); });

  centerImageInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.centerImageDataUrl = reader.result;
      saveState();
      loadCenterImage();
      toast("Center image set.", "success");
    };
    reader.readAsDataURL(file);
    centerImageInput.value = "";
  });

  removeCenterImageBtn.addEventListener("click", () => {
    state.centerImageDataUrl = null;
    centerImage = null;
    centerPreview.src = "";
    saveState();
    drawWheel();
    toast("Center image removed.", "info");
  });

  // UI Colors
  function bindUiColorInput(el, key){
    el.addEventListener("input", () => {
      state.settings.ui[key] = el.value;
      saveState();
      applyUiTheme();
    });
  }
  bindUiColorInput(uiBg0, "bg0");
  bindUiColorInput(uiBg1, "bg1");
  bindUiColorInput(uiAccentA, "accentA");
  bindUiColorInput(uiAccentB, "accentB");
  bindUiColorInput(uiText, "text");
  bindUiColorInput(uiMuted, "muted");
  bindUiColorInput(uiLine, "line");
  bindUiColorInput(uiDanger, "danger");
  bindUiColorInput(uiBrandGold, "brandGold");
  bindUiColorInput(uiPointerOuter, "pointerOuter");
  bindUiColorInput(uiPointerInner, "pointerInner");

  uiEffects.addEventListener("change", () => { state.settings.ui.effects = uiEffects.value; saveState(); applyUiTheme(); });
  uiGrid.addEventListener("change", () => { state.settings.ui.grid = uiGrid.value; saveState(); applyUiTheme(); });

  resetUiBtn.addEventListener("click", () => {
    state.settings.ui = clone(defaultState.settings.ui);
    saveState();
    syncAllInputsFromState();
    applyUiTheme();
    toast("UI colors reset.", "info");
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
      state.settings.overlay = Object.assign(clone(defaultState.settings.overlay), parsed.settings?.overlay || {});
      state.settings.ui = Object.assign(clone(defaultState.settings.ui), parsed.settings?.ui || {});

      frozenWheel = null;
      saveState();

      applyUiTheme();
      syncAllInputsFromState();
      renderItems();
      renderPalette();
      loadCenterImage();
      drawWheel();
      syncWinnerInline();

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
    applyUiTheme();
    syncAllInputsFromState();
    renderItems();
    renderPalette();
    loadCenterImage();
    drawWheel();
    toast("Reset done.", "info");
  });

  clearStorageBtn.addEventListener("click", () => {
    if (!confirm("Clear storage (localStorage)?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = clone(defaultState);
    frozenWheel = null;
    saveState();
    applyUiTheme();
    syncAllInputsFromState();
    renderItems();
    renderPalette();
    loadCenterImage();
    drawWheel();
    toast("Storage cleared.", "info");
  });

  // Fullscreen
  fullscreenBtn.addEventListener("click", toggleFullscreen);
  fabFullscreenBtn.addEventListener("click", toggleFullscreen);

  // Keyboard shortcuts
  window.addEventListener("keydown", (e) => {
    if (e.key === " " && !e.repeat) {
      e.preventDefault();
      doSpin();
      return;
    }

    if (e.key === "Escape") {
      if (document.body.classList.contains("modal-open")) return closeWinnerModal();
      if (document.body.classList.contains("drawer-open")) return closeDrawer();
      return;
    }

    const tag = (document.activeElement?.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;

    if (e.key.toLowerCase() === "l") openDrawer("list");
    if (e.key.toLowerCase() === "t") openDrawer("theme");
    if (e.key.toLowerCase() === "w") openDrawer("wheel");
    if (e.key.toLowerCase() === "s") openDrawer(state.activeTab || "list");
    if (e.key.toLowerCase() === "f") toggleFullscreen();
  });

  // Resize
  window.addEventListener("resize", () => drawWheel());
  document.addEventListener("fullscreenchange", () => drawWheel());

  // ---------- Init ----------
  applyUiTheme();
  syncAllInputsFromState();
  setActiveTab(state.activeTab || "list");
  renderItems();
  renderPalette();
  loadCenterImage();
  syncWinnerInline();
  drawWheel();
})();
