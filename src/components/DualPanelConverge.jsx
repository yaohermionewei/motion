import { useState } from "react";

const styles = `
.dual-panel { height: 100%; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; background: #f6f6ef; color: #20251c; }
.dual-panel:focus-visible { outline: 3px solid #171812; outline-offset: -3px; }
.dual-panel__track { height: 185%; }
.dual-panel__stage { position: sticky; top: 0; height: 54.0541%; overflow: hidden; background: #f6f6ef; }
.dual-panel__pattern { position: absolute; inset: -15%; opacity: .16; background: repeating-radial-gradient(ellipse at 45% 45%, transparent 0 90px, #90958a 92px 93px, transparent 95px 154px); }
.dual-panel__image { position: absolute; z-index: 2; top: 0; width: 34%; height: 100%; object-fit: cover; }
.dual-panel__image--left { left: 0; object-position: 55% center; transform: translateX(var(--image-left)); }
.dual-panel__image--right { right: 0; object-position: 42% center; transform: translateX(var(--image-right)); }
.dual-panel__center { position: absolute; z-index: 4; inset: 0 22%; display: grid; grid-template-columns: 1fr 1fr; align-content: center; gap: clamp(18px, 3vw, 36px); }
.dual-panel__column { min-width: 0; }
.dual-panel__column--left { transform: translateX(var(--text-left)); text-align: right; }
.dual-panel__column--right { transform: translateX(var(--text-right)); }
.dual-panel__title { margin: 0; font: 600 clamp(38px, 4.6vw, 62px)/.78 "DM Sans", sans-serif; }
.dual-panel__title span { display: block; font-family: "Instrument Serif", serif; font-weight: 400; }
.dual-panel__copy { margin: 20px 0 0; color: #60645c; font: 500 12px/1.45 "DM Sans", sans-serif; }
.dual-panel__mark { position: absolute; z-index: 3; left: 50%; top: 23%; color: #d9ff42; opacity: .82; transform: translate(-50%, -50%) rotate(-9deg) scale(var(--mark-scale)); font: 400 clamp(54px, 7vw, 92px)/1 "Instrument Serif", serif; }
.dual-panel__hint { position: absolute; z-index: 5; left: 50%; bottom: 20px; transform: translateX(-50%); font: 600 10px/1.2 "DM Sans", sans-serif; text-transform: uppercase; }
@media (max-width: 700px) {
  .dual-panel__image { width: 45%; height: 48%; top: auto; bottom: 0; }
  .dual-panel__center { inset: 54px 7% 42%; gap: 12px; }
  .dual-panel__copy { display: none; }
  .dual-panel__mark { top: 43%; opacity: .58; }
  .dual-panel__hint { top: 49%; bottom: auto; width: 100%; text-align: center; }
}
@media (prefers-reduced-motion: reduce) {
  .dual-panel__image, .dual-panel__column { transform: none; }
}
`;

export default function DualPanelConverge({
  leftImage = "/images/retro-media-orbit.png",
  rightImage = "/images/retro-cosmic-paths.png",
}) {
  const [progress, setProgress] = useState(0);

  function handleScroll(event) {
    const node = event.currentTarget;
    const max = node.scrollHeight - node.clientHeight;
    setProgress(max ? Math.min(node.scrollTop / max, 1) : 1);
  }

  return (
    <section className="dual-panel" onScroll={handleScroll} tabIndex={0} aria-label="Scrollable dual panel transition">
      <style>{styles}</style>
      <div className="dual-panel__track">
        <div className="dual-panel__stage" style={{
          "--progress": progress,
          "--image-left": `${(1 - progress) * -20}rem`,
          "--image-right": `${(1 - progress) * 20}rem`,
          "--text-left": `${(1 - progress) * -5}rem`,
          "--text-right": `${(1 - progress) * 5}rem`,
          "--mark-scale": 0.45 + progress * 0.55,
        }}>
          <div className="dual-panel__pattern" />
          <img className="dual-panel__image dual-panel__image--left" src={leftImage} alt="First side of the comparison" />
          <img className="dual-panel__image dual-panel__image--right" src={rightImage} alt="Second side of the comparison" />
          <div className="dual-panel__center">
            <div className="dual-panel__column dual-panel__column--left"><h2 className="dual-panel__title"><span>Make</span>FORM</h2><p className="dual-panel__copy">Structure, systems, and the parts that hold the work together.</p></div>
            <div className="dual-panel__column dual-panel__column--right"><h2 className="dual-panel__title"><span>Find</span>VOICE</h2><p className="dual-panel__copy">Expression, character, and the details people remember.</p></div>
          </div>
          <div className="dual-panel__mark">M</div>
          <span className="dual-panel__hint">Scroll inside to bring both sides together</span>
        </div>
      </div>
    </section>
  );
}
