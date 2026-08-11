(() => {
  "use strict";

  /* ---------------- theme (neon / pastel) ---------------- */
  const root = document.documentElement;
  const modeSwitch = document.getElementById("modeSwitch");
  const savedTheme = localStorage.getItem("rsx-theme");
  if (savedTheme) root.setAttribute("data-theme", savedTheme);

  function setTheme(mode) {
    root.setAttribute("data-theme", mode);
    localStorage.setItem("rsx-theme", mode);
    if (modeSwitch) {
      modeSwitch.querySelectorAll("button").forEach((b) => {
        b.classList.toggle("active", b.dataset.mode === mode);
      });
    }
  }
  if (modeSwitch) {
    setTheme(root.getAttribute("data-theme") || "neon");
    modeSwitch.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-mode]");
      if (btn) setTheme(btn.dataset.mode);
    });
  }

  /* ---------------- footer year ---------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- toast ---------------- */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  /* ---------------- clipboard copy ---------------- */
  function copyText(text, label) {
    const done = () => showToast((label || "ADDRESS") + " COPIED");
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }
  function fallbackCopy(text, cb) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (err) { /* no-op */ }
    document.body.removeChild(ta);
    cb();
  }

  const FULL_ADDRESS = "0x7A1f9c3D2e8B4a6F1c0D5e7A9b3C6f8E2a4B69RSX";
  const copyContract = document.getElementById("copyContract");
  const copyTreasury = document.getElementById("copyTreasury");
  if (copyContract) copyContract.addEventListener("click", () => copyText(FULL_ADDRESS, "CONTRACT"));
  if (copyTreasury) copyTreasury.addEventListener("click", () => copyText(FULL_ADDRESS, "TREASURY ADDRESS"));

  /* ---------------- live clock ---------------- */
  const clockEl = document.getElementById("liveClock");
  function tickClock() {
    if (!clockEl) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    clockEl.textContent = `${hh}:${mm}:${ss}`;
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------------- airdrop countdown ---------------- */
  const countdownEl = document.getElementById("airdropCountdown");
  const countdownMiniEl = document.getElementById("roundCountdownMini");
  const airdropDateEl = document.getElementById("airdropDate");

  const AIRDROP_TARGET = new Date(Date.now() + (21 * 3600 + 42 * 60 + 15) * 1000);
  if (airdropDateEl) {
    airdropDateEl.textContent = AIRDROP_TARGET.toLocaleString("en-US", {
      month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "UTC", timeZoneName: "short"
    }).toUpperCase();
  }

  function tickCountdown() {
    const diff = Math.max(0, AIRDROP_TARGET.getTime() - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (countdownEl) countdownEl.textContent = `${h}H ${String(m).padStart(2, "0")}M ${String(s).padStart(2, "0")}S`;
    if (countdownMiniEl) countdownMiniEl.textContent = `IN ${h}H ${String(m).padStart(2, "0")}M`;
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------------- bar chart entrance animation ---------------- */
  const barChart = document.getElementById("barChart");
  function paintBars(container) {
    if (!container) return;
    container.querySelectorAll(".bar-col").forEach((col, i) => {
      const bar = col.querySelector(".bar");
      const target = col.dataset.h || "10";
      setTimeout(() => { bar.style.height = target + "%"; }, 80 * i);
    });
  }

  const HISTORY_ROUNDS = [
    { label: "#01", h: 6 }, { label: "#02", h: 9 }, { label: "#03", h: 13 },
    { label: "#04", h: 15 }, { label: "#05", h: 18 }
  ];
  const historyToggle = document.getElementById("historyToggle");
  let historyShown = false;
  if (historyToggle && barChart) {
    historyToggle.addEventListener("click", () => {
      if (historyShown) {
        barChart.querySelectorAll(".bar-col.history").forEach((el) => el.remove());
        historyToggle.textContent = "VIEW HISTORY →";
      } else {
        HISTORY_ROUNDS.slice().reverse().forEach((r) => {
          const col = document.createElement("div");
          col.className = "bar-col history";
          col.innerHTML = `<div class="bar" style="height:0%"></div><div class="bar-lbl">${r.label}</div>`;
          barChart.insertBefore(col, barChart.firstChild);
          const bar = col.querySelector(".bar");
          requestAnimationFrame(() => { bar.style.height = r.h + "%"; });
        });
        historyToggle.textContent = "← HIDE HISTORY";
      }
      historyShown = !historyShown;
    });
  }

  /* ---------------- index-status decorative sparkline ---------------- */
  const indexGraphic = document.getElementById("indexGraphic");
  function paintSparkline() {
    if (!indexGraphic) return;
    indexGraphic.innerHTML = "";
    for (let i = 0; i < 22; i++) {
      const bar = document.createElement("div");
      bar.className = "g-bar";
      const h = 20 + Math.round(Math.random() * 70);
      bar.style.height = h + "%";
      indexGraphic.appendChild(bar);
    }
  }
  paintSparkline();

  /* ---------------- count-up stat values ---------------- */
  function formatNumber(n, decimals) {
    return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  function countUp(el) {
    const target = parseFloat(el.dataset.target);
    if (Number.isNaN(target)) return;
    const prefix = el.dataset.prefix || "";
    const decimals = el.dataset.target.includes(".") ? 2 : 0;
    const duration = 1100;
    const start = performance.now();
    function frame(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = prefix + formatNumber(decimals ? Math.round(val * 100) / 100 : Math.round(val), decimals);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + formatNumber(target, decimals);
    }
    requestAnimationFrame(frame);
  }

  /* ---------------- scroll reveal + count-up trigger ---------------- */
  const revealEls = document.querySelectorAll(".reveal");
  const countEls = document.querySelectorAll(".stat-value[data-target]");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => revealObserver.observe(el));

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  countEls.forEach((el) => countObserver.observe(el));

  if (barChart) {
    const chartObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          paintBars(barChart);
          chartObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    chartObserver.observe(barChart);
  }

  /* ---------------- active-section nav highlighting ---------------- */
  const navItems = Array.from(document.querySelectorAll(".nav-item"));
  const sections = navItems
    .map((item) => document.getElementById(item.dataset.target))
    .filter(Boolean);

  let selectedIndex = navItems.findIndex((n) => n.dataset.target === "dashboard");
  if (selectedIndex < 0) selectedIndex = 0;

  function setActive(index, { scrollNav = false } = {}) {
    selectedIndex = Math.max(0, Math.min(navItems.length - 1, index));
    navItems.forEach((item, i) => item.classList.toggle("active", i === selectedIndex));
  }
  setActive(selectedIndex);

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = navItems.findIndex((n) => n.dataset.target === entry.target.id);
        if (idx >= 0) setActive(idx);
      }
    });
  }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });
  sections.forEach((sec) => sectionObserver.observe(sec));

  /* ---------------- keyboard navigation (↑ ↓ + Enter) ---------------- */
  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(selectedIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(selectedIndex - 1);
    } else if (e.key === "Enter") {
      const target = document.getElementById(navItems[selectedIndex].dataset.target);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  /* ---------------- glitch pulses ---------------- */
  const glitchEls = document.querySelectorAll(".glitch");
  function pulseGlitch() {
    glitchEls.forEach((el) => {
      el.classList.remove("glitching");
      void el.offsetWidth;
      el.classList.add("glitching");
    });
  }
  setTimeout(pulseGlitch, 900);
  setInterval(pulseGlitch, 7000);

  /* ---------------- hero parallax on mouse move ---------------- */
  const heroMedia = document.querySelector(".hero-media");
  const heroParallax = document.getElementById("heroParallax");
  if (heroMedia && heroParallax && matchMedia("(hover: hover)").matches) {
    heroMedia.addEventListener("mousemove", (e) => {
      const rect = heroMedia.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      heroParallax.style.transform = `translate(${px * -14}px, ${py * -10}px) scale(1.04)`;
    });
    heroMedia.addEventListener("mouseleave", () => {
      heroParallax.style.transform = "translate(0,0) scale(1)";
    });
  }

  /* ---------------- audio player (visual simulation, no real audio) ---------------- */
  const TRACKS = ["STONKS ONLY", "DIAMOND HANDS FM", "TO THE MOON (LOFI)", "BRRRR THEME"];
  let trackIndex = 0;
  let isPlaying = true;
  const trackNameEl = document.getElementById("trackName");
  const playerBars = document.getElementById("playerBars");
  const playPauseBtn = document.getElementById("playPause");
  const playerToggleBtn = document.getElementById("playerToggle");
  const prevTrackBtn = document.getElementById("prevTrack");
  const nextTrackBtn = document.getElementById("nextTrack");
  const stopTrackBtn = document.getElementById("stopTrack");

  function renderBars() {
    if (!playerBars) return;
    playerBars.innerHTML = "";
    for (let i = 0; i < 12; i++) {
      const bar = document.createElement("span");
      bar.style.animationDelay = (Math.random() * 0.6).toFixed(2) + "s";
      bar.style.height = (4 + Math.random() * 14) + "px";
      playerBars.appendChild(bar);
    }
  }
  renderBars();

  function applyPlayState() {
    if (playerBars) playerBars.classList.toggle("paused", !isPlaying);
    if (playPauseBtn) playPauseBtn.textContent = isPlaying ? "⏸" : "▶";
    if (playerToggleBtn) playerToggleBtn.textContent = isPlaying ? "▮▮ PAUSE" : "▶ PLAY";
  }
  function setTrack(i) {
    trackIndex = (i + TRACKS.length) % TRACKS.length;
    if (trackNameEl) trackNameEl.textContent = TRACKS[trackIndex];
    renderBars();
  }
  function togglePlay() {
    isPlaying = !isPlaying;
    applyPlayState();
  }
  if (playPauseBtn) playPauseBtn.addEventListener("click", togglePlay);
  if (playerToggleBtn) playerToggleBtn.addEventListener("click", togglePlay);
  if (nextTrackBtn) nextTrackBtn.addEventListener("click", () => setTrack(trackIndex + 1));
  if (prevTrackBtn) prevTrackBtn.addEventListener("click", () => setTrack(trackIndex - 1));
  if (stopTrackBtn) stopTrackBtn.addEventListener("click", () => { isPlaying = false; applyPlayState(); });
  applyPlayState();

  /* ---------------- live-feeling data jitter (client-side demo only) ---------------- */
  const state = { price: 0.004206, mcap: 4.2, vol: 1.28, holders: 3842 };
  const tickPrice = document.getElementById("tickPrice");
  const tickMcap = document.getElementById("tickMcap");
  const tickVol = document.getElementById("tickVol");
  const tickHolders = document.getElementById("tickHolders");
  const statVol = document.getElementById("statVol");
  const statMcap = document.getElementById("statMcap");
  const dashUpdated = document.getElementById("dashUpdated");

  function flash(el) {
    if (!el) return;
    el.classList.remove("tick-flash");
    void el.offsetWidth;
    el.classList.add("tick-flash");
  }

  function jitter() {
    state.price = Math.max(0.0001, state.price * (1 + (Math.random() - 0.5) * 0.01));
    state.mcap = Math.max(0.1, state.mcap * (1 + (Math.random() - 0.5) * 0.008));
    state.vol = Math.max(0.05, state.vol * (1 + (Math.random() - 0.48) * 0.02));

    const priceStr = "$" + state.price.toFixed(6);
    const mcapStr = "$" + state.mcap.toFixed(1) + "M";
    const volStr = "$" + state.vol.toFixed(2) + "M";

    if (tickPrice) { tickPrice.textContent = priceStr; flash(tickPrice); }
    if (tickMcap) { tickMcap.textContent = mcapStr; flash(tickMcap); }
    if (tickVol) { tickVol.textContent = volStr; flash(tickVol); }
    if (statMcap) statMcap.textContent = mcapStr;
    if (statVol) { statVol.textContent = volStr; flash(statVol); }

    if (dashUpdated) dashUpdated.textContent = "LIVE · UPDATED JUST NOW";
  }
  setInterval(jitter, 4000);

  /* ---------------- sparkline gentle refresh ---------------- */
  setInterval(paintSparkline, 6000);

  /* ---------------- digital hover sound ---------------- */
  if (matchMedia("(hover: hover)").matches) {
    const HOVER_SOUND_SELECTOR =
      ".btn, .nav-item a, .mode-switch button, .link-card, .social-row a, " +
      ".player-controls button, .wallet-mini, .copyable, .info-card, .media-card";

    let audioCtx = null;
    function ensureAudio() {
      if (audioCtx) return audioCtx;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = Ctx ? new Ctx() : null;
      return audioCtx;
    }
    function resumeAudio() {
      const ctx = ensureAudio();
      if (ctx && ctx.state === "suspended") ctx.resume();
    }
    document.addEventListener("pointerdown", resumeAudio, { once: true });
    document.addEventListener("keydown", resumeAudio, { once: true });

    function playHoverBlip() {
      const ctx = ensureAudio();
      if (!ctx || ctx.state !== "running") return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(760, now);
      osc.frequency.exponentialRampToValueAtTime(1500, now + 0.055);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.045, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }

    document.addEventListener("mouseover", (e) => {
      const el = e.target.closest(HOVER_SOUND_SELECTOR);
      if (!el) return;
      if (el.contains(e.relatedTarget)) return; // still inside the same element
      playHoverBlip();
    });
  }
})();
