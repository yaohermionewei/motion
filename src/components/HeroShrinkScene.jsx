import { useState } from "react";

const styles = `
.hero-shrink-scene { height: 100%; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; background: #f6f6ef; color: #171812; }
.hero-shrink-scene:focus-visible { outline: 3px solid #171812; outline-offset: -3px; }
.hero-shrink-scene__track { height: 190%; }
.hero-shrink-scene__stage { position: sticky; top: 0; height: 52.6316%; overflow: hidden; background: #f6f6ef; }
.hero-shrink-scene__dark { position: absolute; inset: 0; background: #20251c; opacity: var(--progress); }
.hero-shrink-scene__pattern { position: absolute; inset: -15%; opacity: var(--pattern-opacity); background: repeating-radial-gradient(ellipse at 30% 40%, transparent 0 72px, #9ba093 74px 75px, transparent 77px 126px); transform: scale(var(--pattern-scale)); }
.hero-shrink-scene__marquee { position: absolute; z-index: 1; left: -8%; top: 50%; width: 116%; color: #d9ff42; opacity: var(--marquee-opacity); transform: translateY(-50%); font: 400 clamp(62px, 10vw, 142px)/.82 "Instrument Serif", serif; white-space: nowrap; text-align: center; }
.hero-shrink-scene__frame { position: absolute; z-index: 2; left: 50%; top: 50%; width: max(var(--frame-width), 36%); height: max(var(--frame-height), 44%); overflow: hidden; transform: translate(-50%, -50%); background: #cbd0cb; box-shadow: 0 var(--shadow-y) var(--shadow-blur) rgba(10,12,8,.24); transition: box-shadow 120ms linear; }
.hero-shrink-scene__image { width: 100%; height: 100%; display: block; object-fit: cover; object-position: center 30%; transform: scale(var(--image-scale)); }
.hero-shrink-scene__top { position: absolute; z-index: 3; top: 24px; left: 50%; display: grid; justify-items: center; gap: 9px; color: #d9ff42; opacity: var(--top-opacity); transform: translateX(-50%); font: 600 9px/1.2 "DM Sans", sans-serif; text-transform: uppercase; }
.hero-shrink-scene__mark { width: 28px; height: 28px; display: grid; place-items: center; border: 2px solid currentColor; transform: rotate(12deg); font-size: 10px; }
.hero-shrink-scene__progress { position: absolute; z-index: 4; right: 18px; bottom: 18px; color: color-mix(in srgb, #f6f6ef 80%, transparent); font: 600 10px/1 "DM Sans", sans-serif; }
.hero-shrink-scene__hint { position: absolute; z-index: 4; left: 18px; bottom: 18px; color: color-mix(in srgb, #f6f6ef 76%, #171812); font: 600 10px/1.2 "DM Sans", sans-serif; text-transform: uppercase; }
@media (max-width: 700px) {
  .hero-shrink-scene__frame { width: max(var(--frame-width), 68%); height: max(var(--frame-height), 46%); }
  .hero-shrink-scene__marquee { left: -35%; width: 170%; }
}
@media (prefers-reduced-motion: reduce) {
  .hero-shrink-scene__image, .hero-shrink-scene__pattern { transform: none; }
}
`;

export default function HeroShrinkScene({
  image = "/images/retro-cosmic-paths.webp",
}) {
  const [progress, setProgress] = useState(0);

  function handleScroll(event) {
    const node = event.currentTarget;
    const max = node.scrollHeight - node.clientHeight;
    setProgress(max ? Math.min(node.scrollTop / max, 1) : 1);
  }

  const frameWidth = `${100 - progress * 64}%`;
  const frameHeight = `${100 - progress * 56}%`;

  return (
    <section className="hero-shrink-scene" onScroll={handleScroll} tabIndex={0} aria-label="Scrollable hero shrink transition">
      <style>{styles}</style>
      <div className="hero-shrink-scene__track">
        <div className="hero-shrink-scene__stage" style={{
          "--progress": progress,
          "--frame-width": frameWidth,
          "--frame-height": frameHeight,
          "--pattern-opacity": 0.08 + progress * 0.12,
          "--pattern-scale": 1 + progress * 0.15,
          "--marquee-opacity": Math.max(0, (progress - 0.28) * 1.38),
          "--shadow-y": `${progress * 28}px`,
          "--shadow-blur": `${progress * 70}px`,
          "--image-scale": 1 + (1 - progress) * 0.08,
          "--top-opacity": Math.max(0, (progress - 0.58) * 2.4),
        }}>
          <div className="hero-shrink-scene__dark" />
          <div className="hero-shrink-scene__pattern" />
          <div className="hero-shrink-scene__marquee">A FRAME BECOMES A MEMORY</div>
          <div className="hero-shrink-scene__frame"><img className="hero-shrink-scene__image" src={image} alt="Portrait used for the shrink transition" /></div>
          <div className="hero-shrink-scene__top"><span className="hero-shrink-scene__mark">M</span><span>Message from the studio</span></div>
          <span className="hero-shrink-scene__hint">Scroll inside the preview</span>
          <span className="hero-shrink-scene__progress">{String(Math.round(progress * 100)).padStart(3, "0")}%</span>
        </div>
      </div>
    </section>
  );
}
