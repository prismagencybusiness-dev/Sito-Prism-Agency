// Prism Agency — hero scroll-scrubbed animation.
// 192 pre-rendered frames drawn on a canvas, mapped 1:1 to scroll position
// while the hero is pinned. Respects prefers-reduced-motion: in that case
// we just paint one representative frame and never pin the section.

(function () {
  "use strict";

  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const FRAME_COUNT = 192;
  const PX_PER_FRAME = 12;
  const FRAME_PATH = (i) => `assets/img/hero-frames/f_${String(i).padStart(3, "0")}.jpg`;

  const ctx = canvas.getContext("2d");
  const heroSection = document.getElementById("hero-pin");
  const loader = document.getElementById("hero-loader");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const images = new Array(FRAME_COUNT);
  let currentFrame = 0;
  let loadedCount = 0;
  let firstFrameReady = false;

  function drawFrame(i) {
    const img = images[i];
    if (!img || !img.complete || !img.naturalWidth) return;
    currentFrame = i;
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function resizeCanvas() {
    const rect = heroSection.getBoundingClientRect();
    canvas.width = window.innerWidth;
    canvas.height = Math.max(window.innerHeight, rect.height);
    drawFrame(currentFrame);
  }

  function loadFrame(i) {
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => {
        loadedCount++;
        resolve();
      };
      img.src = FRAME_PATH(i);
      images[i] = img;
    });
  }

  async function preloadAndStart() {
    // Frame 0 first so the hero has something to show almost immediately.
    await loadFrame(0);
    firstFrameReady = true;
    resizeCanvas();
    if (loader) loader.classList.add("is-hidden");

    if (reduceMotion) {
      // Static, representative frame — no scroll-jacking, no extra scroll distance.
      const stillFrame = Math.round(FRAME_COUNT * 0.4);
      await loadFrame(stillFrame);
      drawFrame(stillFrame);
      return;
    }

    // Load the rest in the background, then wire up the scroll scrub.
    const rest = [];
    for (let i = 1; i < FRAME_COUNT; i++) rest.push(loadFrame(i));
    await Promise.all(rest);
    initScroll();
  }

  function initScroll() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: heroSection,
      start: "top top",
      end: () => "+=" + FRAME_COUNT * PX_PER_FRAME,
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        const frame = Math.round(self.progress * (FRAME_COUNT - 1));
        if (frame !== currentFrame) drawFrame(frame);
      },
    });
  }

  window.addEventListener("resize", () => {
    if (firstFrameReady) resizeCanvas();
  });

  resizeCanvas();
  preloadAndStart();
})();
