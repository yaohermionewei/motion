import { useState } from "react";

const styles = `
.disclosure-card-demo {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: clamp(22px, 4vw, 44px);
  background: #a5beba;
  color: #171812;
}
.disclosure-card {
  position: relative;
  width: min(680px, 100%);
  aspect-ratio: 4 / 3;
  overflow: hidden;
  padding: 0;
  border: 1px solid rgba(23,24,18,.25);
  border-radius: 6px;
  background: #f5f6f1;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.disclosure-card:focus-visible { outline: 3px solid #171812; outline-offset: 5px; }
.disclosure-card__image { position: absolute; inset: 0; width: 100%; height: 100%; display: block; object-fit: cover; transform: scale(1); transition: opacity 480ms ease, transform 850ms cubic-bezier(.16,1,.3,1), filter 480ms ease; }
.disclosure-card__shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(23,24,18,.12), rgba(23,24,18,.02) 50%, rgba(23,24,18,.62)); transition: opacity 420ms ease; }
.disclosure-card__eyebrow { position: absolute; z-index: 2; top: 22px; left: 24px; color: #f5f6f1; font: 600 10px/1.2 "DM Sans", sans-serif; text-transform: uppercase; }
.disclosure-card__cover-title { position: absolute; z-index: 2; right: 24px; bottom: 22px; left: 24px; display: flex; justify-content: space-between; gap: 20px; align-items: end; color: #f5f6f1; }
.disclosure-card__cover-title strong { max-width: 11ch; font: 400 clamp(42px, 7vw, 76px)/.82 "Instrument Serif", serif; }
.disclosure-card__cover-title span { font: 600 10px/1.2 "DM Sans", sans-serif; text-transform: uppercase; }
.disclosure-card__panel { position: absolute; z-index: 3; inset: 0; display: grid; align-content: space-between; padding: clamp(26px, 5vw, 52px); opacity: 0; transform: translateY(26px); transition: opacity 300ms ease, transform 650ms cubic-bezier(.16,1,.3,1); }
.disclosure-card__panel-top { display: flex; justify-content: space-between; gap: 20px; color: #6d7067; font: 600 10px/1.2 "DM Sans", sans-serif; text-transform: uppercase; }
.disclosure-card__panel-copy { display: block; max-width: 540px; }
.disclosure-card__title { display: block; margin: 0; font: 400 clamp(44px, 7vw, 76px)/.84 "Instrument Serif", serif; }
.disclosure-card__description { display: block; max-width: 50ch; margin: 16px 0 24px; font: 500 clamp(13px, 1.6vw, 17px)/1.45 "DM Sans", sans-serif; }
.disclosure-card__action { width: fit-content; display: inline-flex; align-items: center; gap: 10px; min-height: 42px; padding: 0 18px; border-radius: 999px; background: #171812; color: #f5f6f1; font: 600 11px/1 "DM Sans", sans-serif; }
.disclosure-card__action::after { content: "+"; color: #d9ff42; font-size: 16px; }
.disclosure-card:hover .disclosure-card__image,
.disclosure-card:focus-visible .disclosure-card__image,
.disclosure-card.is-active .disclosure-card__image { opacity: .14; transform: scale(1.035); filter: grayscale(1); }
.disclosure-card:hover .disclosure-card__shade,
.disclosure-card:focus-visible .disclosure-card__shade,
.disclosure-card.is-active .disclosure-card__shade,
.disclosure-card:hover .disclosure-card__cover-title,
.disclosure-card:focus-visible .disclosure-card__cover-title,
.disclosure-card.is-active .disclosure-card__cover-title,
.disclosure-card:hover > .disclosure-card__eyebrow,
.disclosure-card:focus-visible > .disclosure-card__eyebrow,
.disclosure-card.is-active > .disclosure-card__eyebrow { opacity: 0; }
.disclosure-card:hover .disclosure-card__panel,
.disclosure-card:focus-visible .disclosure-card__panel,
.disclosure-card.is-active .disclosure-card__panel { opacity: 1; transform: translateY(0); }
@media (max-width: 620px) {
  .disclosure-card-demo { padding: 18px; }
  .disclosure-card { aspect-ratio: 4 / 5; }
  .disclosure-card__panel { padding: 28px; }
  .disclosure-card__cover-title { right: 18px; bottom: 18px; left: 18px; }
  .disclosure-card__eyebrow { top: 18px; left: 18px; }
}
@media (prefers-reduced-motion: reduce) {
  .disclosure-card__image, .disclosure-card__shade, .disclosure-card__panel { transition: none; }
}
`;

export default function HoverDisclosureCard({
  eyebrow = "Field study / 04",
  title = "Shared Ground",
  description = "A compact disclosure pattern keeps imagery prominent until a visitor asks for the context behind it.",
  image = "/images/retro-media-orbit.png",
  actionLabel = "View details",
}) {
  const [active, setActive] = useState(false);

  return (
    <section className="disclosure-card-demo">
      <style>{styles}</style>
      <button
        className={`disclosure-card ${active ? "is-active" : ""}`}
        type="button"
        aria-pressed={active}
        onPointerEnter={(event) => event.pointerType !== "touch" && setActive(true)}
        onPointerLeave={(event) => event.pointerType !== "touch" && setActive(false)}
        onClick={() => setActive((value) => !value)}
        onKeyDown={(event) => event.key === "Escape" && setActive(false)}
      >
        <img className="disclosure-card__image" src={image} alt="" />
        <span className="disclosure-card__shade" aria-hidden="true" />
        <span className="disclosure-card__eyebrow">{eyebrow}</span>
        <span className="disclosure-card__cover-title"><strong>{title}</strong><span>Discover</span></span>
        <span className="disclosure-card__panel">
          <span className="disclosure-card__panel-top"><span>{eyebrow}</span><span>Open state</span></span>
          <span className="disclosure-card__panel-copy">
            <span className="disclosure-card__title">{title}</span>
            <span className="disclosure-card__description">{description}</span>
            <span className="disclosure-card__action">{actionLabel}</span>
          </span>
        </span>
      </button>
    </section>
  );
}
