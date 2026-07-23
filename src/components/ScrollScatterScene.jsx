import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const styles = `
.scroll-scatter {
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: pan-y;
  scrollbar-width: none;
  background: #000;
  color: #f6f6ef;
}
.scroll-scatter::-webkit-scrollbar { display: none; }
.scroll-scatter:focus-visible { outline: 2px solid #f6f6ef; outline-offset: -2px; }
.scroll-scatter__track { position: relative; height: var(--track-height); }
.scroll-scatter__stage {
  position: sticky;
  top: 0;
  height: var(--stage-height);
  min-height: 1px;
  overflow: hidden;
  isolation: isolate;
  contain: paint;
  background: #000;
}
.scroll-scatter__canvas {
  position: absolute;
  z-index: 2;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  contain: strict;
  pointer-events: none;
}
.scroll-scatter__copy {
  position: absolute;
  z-index: 3;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 48px clamp(24px, 11vw, 170px);
  pointer-events: none;
}
.scroll-scatter__line {
  position: absolute;
  width: min(960px, 74%);
  margin: 0;
  color: #f6f6ef;
  font: 400 clamp(29px, 2.6vw, 38px)/.98 "Instrument Serif", serif;
  letter-spacing: 0;
  text-align: center;
  text-wrap: balance;
  opacity: var(--copy-opacity);
  transform: translate3d(0, var(--copy-y), 0) scale(var(--copy-scale));
  transform-origin: center;
  transition:
    opacity 1000ms cubic-bezier(.43, .01, .3, .99),
    transform 1000ms cubic-bezier(.43, .01, .3, .99);
  will-change: opacity, transform;
}
.scroll-scatter__cue {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 18px;
  height: 18px;
  color: rgba(246,246,239,.62);
  opacity: var(--cue-opacity);
  stroke-width: 1.6;
  transform: translate(-50%, clamp(52px, 7vw, 76px));
  transition: opacity 180ms ease;
  animation: scatter-scroll-cue 1500ms cubic-bezier(.4,0,.2,1) infinite;
}
.scroll-scatter.is-reduced { overflow: hidden; }
.scroll-scatter.is-reduced .scroll-scatter__line {
  transition: none;
  will-change: auto;
}
.scroll-scatter.is-reduced .scroll-scatter__cue { animation: none; }

@keyframes scatter-scroll-cue {
  0%, 100% { margin-top: 0; }
  50% { margin-top: 6px; }
}

@media (max-width: 700px) {
  .scroll-scatter__copy { padding: 44px 18px; }
  .scroll-scatter__line { width: min(350px, 88%); font-size: 31px; line-height: .98; }
}
`;

const SCENE_PERSPECTIVE = 1200;
const MAX_CANVAS_DPR = 2;

const defaultImages = [
  { image: "/images/retro-stellar-ring.webp", alt: "A luminous blue ring crossing a star field", left: "41.611%", top: "33.5%", width: "6.777%", height: "9%", mobileLeft: "30.561%", mobileTop: "35.832%", mobileWidth: "14.872%", mobileHeight: "6.335%", position: "58% 52%", mobilePosition: "56% 52%", start: 0, depth: 1190, cruiseDepth: 1048, handoff: 0.24 },
  { image: "/images/retro-yellow-gateway.webp", alt: "A checkerboard path passing through a yellow gateway", left: "61.424%", top: "28.79%", width: "7.153%", height: "12.42%", mobileLeft: "51.923%", mobileTop: "19.713%", mobileWidth: "26.154%", mobileHeight: "14.573%", position: "50% 44%", mobilePosition: "50% 43%", start: 0, depth: 1190, cruiseDepth: 1048, handoff: 0.24 },
  { image: "/images/retro-disc-signal.webp", alt: "Signal cables extending from a floating compact disc", left: "26.25%", top: "57.433%", width: "7.5%", height: "15.134%", mobileLeft: "18.946%", mobileTop: "57.195%", mobileWidth: "24.103%", mobileHeight: "15.608%", position: "50% 49%", mobilePosition: "50% 50%", start: 0, depth: 1190, cruiseDepth: 1048, handoff: 0.24 },
  { image: "/images/retro-window-reflection.webp", alt: "An open window and ladder reflected in a violet landscape", left: "61.645%", top: "71.915%", width: "12.708%", height: "22.17%", mobileLeft: "73.562%", mobileTop: "65.439%", mobileWidth: "44.872%", mobileHeight: "25.12%", position: "50% 48%", mobilePosition: "50% 48%", start: 0, depth: 1190, cruiseDepth: 1048, handoff: 0.24 },
  { image: "/images/retro-planetary-voyage.webp", alt: "A small spacecraft passing stars and a red planet", left: "44.659%", top: "82.4%", width: "8.681%", height: "15.2%", mobileLeft: "48.229%", mobileTop: "85.948%", mobileWidth: "21.538%", mobileHeight: "12.102%", position: "50% 50%", mobilePosition: "50% 50%", fit: "contain", mobileFit: "contain", background: "#111016", start: 0.24, depth: 600 },
  { image: "/images/retro-media-orbit.webp", alt: "Storage media and planets in a grainy star field", left: "46.714%", top: "-7.923%", width: "12.569%", height: "21.847%", mobileLeft: "25.845%", mobileTop: "-14.797%", mobileWidth: "42.308%", mobileHeight: "23.597%", position: "50% 43%", mobilePosition: "50% 48%", start: 0.24, depth: 600 },
  { image: "/images/retro-cloud-stairway.webp", alt: "A stairway crossing pink clouds", left: "10.597%", top: "1.034%", width: "16.806%", height: "29.931%", mobileLeft: "-29.716%", mobileTop: "-3.556%", mobileWidth: "47.436%", mobileHeight: "27.11%", position: "52% 54%", mobilePosition: "52% 56%", start: 0.24, depth: 1190 },
  { image: "/images/retro-oval-horizon.webp", alt: "A figure climbing toward an oval horizon", left: "84.902%", top: "27.236%", width: "18.194%", height: "31.528%", mobileLeft: "92.228%", mobileTop: "40.451%", mobileWidth: "41.538%", mobileHeight: "23.097%", position: "53% 47%", mobilePosition: "53% 47%", start: 0.24, depth: 1000 },
  { image: "/images/retro-luminous-black-hole.webp", alt: "Luminous paths bending around a black hole", left: "16.569%", top: "75.783%", width: "4.861%", height: "8.434%", mobileLeft: "16.999%", mobileTop: "76.431%", mobileWidth: "20%", mobileHeight: "11.137%", position: "50% 50%", mobilePosition: "50% 50%", fit: "contain", mobileFit: "contain", background: "#070511", start: 0.24, depth: 1190 },
  { image: "/images/retro-cosmic-paths.webp", alt: "Interlaced paths floating through space", left: "88.687%", top: "-13.17%", width: "10.625%", height: "18.341%", mobileLeft: "82.74%", mobileTop: "-1.45%", mobileWidth: "30.513%", mobileHeight: "16.901%", position: "48% 54%", mobilePosition: "48% 55%", start: 0.62, depth: 600 },
  { image: "/images/retro-media-orbit.webp", alt: "Planets and storage media crossing a rainbow beam", left: "-11.784%", top: "63.785%", width: "17.569%", height: "30.43%", mobileLeft: "-47.075%", mobileTop: "71.394%", mobileWidth: "56.154%", mobileHeight: "31.209%", position: "50% 76%", mobilePosition: "50% 78%", start: 0.62, depth: 1190 },
];

const defaultMessages = [
  "Built through years of creative practice",
  "A trusted network brings many disciplines into view",
  "With real-world experience",
];

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(value) {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
}

function range(progress, start, end) {
  return smoothstep((progress - start) / (end - start));
}

function linearRange(progress, start, end = 1) {
  return clamp((progress - start) / (end - start));
}

function hermite(value, start, end, startSlope, endSlope, duration) {
  const t = clamp(value);
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * start
    + (t3 - 2 * t2 + t) * duration * startSlope
    + (-2 * t3 + 3 * t2) * end
    + (t3 - t2) * duration * endSlope
  );
}

function imageDepth(progress, item, initialDepth) {
  if (!item.cruiseDepth) {
    return initialDepth * (1 - linearRange(progress, item.start ?? 0));
  }

  const handoff = item.handoff ?? 0.24;
  const blendStart = Math.max(0, handoff - 0.06);
  const blendEnd = Math.min(1, handoff + 0.06);
  const fastSlope = (item.cruiseDepth * (1 - handoff) - initialDepth) / handoff;
  const cruiseSlope = -item.cruiseDepth;

  if (progress <= blendStart) {
    return initialDepth + fastSlope * progress;
  }

  if (progress < blendEnd) {
    const startDepth = initialDepth + fastSlope * blendStart;
    const endDepth = item.cruiseDepth * (1 - blendEnd);
    return hermite(
      (progress - blendStart) / (blendEnd - blendStart),
      startDepth,
      endDepth,
      fastSlope,
      cruiseSlope,
      blendEnd - blendStart,
    );
  }

  return item.cruiseDepth * (1 - progress);
}

function percentage(value, fallback = 0) {
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed / 100 : fallback;
}

function positionValue(value, axis) {
  if (!value) return 0.5;
  if (value === "center") return 0.5;
  if (axis === "x" && value === "left") return 0;
  if (axis === "x" && value === "right") return 1;
  if (axis === "y" && value === "top") return 0;
  if (axis === "y" && value === "bottom") return 1;
  return percentage(value, 0.5);
}

function objectPosition(value = "center") {
  const parts = value.trim().split(/\s+/);
  return {
    x: positionValue(parts[0], "x"),
    y: positionValue(parts[1] ?? parts[0], "y"),
  };
}

function projectedImage(stageWidth, stageHeight, item, progress, isMobile) {
  const start = item.start ?? 0;
  const localProgress = linearRange(progress, start);
  const opacity = range(localProgress, 0.025, 0.08);
  const initialDepth = item.depth
    ?? Math.min(1190, Math.max(600, Math.abs(item.from ?? 145) * 8));
  const depth = imageDepth(progress, item, initialDepth);
  const scale = SCENE_PERSPECTIVE / Math.max(1, SCENE_PERSPECTIVE - depth);
  const left = percentage(isMobile ? item.mobileLeft ?? item.left : item.left);
  const top = percentage(isMobile ? item.mobileTop ?? item.top : item.top);
  const width = stageWidth * percentage(isMobile ? item.mobileWidth ?? item.width : item.width);
  const height = stageHeight * percentage(isMobile ? item.mobileHeight ?? item.height : item.height);
  const driftX = (item.driftX || 0) * (1 - localProgress);
  const driftY = (item.driftY || 0) * (1 - localProgress);
  const centerX = stageWidth * left + width / 2 + driftX;
  const centerY = stageHeight * top + height / 2 + driftY;
  const projectedCenterX = stageWidth / 2 + (centerX - stageWidth / 2) * scale;
  const projectedCenterY = stageHeight / 2 + (centerY - stageHeight / 2) * scale;
  const projectedWidth = width * scale;
  const projectedHeight = height * scale;

  return {
    x: projectedCenterX - projectedWidth / 2,
    y: projectedCenterY - projectedHeight / 2,
    width: projectedWidth,
    height: projectedHeight,
    opacity,
    depth,
    fit: isMobile ? item.mobileFit ?? item.fit ?? "cover" : item.fit ?? "cover",
    position: objectPosition(
      isMobile ? item.mobilePosition ?? item.position : item.position,
    ),
    background: item.background || "transparent",
  };
}

function drawProjectedImage(context, media, frame) {
  if (frame.opacity <= 0.001 || frame.width <= 0 || frame.height <= 0) return false;

  context.save();
  context.globalAlpha = frame.opacity;
  context.beginPath();
  context.rect(frame.x, frame.y, frame.width, frame.height);
  context.clip();

  if (frame.background !== "transparent") {
    context.fillStyle = frame.background;
    context.fillRect(frame.x, frame.y, frame.width, frame.height);
  }

  if (media?.naturalWidth && media?.naturalHeight) {
    const fitScale = frame.fit === "contain"
      ? Math.min(frame.width / media.naturalWidth, frame.height / media.naturalHeight)
      : Math.max(frame.width / media.naturalWidth, frame.height / media.naturalHeight);
    const drawWidth = media.naturalWidth * fitScale * 1.01;
    const drawHeight = media.naturalHeight * fitScale * 1.01;
    const drawX = frame.x + (frame.width - drawWidth) * frame.position.x;
    const drawY = frame.y + (frame.height - drawHeight) * frame.position.y;

    context.filter = "saturate(1.04) brightness(1.03)";
    context.drawImage(media, drawX, drawY, drawWidth, drawHeight);
  }

  context.restore();
  return true;
}

const copyVariants = [
  [
    { opacity: 1, scale: 1.5, y: 0 },
    { opacity: 0, scale: 1.2, y: 130 },
    { opacity: 0, scale: 1.2, y: 100 },
  ],
  [
    { opacity: 1, scale: 1, y: 0 },
    { opacity: 0, scale: 1.2, y: 130 },
    { opacity: 0, scale: 1.2, y: 100 },
  ],
  [
    { opacity: 0, scale: 0.7, y: -100 },
    { opacity: 1, scale: 1, y: 0 },
    { opacity: 0, scale: 1.2, y: 100 },
  ],
  [
    { opacity: 0, scale: 0.7, y: -100 },
    { opacity: 0, scale: 0.7, y: -80 },
    { opacity: 1, scale: 1, y: 0 },
  ],
];

function copyPhaseForProgress(progress) {
  if (progress >= 0.619) return 3;
  if (progress >= 0.2374) return 2;
  return 1;
}

export default function ScrollScatterScene({
  images = defaultImages,
  messages = defaultMessages,
}) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaElementsRef = useRef([]);
  const copyPhaseRef = useRef(0);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const animationFrameRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [copyPhase, setCopyPhase] = useState(0);
  const [stageSize, setStageSize] = useState({ width: 1, height: 620 });
  const [mediaRevision, setMediaRevision] = useState(0);
  const [readyImageCount, setReadyImageCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const resizeObserver = new ResizeObserver(() => {
      const nextSize = {
        width: Math.max(1, root.clientWidth),
        height: Math.max(1, root.clientHeight),
      };
      setStageSize((current) => (
        current.width === nextSize.width && current.height === nextSize.height
          ? current
          : nextSize
      ));
    });

    resizeObserver.observe(root);
    updateMotion();
    media.addEventListener?.("change", updateMotion);
    return () => {
      resizeObserver.disconnect();
      media.removeEventListener?.("change", updateMotion);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loadedCount = 0;
    const records = images.slice(0, 11).map((item) => ({ item, media: null, settled: false }));
    mediaElementsRef.current = records;
    setReadyImageCount(0);
    setMediaRevision((value) => value + 1);

    records.forEach((record) => {
      const media = new Image();
      media.decoding = "async";
      record.media = media;

      const settle = (loaded) => {
        if (cancelled || record.settled) return;
        record.settled = true;
        if (loaded) loadedCount += 1;
        else record.media = null;
        setReadyImageCount(loadedCount);
        setMediaRevision((value) => value + 1);
      };

      media.addEventListener("load", () => settle(true), { once: true });
      media.addEventListener("error", () => settle(false), { once: true });
      media.src = record.item.image;
      if (media.complete) settle(media.naturalWidth > 0);
    });

    return () => {
      cancelled = true;
      records.forEach((record) => {
        if (!record.media) return;
        record.media.onload = null;
        record.media.onerror = null;
      });
    };
  }, [images]);

  useEffect(() => {
    if (reducedMotion) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
      progressRef.current = 1;
      targetProgressRef.current = 1;
      copyPhaseRef.current = 3;
      setCopyPhase(3);
      setProgress(1);
      return undefined;
    }

    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return undefined;
    let previousFrameTime = 0;

    const commitProgress = (nextProgress) => {
      const nextPhase = copyPhaseForProgress(nextProgress);
      progressRef.current = nextProgress;
      setProgress(nextProgress);
      if (nextPhase !== copyPhaseRef.current) {
        copyPhaseRef.current = nextPhase;
        setCopyPhase(nextPhase);
      }
    };

    const animate = (time) => {
      const current = progressRef.current;
      const target = targetProgressRef.current;
      const distance = target - current;
      const delta = previousFrameTime ? Math.min(64, time - previousFrameTime) : 1000 / 60;
      const smoothing = 1 - (0.88 ** (delta / (1000 / 60)));
      const nextProgress = Math.abs(distance) < 0.0005 ? target : current + distance * smoothing;
      previousFrameTime = time;

      commitProgress(nextProgress);
      if (nextProgress !== target) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = 0;
        previousFrameTime = 0;
      }
    };

    const updateTarget = () => {
      const limit = Math.max(0, root.scrollHeight - root.clientHeight);
      targetProgressRef.current = limit ? clamp(root.scrollTop / limit) : 0;
      if (!animationFrameRef.current) animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? root.clientHeight : 1;
      event.preventDefault();
      event.stopPropagation();
      root.scrollTop += event.deltaY * multiplier;
    };

    root.addEventListener("scroll", updateTarget, { passive: true });
    root.addEventListener("wheel", handleWheel, { passive: false });
    updateTarget();
    return () => {
      root.removeEventListener("scroll", updateTarget);
      root.removeEventListener("wheel", handleWheel);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || copyPhaseRef.current !== 0) return undefined;
    const frame = requestAnimationFrame(() => {
      copyPhaseRef.current = 1;
      setCopyPhase(1);
    });
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  const displayProgress = reducedMotion ? 1 : progress;
  const stageHeight = stageSize.height;
  const trackHeight = reducedMotion ? stageHeight : stageHeight * 3.1;
  const copyStates = copyVariants[reducedMotion ? 3 : copyPhase];
  const activeMessage = Math.max(0, (reducedMotion ? 3 : copyPhase) - 1);
  const cueOpacity = reducedMotion ? 0 : Math.max(0, 1 - displayProgress / 0.04);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = stageSize.width;
    const height = stageSize.height;
    const pixelRatio = Math.min(MAX_CANVAS_DPR, window.devicePixelRatio || 1);
    const pixelWidth = Math.max(1, Math.round(width * pixelRatio));
    const pixelHeight = Math.max(1, Math.round(height * pixelRatio));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    const context = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!context) return;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    const isMobile = window.innerWidth <= 700;
    const frames = images.slice(0, 11).map((item) => (
      projectedImage(width, height, item, displayProgress, isMobile)
    ));
    let renderedImages = 0;
    let maxProjectedArea = 0;
    let totalProjectedArea = 0;

    frames.forEach((frame, index) => {
      if (frame.opacity > 0.001) {
        const area = frame.width * frame.height;
        maxProjectedArea = Math.max(maxProjectedArea, area);
        totalProjectedArea += area;
      }
      if (drawProjectedImage(context, mediaElementsRef.current[index]?.media, frame)) {
        renderedImages += 1;
      }
    });

    context.filter = "none";
    context.globalAlpha = 1;
    canvas.dataset.readyImages = String(readyImageCount);
    canvas.dataset.renderedImages = String(renderedImages);
    canvas.dataset.surfacePixels = String(pixelWidth * pixelHeight);
    canvas.dataset.maxProjectedArea = maxProjectedArea.toFixed(3);
    canvas.dataset.totalProjectedArea = totalProjectedArea.toFixed(3);
    canvas.dataset.depths = frames.map((frame) => frame.depth.toFixed(3)).join(",");
    canvas.dataset.opacities = frames.map((frame) => frame.opacity.toFixed(3)).join(",");
  }, [displayProgress, images, mediaRevision, readyImageCount, stageSize]);

  return (
    <section
      className={`scroll-scatter ${reducedMotion ? "is-reduced" : ""}`}
      ref={rootRef}
      tabIndex={0}
      aria-label="Scrollable staged image scene"
      data-copy-phase={reducedMotion ? 3 : copyPhase}
      data-progress={displayProgress.toFixed(4)}
      data-target-progress={targetProgressRef.current.toFixed(4)}
      style={{
        "--stage-height": `${stageHeight}px`,
        "--track-height": `${trackHeight}px`,
      }}
    >
      <style>{styles}</style>
      <div className="scroll-scatter__track" ref={trackRef}>
        <div className="scroll-scatter__stage">
          <canvas
            className="scroll-scatter__canvas"
            ref={canvasRef}
            aria-hidden="true"
            data-renderer="canvas-2d"
          />

          <div className="scroll-scatter__copy">
            {messages.slice(0, 3).map((message, index) => {
              const state = copyStates[index];
              return (
                <h2
                  className="scroll-scatter__line"
                  key={`${message}-${index}`}
                  aria-hidden={index !== activeMessage}
                  style={{
                    "--copy-opacity": state.opacity,
                    "--copy-scale": state.scale,
                    "--copy-y": `${state.y}px`,
                  }}
                >
                  {message}
                </h2>
              );
            })}
            <ChevronDown
              className="scroll-scatter__cue"
              style={{ "--cue-opacity": cueOpacity }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
