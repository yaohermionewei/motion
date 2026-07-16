import { useState } from "react";

const styles = `
.layered-image-reveal {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: clamp(22px, 3vw, 36px);
  background: #eef1ea;
  color: #171812;
}
.layered-image-reveal__card { width: min(720px, 100%); padding: 0; border: 0; background: transparent; color: inherit; text-align: left; cursor: pointer; }
.layered-image-reveal__media { position: relative; height: clamp(280px, 50vh, 430px); overflow: hidden; background: #cdd4cf; }
.layered-image-reveal__image { position: absolute; inset: 0; width: 100%; height: 100%; display: block; object-fit: cover; }
.layered-image-reveal__image--base { transform: scale(1); transition: transform 850ms cubic-bezier(.16,1,.3,1); }
.layered-image-reveal__image--top { clip-path: ellipse(100% 0% at 50% 0%); transform: scale(1.05); transition: clip-path 850ms cubic-bezier(.16,1,.3,1), transform 850ms cubic-bezier(.16,1,.3,1); }
.layered-image-reveal__card:hover .layered-image-reveal__image--base,
.layered-image-reveal__card:focus-visible .layered-image-reveal__image--base,
.layered-image-reveal__card.is-active .layered-image-reveal__image--base { transform: scale(1.1); }
.layered-image-reveal__card:hover .layered-image-reveal__image--top,
.layered-image-reveal__card:focus-visible .layered-image-reveal__image--top,
.layered-image-reveal__card.is-active .layered-image-reveal__image--top { clip-path: ellipse(100% 120% at 50% 0%); transform: scale(1); }
.layered-image-reveal__card:focus-visible { outline: 3px solid #171812; outline-offset: 6px; }
.layered-image-reveal__badge { position: absolute; z-index: 3; left: 16px; top: 16px; padding: 9px 10px; background: #d9ff42; font: 600 10px/1 "DM Sans", sans-serif; text-transform: uppercase; }
.layered-image-reveal__meta { display: grid; grid-template-columns: 44px minmax(0, 1fr) auto; gap: 18px; align-items: start; padding-top: 14px; border-top: 1px solid #b8bdb4; margin-top: 14px; }
.layered-image-reveal__index, .layered-image-reveal__hint { color: #74786f; font: 600 10px/1.3 "DM Sans", sans-serif; text-transform: uppercase; }
.layered-image-reveal__title { margin: 0; font: 500 clamp(22px, 3vw, 36px)/1 "DM Sans", sans-serif; }
@media (max-width: 620px) {
  .layered-image-reveal__media { height: min(390px, 55vh); }
  .layered-image-reveal__meta { grid-template-columns: 34px 1fr; }
  .layered-image-reveal__hint { grid-column: 2; }
}
@media (prefers-reduced-motion: reduce) {
  .layered-image-reveal__image { transition: none; }
}
`;

export default function LayeredImageReveal({
  baseImage = "/images/retro-oval-horizon.png",
  revealImage = "/images/retro-media-orbit.png",
}) {
  const [active, setActive] = useState(false);

  return (
    <section className="layered-image-reveal">
      <style>{styles}</style>
      <button className={`layered-image-reveal__card ${active ? "is-active" : ""}`} type="button" onClick={() => setActive((value) => !value)} aria-pressed={active}>
        <div className="layered-image-reveal__media">
          <img className="layered-image-reveal__image layered-image-reveal__image--base" src={baseImage} alt="Base project view" />
          <img className="layered-image-reveal__image layered-image-reveal__image--top" src={revealImage} alt="Alternate project view" />
          <span className="layered-image-reveal__badge">Layer 02</span>
        </div>
        <div className="layered-image-reveal__meta"><span className="layered-image-reveal__index">01</span><h2 className="layered-image-reveal__title">One object, two visual states.</h2><span className="layered-image-reveal__hint">Hover, focus, or tap</span></div>
      </button>
    </section>
  );
}
