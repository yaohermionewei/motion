import { useEffect, useState } from "react";

const styles = `
.hero-shrink-scene { height: 100%; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; background: #000; color: #f6f6ef; }
.hero-shrink-scene:focus-visible { outline: 2px solid #f6f6ef; outline-offset: -2px; }
.hero-shrink-scene__track { height: 190%; }
.hero-shrink-scene__stage { position: sticky; top: 0; height: 52.6316%; overflow: hidden; background: #000; }
.hero-shrink-scene__marquee { position: absolute; z-index: 1; left: -8%; top: 50%; width: 116%; color: #f6f6ef; opacity: var(--marquee-opacity); transform: translateY(-50%); font: 400 clamp(62px, 10vw, 142px)/.82 "Instrument Serif", serif; white-space: nowrap; text-align: center; }
.hero-shrink-scene__frame { position: absolute; z-index: 2; left: 50%; top: 50%; width: max(var(--frame-width), 36%); height: max(var(--frame-height), 44%); overflow: hidden; transform: translate(-50%, -50%); background: #111; box-shadow: 0 var(--shadow-y) var(--shadow-blur) rgba(0,0,0,.5); will-change:width,height,box-shadow; }
.hero-shrink-scene__image { width: 100%; height: 100%; display: block; object-fit: cover; object-position: center 30%; transform: scale(var(--image-scale)); }
.hero-shrink-scene.is-reduced { overflow: hidden; }
.hero-shrink-scene.is-reduced .hero-shrink-scene__track,
.hero-shrink-scene.is-reduced .hero-shrink-scene__stage { height: 100%; }
@media (max-width: 700px) {
  .hero-shrink-scene__frame { width: max(var(--frame-width), 68%); height: max(var(--frame-height), 46%); }
  .hero-shrink-scene__marquee { left: -35%; width: 170%; }
}
@media (prefers-reduced-motion: reduce) {
  .hero-shrink-scene__image { transform: none; }
}
`;

export default function HeroShrinkScene({
  image = "/images/retro-cosmic-paths.webp",
}) {
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener?.("change", updateMotion);
    return () => media.removeEventListener?.("change", updateMotion);
  }, []);

  const displayProgress = reducedMotion ? 1 : progress;

  function clamp(value) {
    return Math.min(1, Math.max(0, value));
  }

  function power1InOut(value) {
    const amount = clamp(value);
    return amount < 0.5
      ? 2 * amount * amount
      : 1 - ((-2 * amount + 2) ** 2) / 2;
  }

  function phase(start, end) {
    return power1InOut((displayProgress - start) / (end - start));
  }

  function handleScroll(event) {
    if (reducedMotion) return;
    const node = event.currentTarget;
    const max = node.scrollHeight - node.clientHeight;
    setProgress(max ? Math.min(node.scrollTop / max, 1) : 1);
  }

  const easedProgress = power1InOut(displayProgress);
  const marqueeProgress = phase(0.28, 1);
  const frameWidth = `${100 - easedProgress * 64}%`;
  const frameHeight = `${100 - easedProgress * 56}%`;

  return (
    <section
      className={`hero-shrink-scene ${reducedMotion ? "is-reduced" : ""}`}
      onScroll={handleScroll}
      tabIndex={0}
      aria-label="Scrollable hero shrink transition"
      data-progress={displayProgress.toFixed(4)}
      data-eased-progress={easedProgress.toFixed(4)}
      data-reduced-motion={reducedMotion ? "true" : "false"}
    >
      <style>{styles}</style>
      <div className="hero-shrink-scene__track">
        <div className="hero-shrink-scene__stage" style={{
          "--frame-width": frameWidth,
          "--frame-height": frameHeight,
          "--marquee-opacity": marqueeProgress,
          "--shadow-y": `${easedProgress * 28}px`,
          "--shadow-blur": `${easedProgress * 70}px`,
          "--image-scale": 1 + (1 - easedProgress) * 0.08,
        }}>
          <div className="hero-shrink-scene__marquee">A FRAME BECOMES A MEMORY</div>
          <div className="hero-shrink-scene__frame"><img className="hero-shrink-scene__image" src={image} alt="Portrait used for the shrink transition" /></div>
        </div>
      </div>
    </section>
  );
}
