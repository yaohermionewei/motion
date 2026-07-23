import { useState } from "react";

const styles = `
.dual-panel { height: 100%; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; background: #000; color: #f6f6ef; }
.dual-panel:focus-visible { outline: 2px solid #f6f6ef; outline-offset: -2px; }
.dual-panel__track { height: 185%; }
.dual-panel__stage { position: sticky; top: 0; height: 54.0541%; overflow: hidden; background: #000; }
.dual-panel__image { position: absolute; z-index: 2; top: 0; width: 34%; height: 100%; object-fit: cover; }
.dual-panel__image--left { left: 0; object-position: 55% center; transform: translateX(var(--image-left)); }
.dual-panel__image--right { right: 0; object-position: 42% center; transform: translateX(var(--image-right)); }
.dual-panel__center { position: absolute; z-index: 4; inset: 0 22%; display: grid; grid-template-columns: 1fr 1fr; align-content: center; gap: clamp(18px, 3vw, 36px); }
.dual-panel__column { min-width: 0; }
.dual-panel__column--left { transform: translateX(var(--text-left)); text-align: right; }
.dual-panel__column--right { transform: translateX(var(--text-right)); }
.dual-panel__title { margin: 0; font: 600 clamp(38px, 4.6vw, 62px)/.78 "DM Sans", sans-serif; }
.dual-panel__title span { display: block; font-family: "Instrument Serif", serif; font-weight: 400; }
@media (max-width: 700px) {
  .dual-panel__image { width: 45%; height: 48%; top: auto; bottom: 0; }
  .dual-panel__center { inset: 54px 7% 42%; gap: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .dual-panel__image, .dual-panel__column { transform: none; }
}
`;

export default function DualPanelConverge({
  leftImage = "/images/retro-media-orbit.webp",
  rightImage = "/images/retro-cosmic-paths.webp",
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
        }}>
          <img className="dual-panel__image dual-panel__image--left" src={leftImage} alt="First side of the comparison" />
          <img className="dual-panel__image dual-panel__image--right" src={rightImage} alt="Second side of the comparison" />
          <div className="dual-panel__center">
            <div className="dual-panel__column dual-panel__column--left"><h2 className="dual-panel__title"><span>Make</span>FORM</h2></div>
            <div className="dual-panel__column dual-panel__column--right"><h2 className="dual-panel__title"><span>Find</span>VOICE</h2></div>
          </div>
        </div>
      </div>
    </section>
  );
}
