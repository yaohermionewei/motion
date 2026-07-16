import { useState } from "react";

const styles = `
.oval-section { height: 100%; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; background: #171812; }
.oval-section:focus-visible { outline: 3px solid #d9ff42; outline-offset: -3px; }
.oval-section__track { height: 185%; }
.oval-section__stage { position: sticky; top: 0; height: 54.0541%; overflow: hidden; background: #171812; color: #f6f6ef; }
.oval-section__previous { position: absolute; inset: 0; display: grid; place-items: center; padding: 30px; }
.oval-section__previous h2 { margin: 0; max-width: 900px; text-align: center; font: 400 clamp(66px, 10vw, 140px)/.82 "Instrument Serif", serif; }
.oval-section__next { position: absolute; z-index: 2; inset: 0; display: grid; grid-template-columns: minmax(0, .8fr) minmax(280px, 1.2fr); gap: clamp(22px, 5vw, 64px); align-items: center; padding: clamp(28px, 6vw, 76px); background: #f6f6ef; color: #171812; clip-path: ellipse(70% var(--oval-height) at 50% 0%); }
.oval-section__eyebrow { width: fit-content; padding: 4px 6px; background: #d9ff42; color: #171812; font: 600 10px/1.2 "DM Sans", sans-serif; text-transform: uppercase; }
.oval-section__title { margin: 28px 0 20px; font: 600 clamp(48px, 7vw, 96px)/.82 "DM Sans", sans-serif; }
.oval-section__title span { display: block; font-family: "Instrument Serif", serif; font-weight: 400; }
.oval-section__copy { max-width: 440px; margin: 0; color: #62665e; font: 500 13px/1.55 "DM Sans", sans-serif; }
.oval-section__image-wrap { position: relative; height: min(68vh, 560px); }
.oval-section__image { width: 82%; height: 100%; display: block; object-fit: cover; margin-left: auto; }
.oval-section__swatch { position: absolute; left: 0; bottom: 7%; width: 42%; aspect-ratio: 4 / 3; object-fit: cover; border: 10px solid #f6f6ef; }
.oval-section__hint { position: absolute; z-index: 4; left: 18px; bottom: 18px; color: #aeb3a8; font: 600 10px/1.2 "DM Sans", sans-serif; text-transform: uppercase; mix-blend-mode: difference; }
@media (max-width: 700px) {
  .oval-section__next { grid-template-columns: 1fr; align-content: center; }
  .oval-section__image-wrap { height: 280px; }
  .oval-section__copy { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .oval-section__next { clip-path: none; }
}
`;

export default function OvalSectionReveal({
  image = "/images/retro-cloud-stairway.webp",
  detailImage = "/images/retro-media-orbit.webp",
}) {
  const [progress, setProgress] = useState(0);

  function handleScroll(event) {
    const node = event.currentTarget;
    const max = node.scrollHeight - node.clientHeight;
    setProgress(max ? Math.min(node.scrollTop / max, 1) : 1);
  }

  return (
    <section className="oval-section" onScroll={handleScroll} tabIndex={0} aria-label="Scrollable oval section transition">
      <style>{styles}</style>
      <div className="oval-section__track">
        <div className="oval-section__stage">
          <div className="oval-section__previous"><h2>One chapter closes.</h2></div>
          <div className="oval-section__next" style={{ "--oval-height": `${progress * 118}%` }}>
            <div><div className="oval-section__eyebrow">Next chapter / New context</div><h2 className="oval-section__title">Another world <span>opens from the edge.</span></h2><p className="oval-section__copy">Use the oval boundary to move from a dark, immersive scene into a lighter project, product, or editorial chapter.</p></div>
            <div className="oval-section__image-wrap"><img className="oval-section__image" src={image} alt="New chapter visual" /><img className="oval-section__swatch" src={detailImage} alt="Supporting project detail" /></div>
          </div>
          <span className="oval-section__hint">Scroll inside to open the next chapter</span>
        </div>
      </div>
    </section>
  );
}
