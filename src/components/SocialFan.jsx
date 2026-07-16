import { useEffect, useRef, useState } from "react";

const styles = `
.social-fan { min-height: 100%; position: relative; overflow: hidden; display: grid; align-content: space-between; padding: clamp(24px, 3vw, 36px); background: #f6f6ef; color: #171812; }
.social-fan__head { position: relative; z-index: 20; text-align: center; }
.social-fan__title { margin: 0; font: 600 clamp(36px, 4.7vw, 56px)/.8 "DM Sans", sans-serif; }
.social-fan__title span { display: block; font-family: "Instrument Serif", serif; font-weight: 400; }
.social-fan__deck { position: absolute; z-index: 2; left: 50%; top: 60%; width: 100%; height: 56%; transform: translate(-50%, -50%); }
.social-fan__rise { position: absolute; left: 50%; top: 50%; width: clamp(100px, 12.8vw, 164px); aspect-ratio: 4 / 7; z-index: var(--z); transform: translate(-50%, -50%) translateY(160px); will-change: transform; }
.social-fan__card { --fan-x: var(--x-desktop); --fan-y: var(--y-desktop); --fan-rotation: var(--rotation); width: 100%; height: 100%; padding: 0; border: 0; border-radius: 20px; overflow: hidden; background: #c8cec7; box-shadow: 0 18px 46px rgba(20,22,17,.14); cursor: pointer; transform: translate(var(--fan-x), var(--fan-y)) rotate(var(--fan-rotation)) scale(var(--scale)); transition: transform 500ms cubic-bezier(.18,1.35,.32,1), box-shadow 300ms ease; transition-delay: var(--interaction-delay); transform-origin: center; will-change: transform; }
.social-fan:not(.is-entered) .social-fan__card { transform: translate(0, 0) rotate(0) scale(1); }
.social-fan.is-entered:not(.is-settled) .social-fan__rise { animation: social-fan-rise 800ms cubic-bezier(.25,.46,.45,.94) var(--rise-delay) both; }
.social-fan.is-entered:not(.is-settled) .social-fan__card { pointer-events: none; animation: social-fan-spread 1200ms cubic-bezier(.18,1.35,.32,1) var(--spread-delay) both; transition: none; }
.social-fan.is-settled .social-fan__rise { transform: translate(-50%, -50%) translateY(0); }
.social-fan__card:hover, .social-fan__card:focus-visible { box-shadow: 0 28px 70px rgba(20,22,17,.22); }
.social-fan__card:focus-visible { outline: 3px solid #171812; outline-offset: 5px; }
.social-fan__image { width: 100%; height: 100%; display: block; object-fit: cover; transition: transform 720ms cubic-bezier(.16,1,.3,1), filter 350ms ease; }
.social-fan__card:hover .social-fan__image, .social-fan__card:focus-visible .social-fan__image, .social-fan__card.is-active .social-fan__image { transform: scale(1.045); filter: saturate(1.08); }
.social-fan__index { position: absolute; z-index: 3; left: 12px; top: 12px; padding: 7px 8px; background: #d9ff42; color: #171812; font: 600 9px/1 "DM Sans", sans-serif; }
.social-fan__foot { position: relative; z-index: 20; display: flex; justify-content: center; gap: 28px; color: #666a62; font: 600 10px/1.2 "DM Sans", sans-serif; text-transform: uppercase; }
@keyframes social-fan-rise {
  from { transform: translate(-50%, -50%) translateY(160px); }
  to { transform: translate(-50%, -50%) translateY(0); }
}
@keyframes social-fan-spread {
  from { transform: translate(0, 0) rotate(0) scale(1); }
  to { transform: translate(var(--fan-x), var(--fan-y)) rotate(var(--fan-rotation)) scale(var(--scale)); }
}
@media (max-width: 700px) {
  .social-fan__deck { top: 62%; height: 52%; }
  .social-fan__rise { width: 110px; }
  .social-fan__card { --fan-x: var(--x-mobile); --fan-y: var(--y-mobile); --fan-rotation: var(--mobile-rotation); border-radius: 18px; }
  .social-fan__foot { gap: 14px; flex-wrap: wrap; }
}
@media (prefers-reduced-motion: reduce) {
  .social-fan__rise, .social-fan__card, .social-fan__image { animation: none !important; transition: none; }
}
`;

const images = [
  "/images/retro-oval-horizon.png",
  "/images/retro-cloud-stairway.png",
  "/images/retro-cosmic-paths.png",
  "/images/retro-media-orbit.png",
  "/images/retro-cosmic-paths.png",
  "/images/retro-cloud-stairway.png",
  "/images/retro-oval-horizon.png",
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

export default function SocialFan({ cards = images }) {
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
      className={`social-fan ${entered ? "is-entered" : ""} ${settled ? "is-settled" : ""}`}
      onPointerLeave={handleGalleryLeave}
    >
      <style>{styles}</style>
      <div className="social-fan__head"><h2 className="social-fan__title">What’s moving <span>through the studio?</span></h2></div>
      <div className="social-fan__deck">
        {cards.slice(0, 7).map((image, index) => {
          const position = positionFor(index, active);
          return (
            <div
              className="social-fan__rise"
              key={`${image}-${index}`}
              style={{
                "--z": position.z,
                "--rise-delay": `${(6 - index) * (500 / 6)}ms`,
              }}
            >
              <button
                className={`social-fan__card ${active === index ? "is-active" : ""}`}
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
                <img className="social-fan__image" src={image} alt="" />
                <span className="social-fan__index">{String(index + 1).padStart(2, "0")}</span>
              </button>
            </div>
          );
        })}
      </div>
      <div className="social-fan__foot"><span>Work</span><span>Process</span><span>People</span><span>Notes</span></div>
    </section>
  );
}
