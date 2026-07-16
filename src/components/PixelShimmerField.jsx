import { useEffect, useRef } from "react";

const styles = `
.pixel-shimmer {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: clamp(16px, 2.5vw, 30px);
  background: #f5f4ef;
  color: #20211d;
}
.pixel-shimmer__field {
  position: relative;
  width: min(1160px, 100%);
  min-height: min(570px, calc(100% - 2px));
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 22px;
  background: var(--field-background);
  isolation: isolate;
}
.pixel-shimmer__canvas {
  position: absolute;
  z-index: 0;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  image-rendering: pixelated;
}
.pixel-shimmer__content {
  position: relative;
  z-index: 1;
  width: min(720px, calc(100% - 64px));
  display: grid;
  justify-items: center;
  padding: 54px 24px;
  text-align: center;
}
.pixel-shimmer__eyebrow {
  margin: 0 0 16px;
  color: #315f5b;
  font: 600 10px/1 "DM Sans", sans-serif;
  text-transform: uppercase;
}
.pixel-shimmer__title {
  margin: 0;
  font: 400 clamp(48px, 5.2vw, 74px)/.92 "Instrument Serif", serif;
  letter-spacing: 0;
  text-wrap: balance;
}
.pixel-shimmer__description {
  max-width: 590px;
  margin: 24px 0 0;
  color: #2d3733;
  font: 500 18px/1.38 "DM Sans", sans-serif;
  text-wrap: balance;
}
.pixel-shimmer__action {
  min-height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 32px;
  padding: 0 26px;
  border: 1px solid #20211d;
  border-radius: 999px;
  background: #20211d;
  color: #f7f7f2;
  font: 600 13px/1 "DM Sans", sans-serif;
  cursor: pointer;
  transition: background 180ms ease, color 180ms ease;
}
.pixel-shimmer__action:hover { background: #f5f4ef; color: #20211d; }
.pixel-shimmer__action:focus-visible { outline: 3px solid #20211d; outline-offset: 3px; }

@media (max-width: 700px) {
  .pixel-shimmer { padding: 12px; }
  .pixel-shimmer__field { min-height: calc(100% - 2px); border-radius: 16px; }
  .pixel-shimmer__content { width: min(344px, calc(100% - 28px)); padding: 72px 10px; }
  .pixel-shimmer__title { font-size: 44px; line-height: .94; }
  .pixel-shimmer__description { max-width: 302px; margin-top: 20px; font-size: 15px; line-height: 1.45; }
  .pixel-shimmer__action { margin-top: 28px; }
}

@media (prefers-reduced-motion: reduce) {
  .pixel-shimmer__action { transition: none; }
}
`;

const bayer8 = [
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
];

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(value) {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
}

function hash(x, y) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function valueNoise(x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smoothstep(x - x0);
  const ty = smoothstep(y - y0);
  const top = hash(x0, y0) * (1 - tx) + hash(x0 + 1, y0) * tx;
  const bottom = hash(x0, y0 + 1) * (1 - tx) + hash(x0 + 1, y0 + 1) * tx;
  return top * (1 - ty) + bottom * ty;
}

function flowField(x, y, time) {
  const warpX = valueNoise(x * 1.35 + time * 0.14, y * 1.2 - time * 0.11);
  const warpY = valueNoise(x * 1.1 - time * 0.1 + 19.4, y * 1.45 + time * 0.13 + 7.8);
  const broad = valueNoise(
    x * 2.25 + (warpX - 0.5) * 1.55 + time * 0.09,
    y * 2.05 + (warpY - 0.5) * 1.4 - time * 0.075,
  );
  const detail = valueNoise(x * 5.1 - time * 0.16 + 3.7, y * 4.4 + time * 0.13 + 12.2);
  return broad * 0.72 + detail * 0.28;
}

export default function PixelShimmerField({
  eyebrow = "",
  title = "Your perspective has value.",
  description = "Share what you notice, compare what works, and help better ideas move forward.",
  actionLabel = "Join the study",
  density = 1,
  speed = 1,
  pixelSize = 7,
  backgroundColor = "#c8e7e4",
  dotColor = "#2e706b",
  onAction,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { alpha: true });
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let width = 1;
    let height = 1;
    let lastFrame = 0;
    let reducedMotion = media.matches;

    function draw(time) {
      context.clearRect(0, 0, width, height);
      context.fillStyle = dotColor;

      const cell = clamp(pixelSize, 4, 12);
      const columns = Math.ceil(width / cell);
      const rows = Math.ceil(height / cell);
      const seconds = (time / 1000) * Math.max(0.05, speed);
      const clearWidth = width < 500 ? 0.52 : 0.42;
      const clearHeight = width < 500 ? 0.34 : 0.36;

      for (let row = 0; row <= rows; row += 1) {
        for (let column = 0; column <= columns; column += 1) {
          const x = column * cell;
          const y = row * cell;
          const normalizedX = x / width;
          const normalizedY = y / height;
          const centerX = (normalizedX - 0.5) / clearWidth;
          const centerY = (normalizedY - 0.51) / clearHeight;
          const centerDistance = Math.sqrt(centerX * centerX + centerY * centerY);
          const clearCenter = smoothstep((centerDistance - 0.48) / 0.62);
          const field = flowField(normalizedX * 3.15, normalizedY * 2.7, seconds);
          const coverage = clamp((field - 0.31) * 1.86 * clearCenter * Math.max(0.25, density));
          const threshold = (bayer8[(row % 8) * 8 + (column % 8)] + 0.5) / 64;

          if (coverage <= threshold) continue;

          const size = cell * (0.28 + coverage * 0.32);
          context.globalAlpha = 0.18 + coverage * 0.72;
          context.fillRect(
            Math.round(x + (cell - size) * 0.5),
            Math.round(y + (cell - size) * 0.5),
            Math.max(1, Math.round(size)),
            Math.max(1, Math.round(size)),
          );
        }
      }

      context.globalAlpha = 1;
    }

    function animate(time) {
      if (time - lastFrame >= 1000 / 30) {
        draw(time);
        lastFrame = time;
      }
      frame = requestAnimationFrame(animate);
    }

    function start() {
      cancelAnimationFrame(frame);
      if (reducedMotion) {
        draw(0);
      } else {
        frame = requestAnimationFrame(animate);
      }
    }

    function resize() {
      const box = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, box.width);
      height = Math.max(1, box.height);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      draw(reducedMotion ? 0 : performance.now());
    }

    function updateMotion() {
      reducedMotion = media.matches;
      start();
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    media.addEventListener?.("change", updateMotion);
    resize();
    start();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      media.removeEventListener?.("change", updateMotion);
    };
  }, [density, dotColor, pixelSize, speed]);

  return (
    <section className="pixel-shimmer">
      <style>{styles}</style>
      <div className="pixel-shimmer__field" style={{ "--field-background": backgroundColor }}>
        <canvas className="pixel-shimmer__canvas" ref={canvasRef} aria-hidden="true" />
        <div className="pixel-shimmer__content">
          {eyebrow ? <p className="pixel-shimmer__eyebrow">{eyebrow}</p> : null}
          <h2 className="pixel-shimmer__title">{title}</h2>
          <p className="pixel-shimmer__description">{description}</p>
          <button className="pixel-shimmer__action" type="button" onClick={onAction}>{actionLabel}</button>
        </div>
      </div>
    </section>
  );
}
