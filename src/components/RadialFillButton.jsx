import { useState } from "react";

const styles = `
.radial-fill {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: 54px clamp(38px, 7vw, 94px);
  background: #000;
  color: #f6f6ef;
}
.radial-fill__buttons { width: min(420px, 100%); display: grid; }
.radial-fill__button {
  --base: transparent;
  --fill: #f6f6ef;
  --text: #f6f6ef;
  --active-text: #000;
  position: relative;
  height: 58px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  overflow: hidden;
  padding: 0 22px;
  border: 1px solid #f6f6ef;
  border-radius: 999px;
  background: var(--base);
  color: var(--text);
  cursor: pointer;
  isolation: isolate;
}
.radial-fill__fill {
  position: absolute;
  z-index: -1;
  top: -10px;
  left: -10px;
  width: calc(100% + 20px);
  height: calc(100% + 20px);
  border-radius: 999px;
  background: var(--fill);
  opacity: 0;
  transform: scale(.02, .06);
  transition: opacity 100ms linear, transform 440ms cubic-bezier(.16,1,.3,1);
  will-change: transform, opacity;
}
.radial-fill__label {
  height: 16px;
  overflow: hidden;
  font: 600 13px/16px "DM Sans", sans-serif;
  text-align: left;
}
.radial-fill__label-track {
  display: grid;
  grid-template-rows: repeat(2, 16px);
  transition: transform 420ms cubic-bezier(.16,1,.3,1);
}
.radial-fill__arrow {
  font: 500 18px/1 "DM Sans", sans-serif;
  transition: transform 420ms cubic-bezier(.16,1,.3,1);
}
.radial-fill__button:hover,
.radial-fill__button:focus-visible,
.radial-fill__button.is-active { color: var(--active-text); }
.radial-fill__button:hover .radial-fill__fill,
.radial-fill__button:focus-visible .radial-fill__fill,
.radial-fill__button.is-active .radial-fill__fill { opacity: 1; transform: scale(1); }
.radial-fill__button:hover .radial-fill__label-track,
.radial-fill__button:focus-visible .radial-fill__label-track,
.radial-fill__button.is-active .radial-fill__label-track { transform: translateY(-16px); }
.radial-fill__button:hover .radial-fill__arrow,
.radial-fill__button:focus-visible .radial-fill__arrow,
.radial-fill__button.is-active .radial-fill__arrow { transform: translateX(4px); }
.radial-fill__button:focus-visible { outline: 2px solid #f6f6ef; outline-offset: 4px; }

@media (max-width: 700px) {
  .radial-fill { padding: 34px 22px; }
  .radial-fill__buttons { width: 100%; }
  .radial-fill__button { height: 52px; padding: 0 18px; }
}
@media (prefers-reduced-motion: reduce) {
  .radial-fill__fill, .radial-fill__label-track, .radial-fill__arrow { transition: none; }
}
`;

const defaultButtons = [
  { label: "View the archive", activeLabel: "Archive is open", tone: "light" },
];

export default function RadialFillButton({ items = defaultButtons }) {
  const [active, setActive] = useState(null);

  return (
    <section className="radial-fill">
      <style>{styles}</style>
      <div className="radial-fill__buttons">
        {items.map((item, index) => (
          <button
            className={`radial-fill__button radial-fill__button--${item.tone || "light"} ${active === index ? "is-active" : ""}`}
            type="button"
            aria-pressed={active === index}
            onClick={() => setActive((value) => value === index ? null : index)}
            key={item.label}
          >
            <span className="radial-fill__fill" aria-hidden="true" />
            <span className="radial-fill__label" aria-label={item.label}>
              <span className="radial-fill__label-track" aria-hidden="true">
                <span>{item.label}</span>
                <span>{item.activeLabel || item.label}</span>
              </span>
            </span>
            <span className="radial-fill__arrow" aria-hidden="true">→</span>
          </button>
        ))}
      </div>
    </section>
  );
}
