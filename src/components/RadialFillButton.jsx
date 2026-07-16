import { useState } from "react";

const styles = `
.radial-fill {
  min-height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 420px);
  gap: 64px;
  align-items: center;
  padding: 54px clamp(38px, 7vw, 94px);
  background: #e8efeb;
  color: #20211d;
}
.radial-fill__copy { max-width: 650px; }
.radial-fill__index {
  width: fit-content;
  margin: 0 0 22px;
  padding: 5px 7px;
  background: #ff6547;
  color: #20211d;
  font: 600 10px/1 "DM Sans", sans-serif;
  text-transform: uppercase;
}
.radial-fill__title {
  margin: 0;
  font: 400 60px/.92 "Instrument Serif", serif;
  letter-spacing: 0;
  text-wrap: balance;
}
.radial-fill__note {
  max-width: 480px;
  margin: 22px 0 0;
  color: #61675f;
  font: 500 14px/1.5 "DM Sans", sans-serif;
}
.radial-fill__buttons { display: grid; gap: 12px; }
.radial-fill__button {
  --base: #f8f8f2;
  --fill: #a5beb8;
  --text: #20211d;
  --active-text: #20211d;
  position: relative;
  height: 58px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  overflow: hidden;
  padding: 0 22px;
  border: 1px solid rgba(32,33,29,.72);
  border-radius: 999px;
  background: var(--base);
  color: var(--text);
  cursor: pointer;
  isolation: isolate;
}
.radial-fill__button--dark { --base: #20211d; --fill: #d9ff42; --text: #f8f8f2; --active-text: #20211d; }
.radial-fill__button--mint { --base: #a5beb8; --fill: #f8f8f2; --text: #20211d; --active-text: #20211d; }
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
.radial-fill__button:focus-visible { outline: 3px solid #20211d; outline-offset: 4px; }

@media (max-width: 700px) {
  .radial-fill { grid-template-columns: 1fr; gap: 34px; align-content: center; padding: 34px 22px; }
  .radial-fill__copy { max-width: 340px; }
  .radial-fill__index { margin-bottom: 14px; }
  .radial-fill__title { font-size: 42px; line-height: .94; }
  .radial-fill__note { margin-top: 14px; font-size: 12px; }
  .radial-fill__buttons { width: 100%; gap: 9px; }
  .radial-fill__button { height: 52px; padding: 0 18px; }
}
@media (prefers-reduced-motion: reduce) {
  .radial-fill__fill, .radial-fill__label-track, .radial-fill__arrow { transition: none; }
}
`;

const defaultButtons = [
  { label: "View the archive", activeLabel: "Archive is open", tone: "light" },
  { label: "Read field notes", activeLabel: "Notes are ready", tone: "mint" },
  { label: "Start a new brief", activeLabel: "Begin the brief", tone: "dark" },
];

export default function RadialFillButton({ items = defaultButtons }) {
  const [active, setActive] = useState(null);

  return (
    <section className="radial-fill">
      <style>{styles}</style>
      <div className="radial-fill__copy">
        <p className="radial-fill__index">Response study / 03</p>
        <h2 className="radial-fill__title">A small signal becomes the whole response.</h2>
        <p className="radial-fill__note">Every invitation should feel clear, immediate, and impossible to overlook.</p>
      </div>
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
