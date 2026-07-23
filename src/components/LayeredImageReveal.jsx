import { useState } from "react";

const styles = `
.layered-image-reveal {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: clamp(22px, 3vw, 36px);
  background: #000;
  color: #f6f6ef;
}
.layered-image-reveal__card { width: min(720px, 100%); padding: 0; border: 0; background: transparent; color: inherit; text-align: left; cursor: pointer; }
.layered-image-reveal__media { position: relative; height: clamp(280px, 50vh, 430px); overflow: hidden; background: #111; }
.layered-image-reveal__image { position: absolute; inset: 0; width: 100%; height: 100%; display: block; object-fit: cover; }
.layered-image-reveal__image--base { transform: scale(1); transition: transform 850ms cubic-bezier(.16,1,.3,1); }
.layered-image-reveal__image--top { clip-path: ellipse(100% 0% at 50% 0%); transform: scale(1.05); transition: clip-path 850ms cubic-bezier(.16,1,.3,1), transform 850ms cubic-bezier(.16,1,.3,1); }
.layered-image-reveal__card:hover .layered-image-reveal__image--base,
.layered-image-reveal__card:focus-visible .layered-image-reveal__image--base,
.layered-image-reveal__card.is-active .layered-image-reveal__image--base { transform: scale(1.1); }
.layered-image-reveal__card:hover .layered-image-reveal__image--top,
.layered-image-reveal__card:focus-visible .layered-image-reveal__image--top,
.layered-image-reveal__card.is-active .layered-image-reveal__image--top { clip-path: ellipse(100% 120% at 50% 0%); transform: scale(1); }
.layered-image-reveal__card:focus-visible { outline: 2px solid #f6f6ef; outline-offset: 6px; }
@media (max-width: 620px) {
  .layered-image-reveal__media { height: min(390px, 55vh); }
}
@media (prefers-reduced-motion: reduce) {
  .layered-image-reveal__image { transition: none; }
}
`;

export default function LayeredImageReveal({
  baseImage = "/images/retro-oval-horizon.webp",
  revealImage = "/images/retro-media-orbit.webp",
}) {
  const [active, setActive] = useState(false);

  return (
    <section className="layered-image-reveal">
      <style>{styles}</style>
      <button className={`layered-image-reveal__card ${active ? "is-active" : ""}`} type="button" onClick={() => setActive((value) => !value)} aria-pressed={active}>
        <div className="layered-image-reveal__media">
          <img className="layered-image-reveal__image layered-image-reveal__image--base" src={baseImage} alt="Base project view" />
          <img className="layered-image-reveal__image layered-image-reveal__image--top" src={revealImage} alt="Alternate project view" />
        </div>
      </button>
    </section>
  );
}
