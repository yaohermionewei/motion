import { useState } from "react";
import { Code2, Copy, Eye } from "lucide-react";

const DURATION_MS = 350;
const STAGGER_MS = 30;

const styles = `
.staggered-roll-button {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: clamp(38px, 6vw, 82px);
  background: #000;
  color: #f6f6ef;
}
.staggered-roll-button__actions {
  width: min(520px, 100%);
  display: grid;
  border-top: 1px solid #f6f6ef;
}
.staggered-roll-button__button {
  min-width: 0;
  min-height: 64px;
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 0 18px;
  border: 0;
  border-bottom: 1px solid #f6f6ef;
  background: transparent;
  color: #f6f6ef;
  cursor: pointer;
  text-align: left;
  transition: background-color 200ms ease, color 200ms ease;
}
.staggered-roll-button__button:hover,
.staggered-roll-button__button:focus-visible,
.staggered-roll-button__button.is-active {
  background: #f6f6ef;
  color: #000;
}
.staggered-roll-button__button:focus-visible {
  outline: 2px solid #f6f6ef;
  outline-offset: 3px;
}
.staggered-roll-button__icon {
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
}
.staggered-roll-button__label {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-self: start;
  white-space: nowrap;
  font: 600 clamp(14px, 1.4vw, 17px)/1 "DM Sans", sans-serif;
}
.staggered-roll-button__char {
  height: 1em;
  display: inline-block;
  overflow: hidden;
  line-height: 1;
}
.staggered-roll-button__stack {
  display: flex;
  flex-direction: column;
  line-height: 1;
  transform: translate3d(0, 0, 0);
  will-change: transform;
}
.staggered-roll-button__stack > span {
  height: 1em;
  display: block;
  flex: 0 0 1em;
  line-height: 1;
}
.staggered-roll-button__arrow {
  font: 500 20px/1 "DM Sans", sans-serif;
}
@keyframes staggered-roll-button-up {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(0, -50%, 0); }
}
@media (hover: hover) and (pointer: fine) {
  .staggered-roll-button__button:hover .staggered-roll-button__stack {
    animation: staggered-roll-button-up var(--roll-duration) cubic-bezier(.215, .61, .355, 1) var(--roll-delay) both;
  }
}
.staggered-roll-button__button:focus-visible .staggered-roll-button__stack,
.staggered-roll-button__button.is-active .staggered-roll-button__stack {
  animation: staggered-roll-button-up var(--roll-duration) cubic-bezier(.215, .61, .355, 1) var(--roll-delay) both;
}
@media (max-width: 720px) {
  .staggered-roll-button {
    padding: 30px 20px;
  }
  .staggered-roll-button__button { min-height: 58px; padding: 0 14px; }
}
@media (prefers-reduced-motion: reduce) {
  .staggered-roll-button__button,
  .staggered-roll-button__stack { transition: none; }
  .staggered-roll-button__stack {
    animation: none !important;
    transform: translate3d(0, 0, 0) !important;
    will-change: auto;
  }
}
`;

const iconByName = {
  preview: Eye,
  code: Code2,
  copy: Copy,
};

const defaultItems = [
  { label: "查看项目", icon: "preview" },
];

function getRollDelay(index, characterCount) {
  const firstGroupCount = Math.floor(characterCount / 2);
  const secondGroupStart = Math.round(
    0.7 * (DURATION_MS + Math.max(0, firstGroupCount - 1) * STAGGER_MS),
  );
  const groupIndex = Math.floor(index / 2);

  return index % 2 === 1
    ? groupIndex * STAGGER_MS
    : secondGroupStart + groupIndex * STAGGER_MS;
}

function StaggeredLabel({ text }) {
  const characters = Array.from(text);

  return (
    <span className="staggered-roll-button__label" aria-hidden="true">
      {characters.map((character, index) => {
        const glyph = character === " " ? "\u00a0" : character;

        return (
          <span className="staggered-roll-button__char" key={`${character}-${index}`}>
            <span
              className="staggered-roll-button__stack"
              style={{
                "--roll-delay": `${getRollDelay(index, characters.length)}ms`,
                "--roll-duration": `${DURATION_MS}ms`,
              }}
            >
              <span>{glyph}</span>
              <span>{glyph}</span>
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default function StaggeredRollButton({ items = defaultItems }) {
  const [active, setActive] = useState(null);

  return (
    <section className="staggered-roll-button">
      <style>{styles}</style>
      <div className="staggered-roll-button__actions">
        {items.map((item, index) => {
          const Icon = iconByName[item.icon] || Eye;

          return (
            <button
              className={`staggered-roll-button__button ${active === index ? "is-active" : ""}`}
              type="button"
              aria-label={item.label}
              aria-pressed={active === index}
              onClick={() => setActive((value) => value === index ? null : index)}
              key={item.label}
            >
              <span className="staggered-roll-button__icon" aria-hidden="true">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <StaggeredLabel text={item.label} />
              <span className="staggered-roll-button__arrow" aria-hidden="true">↗</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
