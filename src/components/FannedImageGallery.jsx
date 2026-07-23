import { useEffect, useRef, useState } from "react";

const styles = `
.fanned-image-gallery { min-height: 100%; position: relative; overflow: hidden; background: #000; color: #f6f6ef; }
.fanned-image-gallery__deck { position: absolute; z-index: 2; left: 50%; top: 50%; width: 100%; height: 72%; transform: translate(-50%, -50%); }
.fanned-image-gallery__rise { position: absolute; left: 50%; top: 50%; width: clamp(160px, 20.48vw, 262px); aspect-ratio: 4 / 7; z-index: var(--z); transform: translate(-50%, -50%) translateY(160px); will-change: transform; }
.fanned-image-gallery__card { --fan-x: var(--x-desktop); --fan-y: var(--y-desktop); --fan-rotation: var(--rotation); width: 100%; height: 100%; padding: 0; border: 0; border-radius: 20px; overflow: hidden; background: #111; box-shadow: 0 18px 46px rgba(0,0,0,.32); cursor: pointer; transform: translate(var(--fan-x), var(--fan-y)) rotate(var(--fan-rotation)) scale(var(--scale)); transition: transform 500ms cubic-bezier(.18,1.35,.32,1), box-shadow 300ms ease; transition-delay: var(--interaction-delay); transform-origin: center; will-change: transform; }
.fanned-image-gallery:not(.is-entered) .fanned-image-gallery__card { transform: translate(0, 0) rotate(0) scale(1); }
.fanned-image-gallery.is-entered:not(.is-settled) .fanned-image-gallery__rise { animation: fanned-image-gallery-rise 800ms cubic-bezier(.25,.46,.45,.94) var(--rise-delay) both; }
.fanned-image-gallery.is-entered:not(.is-settled) .fanned-image-gallery__card { pointer-events: none; animation: fanned-image-gallery-spread 1200ms cubic-bezier(.18,1.35,.32,1) var(--spread-delay) both; transition: none; }
.fanned-image-gallery.is-settled .fanned-image-gallery__rise { transform: translate(-50%, -50%) translateY(0); }
.fanned-image-gallery__card:hover, .fanned-image-gallery__card:focus-visible { box-shadow: 0 28px 70px rgba(20,22,17,.22); }
.fanned-image-gallery__card:focus-visible { outline: 2px solid #f6f6ef; outline-offset: 5px; }
.fanned-image-gallery__image { width: 100%; height: 100%; display: block; object-fit: cover; transition: transform 720ms cubic-bezier(.16,1,.3,1), filter 350ms ease; }
.fanned-image-gallery__card:hover .fanned-image-gallery__image, .fanned-image-gallery__card:focus-visible .fanned-image-gallery__image, .fanned-image-gallery__card.is-active .fanned-image-gallery__image { transform: scale(1.045); filter: saturate(1.08); }
@keyframes fanned-image-gallery-rise {
  from { transform: translate(-50%, -50%) translateY(160px); }
  to { transform: translate(-50%, -50%) translateY(0); }
}
@keyframes fanned-image-gallery-spread {
  from { transform: translate(0, 0) rotate(0) scale(1); }
  to { transform: translate(var(--fan-x), var(--fan-y)) rotate(var(--fan-rotation)) scale(var(--scale)); }
}
@media (max-width: 700px) {
  .fanned-image-gallery__deck { height: 60%; }
  .fanned-image-gallery__rise { width: 110px; }
  .fanned-image-gallery__card { --fan-x: var(--x-mobile); --fan-y: var(--y-mobile); --fan-rotation: var(--mobile-rotation); border-radius: 18px; }
}
@media (prefers-reduced-motion: reduce) {
  .fanned-image-gallery__rise, .fanned-image-gallery__card, .fanned-image-gallery__image { animation: none !important; transition: none; }
}
`;

const images = [
  "/images/retro-oval-horizon.webp",
  "/images/retro-cloud-stairway.webp",
  "/images/retro-cosmic-paths.webp",
  "/images/retro-media-orbit.webp",
  "/images/retro-disc-signal.webp",
  "/images/retro-stellar-ring.webp",
  "/images/retro-window-reflection.webp",
];

const base = [
  { x: -340, y: 32, scale: .776, rotation: -21, z: 1 },
  { x: -250, y: 22, scale: .85, rotation: -14, z: 2 },
  { x: -125, y: 8, scale: .935, rotation: -7, z: 3 },
  { x: 0, y: 0, scale: 1, rotation: 0, z: 10 },
  { x: 125, y: 8, scale: .935, rotation: 7, z: 3 },
  { x: 250, y: 22, scale: .85, rotation: 14, z: 2 },
  { x: 340, y: 32, scale: .776, rotation: 21, z: 1 },
];

function positionFor(index, active) {
  const item = base[index];
  if (active === null) return item;
  const distance = Math.abs(index - active);
  if (index === active) return { ...item, y: item.y - 40, scale: item.scale * 1.08 };
  const direction = index < active ? -1 : 1;
  const push = Math.max(0, 4 - distance) * 24;
  return { ...item, x: item.x + direction * push, rotation: item.rotation + direction * (3 / (distance + 1)), z: item.z };
}

export default function FannedImageGallery({ cards = images }) {
  const rootRef = useRef(null);
  const hoverResetTimerRef = useRef(null);
  const [entered, setEntered] = useState(false);
  const [settled, setSettled] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);
  const [selected, setSelected] = useState(null);
  const active = hovered ?? focused ?? selected;

  useEffect(() => {
    const root = rootRef.current;
    let enterFrame;
    let settleTimer;

    const enter = () => {
      setEntered(true);
      settleTimer = window.setTimeout(() => setSettled(true), 2300);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEntered(true);
      setSettled(true);
      return undefined;
    }

    const queueEntrance = () => {
      enterFrame = requestAnimationFrame(() => {
        enterFrame = requestAnimationFrame(enter);
      });
    };

    if (!("IntersectionObserver" in window)) {
      queueEntrance();
      return () => {
        cancelAnimationFrame(enterFrame);
        clearTimeout(settleTimer);
      };
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      queueEntrance();
    }, { rootMargin: "0px 0px -10% 0px", threshold: .01 });

    observer.observe(root);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(enterFrame);
      clearTimeout(settleTimer);
    };
  }, []);

  useEffect(() => () => clearTimeout(hoverResetTimerRef.current), []);

  const clearHoverReset = () => {
    clearTimeout(hoverResetTimerRef.current);
    hoverResetTimerRef.current = null;
  };

  const handleHoverEnter = (index) => {
    clearHoverReset();
    setHovered(index);
  };

  const handleHoverLeave = (index) => {
    clearHoverReset();
    hoverResetTimerRef.current = window.setTimeout(() => {
      setHovered((value) => value === index ? null : value);
      hoverResetTimerRef.current = null;
    }, 50);
  };

  const handleGalleryLeave = () => {
    clearHoverReset();
    setHovered(null);
  };

  return (
    <section
      ref={rootRef}
      className={`fanned-image-gallery ${entered ? "is-entered" : ""} ${settled ? "is-settled" : ""}`}
      onPointerLeave={handleGalleryLeave}
    >
      <style>{styles}</style>
      <div className="fanned-image-gallery__deck">
        {cards.slice(0, 7).map((image, index) => {
          const position = positionFor(index, active);
          return (
            <div
              className="fanned-image-gallery__rise"
              key={`${image}-${index}`}
              style={{
                "--z": position.z,
                "--rise-delay": `${(6 - index) * (500 / 6)}ms`,
              }}
            >
              <button
                className={`fanned-image-gallery__card ${active === index ? "is-active" : ""}`}
                type="button"
                style={{
                  "--x-desktop": `${position.x}px`,
                  "--y-desktop": `${position.y}px`,
                  "--x-mobile": `${position.x * .31}px`,
                  "--y-mobile": `${position.y * .58}px`,
                  "--rotation": `${position.rotation}deg`,
                  "--mobile-rotation": `${position.rotation * .72}deg`,
                  "--scale": position.scale,
                  "--spread-delay": `${900 + Math.abs(index - 3) * (200 / 3)}ms`,
                  "--interaction-delay": active === null ? "0ms" : `${Math.abs(index - active) * 20}ms`,
                }}
                onPointerEnter={(event) => {
                  if (event.pointerType !== "touch") handleHoverEnter(index);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType !== "touch") handleHoverLeave(index);
                }}
                onFocus={() => setFocused(index)}
                onBlur={() => setFocused((value) => value === index ? null : value)}
                onClick={() => setSelected((value) => value === index ? null : index)}
                tabIndex={settled ? 0 : -1}
                aria-pressed={selected === index}
                aria-label={`Select gallery card ${index + 1}`}
              >
                <img className="fanned-image-gallery__image" src={image} alt="" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
