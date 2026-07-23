import { useState } from "react";

const styles = `
.arrow-state {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: clamp(24px, 4vw, 48px);
  background: #000;
  color: #f6f6ef;
}
.arrow-state__layout { width: min(900px, 100%); display: grid; place-items: center; }
.arrow-state__button {
  width: clamp(160px, 19vw, 220px);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid #f6f6ef;
  border-radius: 50%;
  background: transparent;
  color: #f6f6ef;
  cursor: pointer;
  transition: background 260ms ease, color 260ms ease, transform 600ms cubic-bezier(.16,1,.3,1);
}
.arrow-state__button:hover,
.arrow-state__button:focus-visible,
.arrow-state__button.is-active { background: #f6f6ef; color: #000; transform: rotate(4deg); }
.arrow-state__button:focus-visible { outline: 2px solid #f6f6ef; outline-offset: 5px; }
.arrow-state__icon { width: 74px; height: 74px; display: block; overflow: visible; fill: none; stroke: currentColor; stroke-width: 3.2; stroke-linecap: square; stroke-linejoin: miter; transform: rotate(-42deg); transition: transform 620ms cubic-bezier(.16,1,.3,1); }
.arrow-state__shaft { transform: scaleX(.58); transform-origin: 60px 40px; transition: transform 620ms cubic-bezier(.16,1,.3,1); }
.arrow-state__head { transform: scale(.82); transform-origin: 60px 40px; transition: transform 620ms cubic-bezier(.16,1,.3,1); }
.arrow-state__button:hover .arrow-state__icon,
.arrow-state__button:focus-visible .arrow-state__icon,
.arrow-state__button.is-active .arrow-state__icon { transform: rotate(0); }
.arrow-state__button:hover .arrow-state__shaft,
.arrow-state__button:focus-visible .arrow-state__shaft,
.arrow-state__button.is-active .arrow-state__shaft { transform: scaleX(1); }
.arrow-state__button:hover .arrow-state__head,
.arrow-state__button:focus-visible .arrow-state__head,
.arrow-state__button.is-active .arrow-state__head { transform: scale(1); }
@media (max-width: 700px) {
  .arrow-state__button { width: 190px; }
}
@media (prefers-reduced-motion: reduce) {
  .arrow-state__button, .arrow-state__icon, .arrow-state__shaft, .arrow-state__head { transition: none; }
}
`;

export default function ArrowStateButton() {
  const [active, setActive] = useState(false);

  return (
    <section className="arrow-state">
      <style>{styles}</style>
      <div className="arrow-state__layout">
        <button className={`arrow-state__button ${active ? "is-active" : ""}`} type="button" onClick={() => setActive((value) => !value)} aria-pressed={active} aria-label="Preview arrow state">
          <svg className="arrow-state__icon" viewBox="0 0 80 80" aria-hidden="true">
            <path className="arrow-state__shaft" d="M18 40H60" />
            <path className="arrow-state__head" d="M47 27L60 40L47 53" />
          </svg>
        </button>
      </div>
    </section>
  );
}
