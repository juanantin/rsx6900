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

  /* ---------------- copy-to-clipboard (CA badge + treasury) ---------------- */
  const CONTRACT_ADDRESS = "0x1bef1e4d1f98d91d99f1f2f384490f3999d7ccd9";
  const TREASURY_ADDRESS = "0xDFe8d771C5187E690D3B8063795Fc5254Bb5DcE6";

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

  function setupCopyToClipboard(el, fullText) {
    if (!el) return;
    const label = el.querySelector(".ca-label");
    if (!label) return;
    const originalLabel = label.textContent;
    let resetTimer = null;

    function showCopied() {
      clearTimeout(resetTimer);
      label.textContent = "COPIED!";
      resetTimer = setTimeout(() => { label.textContent = originalLabel; }, 1400);
    }
    function copy() {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(fullText).then(showCopied).catch(() => fallbackCopy(fullText, showCopied));
      } else {
        fallbackCopy(fullText, showCopied);
      }
    }
    el.addEventListener("click", copy);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        copy();
      }
    });
  }

  setupCopyToClipboard(document.getElementById("copyCA"), CONTRACT_ADDRESS);
  setupCopyToClipboard(document.getElementById("copyTreasury"), TREASURY_ADDRESS);

  /* ---------------- live market data (Dexscreener) ---------------- */
  const DEX_CHAIN_ID = "robinhood";
  const DEX_PAIR_ID = "0x2afde58b40cca5093c86208aae5d2a0a14530cde316a09362adfd30d13e16b7c";
  const DEX_API_URL = `https://api.dexscreener.com/latest/dex/pairs/${DEX_CHAIN_ID}/${DEX_PAIR_ID}`;
  const DEX_REFRESH_MS = 45000;

  function formatCompactUsd(n) {
    if (typeof n !== "number" || Number.isNaN(n)) return null;
    return "$" + new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n);
  }
  function formatPrice(n) {
    if (typeof n !== "number" || Number.isNaN(n)) return null;
    const decimals = n < 1 ? 6 : 2;
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  function formatPercent(n) {
    if (typeof n !== "number" || Number.isNaN(n)) return null;
    return (n >= 0 ? "+ " : "") + n.toFixed(1) + "% (24H)";
  }

  function setLiveValue(el, text) {
    if (!el || text == null) return;
    el.textContent = text;
    el.classList.remove("pending-value");
  }

  async function refreshDexData() {
    let pair;
    try {
      const res = await fetch(DEX_API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("bad status " + res.status);
      const data = await res.json();
      pair = (Array.isArray(data.pairs) && data.pairs[0]) || data.pair || null;
    } catch (err) {
      return; // API unreachable or shape changed — leave existing "..." pending state
    }
    if (!pair) return;

    const marketCap = typeof pair.marketCap === "number" ? pair.marketCap : pair.fdv;
    const priceUsd = pair.priceUsd != null ? parseFloat(pair.priceUsd) : NaN;
    const vol24h = pair.volume && typeof pair.volume.h24 === "number" ? pair.volume.h24 : NaN;
    const priceChange24h = pair.priceChange && typeof pair.priceChange.h24 === "number" ? pair.priceChange.h24 : NaN;

    const mcapStr = formatCompactUsd(marketCap);
    const priceStr = formatPrice(priceUsd);
    const volStr = formatCompactUsd(vol24h);
    const changeStr = formatPercent(priceChange24h);

    setLiveValue(document.getElementById("statMcap"), mcapStr);
    setLiveValue(document.getElementById("statVol"), volStr);
    setLiveValue(document.getElementById("statVolDelta"), changeStr);
    setLiveValue(document.getElementById("tickMcap"), mcapStr);
    setLiveValue(document.getElementById("tickPrice"), priceStr);
    setLiveValue(document.getElementById("tickVol"), volStr);

    const tickerLive = document.getElementById("tickerLive");
    if (tickerLive && mcapStr) {
      tickerLive.classList.remove("pending");
      tickerLive.lastChild.textContent = "$RSX LIVE";
    }
  }

  refreshDexData();
  setInterval(refreshDexData, DEX_REFRESH_MS);

  /* ---------------- scroll reveal ---------------- */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------------- move CTA buttons under hero copy on mobile ---------------- */
  const sidebarActions = document.getElementById("sidebarActions");
  const heroTagline = document.querySelector(".hero-tagline");
  const sidebarNav = document.querySelector(".sidebar nav");
  const mobileQuery = matchMedia("(max-width: 900px)");

  function placeSidebarActions(isMobile) {
    if (!sidebarActions) return;
    if (isMobile) {
      if (heroTagline && sidebarActions.previousElementSibling !== heroTagline) {
        heroTagline.insertAdjacentElement("afterend", sidebarActions);
      }
    } else if (sidebarNav && sidebarActions.nextElementSibling !== sidebarNav) {
      sidebarNav.insertAdjacentElement("beforebegin", sidebarActions);
    }
  }
  /* ---------------- move mode toggle to page bottom on mobile ---------------- */
  const modeToggle = document.querySelector(".mode-toggle");
  const sidebarEl = document.querySelector(".sidebar");
  const mainEl = document.querySelector("main.main");

  function placeModeToggle(isMobile) {
    if (!modeToggle) return;
    if (isMobile) {
      if (mainEl && modeToggle.parentElement !== mainEl) {
        mainEl.appendChild(modeToggle);
      }
    } else if (sidebarEl && modeToggle.parentElement !== sidebarEl) {
      sidebarEl.appendChild(modeToggle);
    }
  }

  function applyResponsivePlacement(isMobile) {
    placeSidebarActions(isMobile);
    placeModeToggle(isMobile);
  }
  applyResponsivePlacement(mobileQuery.matches);
  mobileQuery.addEventListener("change", (e) => applyResponsivePlacement(e.matches));

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

  /* ---------------- digital hover sound ---------------- */
  if (matchMedia("(hover: hover)").matches) {
    const HOVER_SOUND_SELECTOR =
      ".btn, .nav-item a, .mode-switch button, .link-card, .social-row a, " +
      ".wallet-mini, .info-card, .copyable";

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
