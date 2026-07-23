import { useState } from "react";

const styles = `
.rolling-letters {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: clamp(24px, 4vw, 48px);
  background: #000;
  color: #f6f6ef;
}
.rolling-letters__demo { display: grid; width: min(560px, 100%); margin: 0; }
.rolling-letters__button {
  min-width: min(560px, 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: 16px 22px;
  border: 1px solid #f6f6ef;
  background: transparent;
  color: #f6f6ef;
  text-align: left;
  cursor: pointer;
}
.rolling-letters__label { display: flex; overflow: hidden; font: 600 clamp(20px, 3.2vw, 36px)/1 "DM Sans", sans-serif; }
.rolling-letters__char {
  display: inline-block;
  text-shadow: 0 1.08em currentColor;
  transform: translateY(0);
  transition: transform 560ms cubic-bezier(.16,1,.3,1);
  transition-delay: calc(var(--char) * 22ms);
}
.rolling-letters__button:hover .rolling-letters__char,
.rolling-letters__button:focus-visible .rolling-letters__char,
.rolling-letters__button.is-active .rolling-letters__char { transform: translateY(-1.08em); }
.rolling-letters__button:focus-visible { outline: 2px solid #f6f6ef; outline-offset: 4px; }
.rolling-letters__arrow { flex: 0 0 auto; font: 500 28px/1 "DM Sans", sans-serif; transition: transform 560ms cubic-bezier(.16,1,.3,1); }
.rolling-letters__button:hover .rolling-letters__arrow,
.rolling-letters__button:focus-visible .rolling-letters__arrow,
.rolling-letters__button.is-active .rolling-letters__arrow { transform: translateX(7px); }
@media (max-width: 620px) {
  .rolling-letters__button { min-width: 100%; padding: 15px 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .rolling-letters__char, .rolling-letters__arrow { transition: none; }
}
`;

function RollingLabel({ text }) {
  return (
    <span className="rolling-letters__label" aria-label={text}>
      {Array.from(text).map((char, index) => (
        <span className="rolling-letters__char" aria-hidden="true" style={{ "--char": index }} key={`${char}-${index}`}>
          {char === " " ? "\u00a0" : char}
        </span>
      ))}
    </span>
  );
}

const buttons = [
  { text: "View selected work", variant: "plain" },
];

export default function RollingLettersButton() {
  const [active, setActive] = useState(null);

  return (
    <section className="rolling-letters">
      <style>{styles}</style>
      <div className="rolling-letters__demo">
        {buttons.map((button, index) => (
          <button
            className={`rolling-letters__button rolling-letters__button--${button.variant} ${active === index ? "is-active" : ""}`}
            type="button"
            key={button.text}
            onClick={() => setActive((value) => value === index ? null : index)}
          >
            <RollingLabel text={button.text} />
            <span className="rolling-letters__arrow" aria-hidden="true">→</span>
          </button>
        ))}
      </div>
    </section>
  );
}
