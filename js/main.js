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
      ".wallet-mini, .info-card";

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
