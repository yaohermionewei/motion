import { useEffect, useRef, useState } from "react";

const styles = `
.kinetic-marquee {
  min-height: 100%;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: clamp(26px, 5vw, 58px) 0;
  background: #000;
  color: #f7f7f1;
}
.kinetic-marquee__rows { display: grid; gap: 8px; transform: rotate(-2.5deg) scale(1.04); }
.kinetic-marquee__row { display: flex; width: max-content; animation: kinetic-marquee-move var(--duration, 24s) linear infinite; }
.kinetic-marquee__row--reverse { animation-direction: reverse; }
.kinetic-marquee.is-reversed .kinetic-marquee__row { animation-direction: reverse; }
.kinetic-marquee.is-reversed .kinetic-marquee__row--reverse { animation-direction: normal; }
.kinetic-marquee.is-boosted .kinetic-marquee__row { --duration: 9s; }
.kinetic-marquee__group { display: flex; flex: 0 0 auto; align-items: center; }
.kinetic-marquee__word {
  display: inline-flex;
  align-items: center;
  gap: .22em;
  padding-right: .22em;
  white-space: nowrap;
  font: 400 clamp(66px, 11vw, 154px)/.78 "Instrument Serif", serif;
}
.kinetic-marquee__word::after {
  width: .18em;
  height: .18em;
  content: "";
  border-radius: 50%;
  background: #777;
}
.kinetic-marquee__row--reverse .kinetic-marquee__word { color: #aeb4ff; font-style: italic; }
@keyframes kinetic-marquee-move { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) {
  .kinetic-marquee__row { animation-play-state: paused; }
}
`;

const defaultWords = ["Identity", "Digital", "Spaces", "Stories"];

export default function KineticMarquee({ words = defaultWords }) {
  const timerRef = useRef(null);
  const [reversed, setReversed] = useState(false);
  const [boosted, setBoosted] = useState(false);
  const repeated = [...words, ...words];

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function handleWheel(event) {
    setReversed(event.deltaY < 0);
    setBoosted(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setBoosted(false), 420);
  }

  return (
    <section
      className={`kinetic-marquee ${reversed ? "is-reversed" : ""} ${boosted ? "is-boosted" : ""}`}
      onWheel={handleWheel}
      onClick={() => setReversed((value) => !value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") setReversed((value) => !value);
      }}
      role="button"
      tabIndex={0}
      aria-label="Reverse marquee direction"
    >
      <style>{styles}</style>
      <div className="kinetic-marquee__rows" aria-label={words.join(", ")}>
        {[false, true].map((reverse) => (
          <div className={`kinetic-marquee__row ${reverse ? "kinetic-marquee__row--reverse" : ""}`} key={String(reverse)}>
            <div className="kinetic-marquee__group">
              {repeated.map((word, index) => <span className="kinetic-marquee__word" key={`${word}-${index}`}>{word}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
