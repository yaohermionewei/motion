import Lenis from "lenis-1-3-19";
import { useEffect, useRef, useState } from "react";

const styles = `
.scroll-scatter {
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  background: #f5f4ef;
  color: #20211d;
}
.scroll-scatter::-webkit-scrollbar { display: none; }
.scroll-scatter:focus-visible { outline: 3px solid #20211d; outline-offset: -3px; }
.scroll-scatter__track { position: relative; height: var(--track-height); }
.scroll-scatter__stage {
  position: sticky;
  top: 0;
  height: var(--stage-height);
  min-height: 1px;
  overflow: hidden;
  isolation: isolate;
  background: #f5f4ef;
}
.scroll-scatter__images {
  position: absolute;
  z-index: 2;
  inset: 0;
  perspective: var(--scene-perspective);
  perspective-origin: 50% 50%;
  transform-style: preserve-3d;
  pointer-events: none;
}
.scroll-scatter__image {
  position: absolute;
  left: var(--left);
  top: var(--top);
  width: var(--width);
  height: var(--height);
  margin: 0;
  overflow: hidden;
  background: var(--image-background, transparent);
  opacity: var(--image-opacity);
  transform: translate3d(var(--drift-x), var(--drift-y), var(--depth));
  transform-origin: center;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  will-change: transform, opacity;
}
.scroll-scatter__image img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: var(--fit, cover);
  object-position: var(--position);
  filter: saturate(1.04) brightness(1.03);
  transform: scale(1.01);
  backface-visibility: hidden;
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
  color: #20211d;
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
.scroll-scatter.is-reduced { overflow: hidden; }
.scroll-scatter.is-reduced .scroll-scatter__image,
.scroll-scatter.is-reduced .scroll-scatter__image img,
.scroll-scatter.is-reduced .scroll-scatter__line {
  transition: none;
  will-change: auto;
}

@media (max-width: 700px) {
  .scroll-scatter__copy { padding: 44px 18px; }
  .scroll-scatter__line { width: min(350px, 88%); font-size: 31px; line-height: .98; }
  .scroll-scatter__image {
    left: var(--mobile-left, var(--left));
    top: var(--mobile-top, var(--top));
    width: var(--mobile-width, var(--width));
    height: var(--mobile-height, var(--height));
  }
  .scroll-scatter__image img {
    object-fit: var(--mobile-fit, var(--fit, cover));
    object-position: var(--mobile-position, var(--position));
  }
}
`;

const defaultImages = [
  { image: "/images/retro-stellar-ring.png", alt: "A luminous blue ring crossing a star field", left: "41.611%", top: "33.5%", width: "6.777%", height: "9%", mobileLeft: "30.561%", mobileTop: "35.832%", mobileWidth: "14.872%", mobileHeight: "6.335%", position: "58% 52%", mobilePosition: "56% 52%", start: 0, depth: 1190, cruiseDepth: 1048, handoff: 0.24 },
  { image: "/images/retro-yellow-gateway.png", alt: "A checkerboard path passing through a yellow gateway", left: "61.424%", top: "28.79%", width: "7.153%", height: "12.42%", mobileLeft: "51.923%", mobileTop: "19.713%", mobileWidth: "26.154%", mobileHeight: "14.573%", position: "50% 44%", mobilePosition: "50% 43%", start: 0, depth: 1190, cruiseDepth: 1048, handoff: 0.24 },
  { image: "/images/retro-disc-signal.png", alt: "Signal cables extending from a floating compact disc", left: "26.25%", top: "57.433%", width: "7.5%", height: "15.134%", mobileLeft: "18.946%", mobileTop: "57.195%", mobileWidth: "24.103%", mobileHeight: "15.608%", position: "50% 49%", mobilePosition: "50% 50%", start: 0, depth: 1190, cruiseDepth: 1048, handoff: 0.24 },
  { image: "/images/retro-window-reflection.png", alt: "An open window and ladder reflected in a violet landscape", left: "61.645%", top: "71.915%", width: "12.708%", height: "22.17%", mobileLeft: "73.562%", mobileTop: "65.439%", mobileWidth: "44.872%", mobileHeight: "25.12%", position: "50% 48%", mobilePosition: "50% 48%", start: 0, depth: 1190, cruiseDepth: 1048, handoff: 0.24 },
  { image: "/images/retro-planetary-voyage.png", alt: "A small spacecraft passing stars and a red planet", left: "44.659%", top: "82.4%", width: "8.681%", height: "15.2%", mobileLeft: "48.229%", mobileTop: "85.948%", mobileWidth: "21.538%", mobileHeight: "12.102%", position: "50% 50%", mobilePosition: "50% 50%", fit: "contain", mobileFit: "contain", background: "#111016", start: 0.24, depth: 600 },
  { image: "/images/retro-media-orbit.png", alt: "Storage media and planets in a grainy star field", left: "46.714%", top: "-7.923%", width: "12.569%", height: "21.847%", mobileLeft: "25.845%", mobileTop: "-14.797%", mobileWidth: "42.308%", mobileHeight: "23.597%", position: "50% 43%", mobilePosition: "50% 48%", start: 0.24, depth: 600 },
  { image: "/images/retro-cloud-stairway.png", alt: "A stairway crossing pink clouds", left: "10.597%", top: "1.034%", width: "16.806%", height: "29.931%", mobileLeft: "-29.716%", mobileTop: "-3.556%", mobileWidth: "47.436%", mobileHeight: "27.11%", position: "52% 54%", mobilePosition: "52% 56%", start: 0.24, depth: 1190 },
  { image: "/images/retro-oval-horizon.png", alt: "A figure climbing toward an oval horizon", left: "84.902%", top: "27.236%", width: "18.194%", height: "31.528%", mobileLeft: "92.228%", mobileTop: "40.451%", mobileWidth: "41.538%", mobileHeight: "23.097%", position: "53% 47%", mobilePosition: "53% 47%", start: 0.24, depth: 1000 },
  { image: "/images/retro-luminous-black-hole.png", alt: "Luminous paths bending around a black hole", left: "16.569%", top: "75.783%", width: "4.861%", height: "8.434%", mobileLeft: "16.999%", mobileTop: "76.431%", mobileWidth: "20%", mobileHeight: "11.137%", position: "50% 50%", mobilePosition: "50% 50%", fit: "contain", mobileFit: "contain", background: "#070511", start: 0.24, depth: 1190 },
  { image: "/images/retro-cosmic-paths.png", alt: "Interlaced paths floating through space", left: "88.687%", top: "-13.17%", width: "10.625%", height: "18.341%", mobileLeft: "82.74%", mobileTop: "-1.45%", mobileWidth: "30.513%", mobileHeight: "16.901%", position: "48% 54%", mobilePosition: "48% 55%", start: 0.62, depth: 600 },
  { image: "/images/retro-media-orbit.png", alt: "Planets and storage media crossing a rainbow beam", left: "-11.784%", top: "63.785%", width: "17.569%", height: "30.43%", mobileLeft: "-47.075%", mobileTop: "71.394%", mobileWidth: "56.154%", mobileHeight: "31.209%", position: "50% 76%", mobilePosition: "50% 78%", start: 0.62, depth: 1190 },
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
  const copyPhaseRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [copyPhase, setCopyPhase] = useState(0);
  const [stageHeight, setStageHeight] = useState(620);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const resizeObserver = new ResizeObserver(() => {
      setStageHeight(Math.max(1, root.clientHeight));
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
    if (reducedMotion) {
      copyPhaseRef.current = 3;
      setCopyPhase(3);
      setProgress(1);
      return undefined;
    }

    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return undefined;

    const update = (scroll, limit) => {
      const nextProgress = limit ? clamp(scroll / limit) : 0;
      const nextPhase = copyPhaseForProgress(nextProgress);
      setProgress(nextProgress);
      if (nextPhase !== copyPhaseRef.current) {
        copyPhaseRef.current = nextPhase;
        setCopyPhase(nextPhase);
      }
    };
    const wheelMultiplier = clamp(root.clientHeight / window.innerHeight, 0.1, 1);

    const lenis = new Lenis({
      wrapper: root,
      content: track,
      eventsTarget: root,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.1,
      wheelMultiplier,
      autoRaf: true,
      autoResize: true,
      autoToggle: true,
      allowNestedScroll: true,
      overscroll: true,
    });
    const updateWheelMultiplier = () => {
      const nextMultiplier = clamp(root.clientHeight / window.innerHeight, 0.1, 1);
      lenis.options.wheelMultiplier = nextMultiplier;
      lenis.virtualScroll.options.wheelMultiplier = nextMultiplier;
    };
    const wheelResizeObserver = new ResizeObserver(updateWheelMultiplier);
    wheelResizeObserver.observe(root);
    window.addEventListener("resize", updateWheelMultiplier);
    const removeScrollListener = lenis.on("scroll", (state) => {
      update(state.scroll, state.limit);
    });

    update(lenis.scroll, lenis.limit);
    return () => {
      removeScrollListener?.();
      wheelResizeObserver.disconnect();
      window.removeEventListener("resize", updateWheelMultiplier);
      lenis.destroy();
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
  const trackHeight = reducedMotion ? stageHeight : stageHeight * 3.1;
  const copyStates = copyVariants[reducedMotion ? 3 : copyPhase];
  const activeMessage = Math.max(0, (reducedMotion ? 3 : copyPhase) - 1);

  return (
    <section
      className={`scroll-scatter ${reducedMotion ? "is-reduced" : ""}`}
      ref={rootRef}
      tabIndex={0}
      aria-label="Scrollable staged image scene"
      data-copy-phase={reducedMotion ? 3 : copyPhase}
      data-progress={displayProgress.toFixed(4)}
      style={{
        "--stage-height": `${stageHeight}px`,
        "--track-height": `${trackHeight}px`,
        "--scene-perspective": "1200px",
      }}
    >
      <style>{styles}</style>
      <div className="scroll-scatter__track" ref={trackRef}>
        <div className="scroll-scatter__stage">
          <div className="scroll-scatter__images" aria-hidden="true">
            {images.slice(0, 11).map((item, index) => {
              const start = item.start ?? 0;
              const localProgress = linearRange(displayProgress, start);
              const visible = range(localProgress, 0.025, 0.08);
              const depth = item.depth ?? Math.min(1190, Math.max(600, Math.abs(item.from ?? 145) * 8));
              return (
                <figure
                  className="scroll-scatter__image"
                  key={`${item.image}-${index}`}
                  data-depth={imageDepth(displayProgress, item, depth).toFixed(3)}
                  style={{
                    "--left": item.left,
                    "--top": item.top,
                    "--width": item.width,
                    "--height": item.height,
                    "--mobile-left": item.mobileLeft,
                    "--mobile-top": item.mobileTop,
                    "--mobile-width": item.mobileWidth,
                    "--mobile-height": item.mobileHeight,
                    "--position": item.position || "center",
                    "--mobile-position": item.mobilePosition || item.position || "center",
                    "--fit": item.fit || "cover",
                    "--mobile-fit": item.mobileFit || item.fit || "cover",
                    "--image-background": item.background || "transparent",
                    "--image-opacity": visible,
                    "--depth": `${imageDepth(displayProgress, item, depth)}px`,
                    "--drift-x": `${(item.driftX || 0) * (1 - localProgress)}px`,
                    "--drift-y": `${(item.driftY || 0) * (1 - localProgress)}px`,
                  }}
                >
                  <img src={item.image} alt="" />
                </figure>
              );
            })}
          </div>

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
          </div>
        </div>
      </div>
    </section>
  );
}
