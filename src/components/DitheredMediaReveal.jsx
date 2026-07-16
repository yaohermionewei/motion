import { useEffect, useRef, useState } from "react";

const styles = `
.dithered-media {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: clamp(22px, 4vw, 46px);
  background: #171812;
  color: #f5f6f1;
}
.dithered-media__figure { width: min(900px, 100%); margin: 0; }
.dithered-media__frame {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid #44463f;
  background: #2b2d27;
}
.dithered-media__canvas { width: 100%; height: 100%; display: block; }
.dithered-media__fallback { position: absolute; inset: 0; display: grid; place-items: center; padding: 24px; color: #a9ada3; font: 500 12px/1.5 "DM Sans", sans-serif; text-align: center; }
.dithered-media__label { position: absolute; z-index: 2; top: 14px; left: 14px; padding: 7px 9px; background: #d9ff42; color: #171812; font: 600 10px/1 "DM Sans", sans-serif; text-transform: uppercase; }
.dithered-media__axis { position: absolute; z-index: 2; top: 0; right: 22%; width: 1px; height: 100%; background: rgba(245,246,241,.45); mix-blend-mode: difference; }
.dithered-media__axis::before, .dithered-media__axis::after { position: absolute; left: -3px; width: 7px; height: 7px; content: ""; border: 1px solid currentColor; border-radius: 50%; }
.dithered-media__axis::before { top: 12px; }
.dithered-media__axis::after { bottom: 12px; }
.dithered-media__meta { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 20px; align-items: end; padding-top: 14px; border-top: 1px solid #44463f; margin-top: 14px; }
.dithered-media__title { margin: 0; font: 400 clamp(28px, 4vw, 48px)/.95 "Instrument Serif", serif; }
.dithered-media__note { color: #9ca097; font: 600 10px/1.3 "DM Sans", sans-serif; text-align: right; text-transform: uppercase; }
@media (max-width: 620px) {
  .dithered-media { padding: 18px; }
  .dithered-media__frame { aspect-ratio: 4 / 5; }
  .dithered-media__meta { grid-template-columns: 1fr; align-items: start; }
  .dithered-media__note { text-align: left; }
}
`;

const bayer4 = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
];

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(value) {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
}

function drawCover(context, source, width, height) {
  const sourceRatio = source.naturalWidth / source.naturalHeight;
  const targetRatio = width / height;
  let sourceWidth = source.naturalWidth;
  let sourceHeight = source.naturalHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (sourceRatio > targetRatio) {
    sourceWidth = source.naturalHeight * targetRatio;
    sourceX = (source.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = source.naturalWidth / targetRatio;
    sourceY = (source.naturalHeight - sourceHeight) / 2;
  }

  context.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
}

export default function DitheredMediaReveal({
  image = "/images/retro-cosmic-paths.webp",
  alt = "Artist working in a bright studio",
  columns = 160,
  rows = 100,
  duration = 1600,
}) {
  const canvasRef = useRef(null);
  const progressRef = useRef(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { alpha: false });
    const sample = document.createElement("canvas");
    const sampleContext = sample.getContext("2d", { willReadFrequently: true });
    const pixels = document.createElement("canvas");
    const pixelContext = pixels.getContext("2d");
    const source = new Image();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let startedAt = 0;
    let ready = false;

    sample.width = Math.max(24, columns);
    sample.height = Math.max(16, rows);
    pixels.width = sample.width;
    pixels.height = sample.height;

    function resize() {
      const box = canvas.getBoundingClientRect();
      const density = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(box.width * density));
      canvas.height = Math.max(1, Math.round(box.height * density));
      render(progressRef.current);
    }

    function render(progress) {
      context.fillStyle = "#2b2d27";
      context.fillRect(0, 0, canvas.width, canvas.height);
      if (!ready) return;

      sampleContext.clearRect(0, 0, sample.width, sample.height);
      drawCover(sampleContext, source, sample.width, sample.height);
      const imageData = sampleContext.getImageData(0, 0, sample.width, sample.height);
      const output = pixelContext.createImageData(sample.width, sample.height);

      for (let y = 0; y < sample.height; y += 1) {
        for (let x = 0; x < sample.width; x += 1) {
          const index = (y * sample.width + x) * 4;
          const red = imageData.data[index];
          const green = imageData.data[index + 1];
          const blue = imageData.data[index + 2];
          const luminance = red * 0.299 + green * 0.587 + blue * 0.114;
          const threshold = ((bayer4[(y % 4) * 4 + (x % 4)] + 0.5) / 16) * 255;
          const monochrome = luminance > threshold ? 235 : 28;
          const wave = smoothstep(progress * 1.35 - (x / sample.width) * 0.35);

          output.data[index] = Math.round(monochrome * (1 - wave) + red * wave);
          output.data[index + 1] = Math.round(monochrome * (1 - wave) + green * wave);
          output.data[index + 2] = Math.round(monochrome * (1 - wave) + blue * wave);
          output.data[index + 3] = 255;
        }
      }

      pixelContext.putImageData(output, 0, 0);
      context.imageSmoothingEnabled = false;
      context.drawImage(pixels, 0, 0, canvas.width, canvas.height);

      const fullImageMix = smoothstep((progress - 0.62) / 0.38);
      if (fullImageMix > 0) {
        context.save();
        context.globalAlpha = fullImageMix;
        context.imageSmoothingEnabled = true;
        drawCover(context, source, canvas.width, canvas.height);
        context.restore();
      }
    }

    function animate(now) {
      if (!startedAt) startedAt = now;
      const progress = clamp((now - startedAt) / Math.max(200, duration));
      progressRef.current = progress;
      render(progress);
      if (progress < 1) frame = requestAnimationFrame(animate);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    source.decoding = "async";
    source.onload = () => {
      ready = true;
      setFailed(false);
      resize();
      if (reducedMotion) {
        progressRef.current = 1;
        render(1);
      } else {
        frame = requestAnimationFrame(animate);
      }
    };
    source.onerror = () => setFailed(true);
    source.src = image;

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [columns, duration, image, rows]);

  return (
    <section className="dithered-media">
      <style>{styles}</style>
      <figure className="dithered-media__figure">
        <div className="dithered-media__frame">
          <canvas className="dithered-media__canvas" ref={canvasRef} role="img" aria-label={alt} />
          {failed && <div className="dithered-media__fallback">The media could not be loaded.</div>}
          <span className="dithered-media__label">Ordered dither / 04</span>
          <span className="dithered-media__axis" aria-hidden="true" />
        </div>
        <figcaption className="dithered-media__meta">
          <h2 className="dithered-media__title">From signal to full resolution.</h2>
          <span className="dithered-media__note">Canvas 2D / single image</span>
        </figcaption>
      </figure>
    </section>
  );
}
