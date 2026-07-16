import { useEffect, useRef, useState } from "react";

const styles = `
.kinetic-marquee {
  min-height: 100%;
  display: grid;
  align-content: space-between;
  overflow: hidden;
  padding: clamp(26px, 5vw, 58px) 0;
  background: #171812;
  color: #f7f7f1;
}
.kinetic-marquee__head,
.kinetic-marquee__foot {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 0 clamp(24px, 5vw, 64px);
  font: 600 11px/1.3 "DM Sans", sans-serif;
  text-transform: uppercase;
}
.kinetic-marquee__head span:first-child { color: #d9ff42; }
.kinetic-marquee__direction { padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-transform: inherit; cursor: pointer; }
.kinetic-marquee__direction:hover, .kinetic-marquee__direction:focus-visible { color: #d9ff42; }
.kinetic-marquee__direction:focus-visible { outline: 1px solid currentColor; outline-offset: 5px; }
.kinetic-marquee__foot { color: #8e9188; }
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
  background: #ff6547;
}
.kinetic-marquee__row--reverse .kinetic-marquee__word { color: #aeb4ff; font-style: italic; }
@keyframes kinetic-marquee-move { to { transform: translateX(-50%); } }
@media (max-width: 650px) {
  .kinetic-marquee__head, .kinetic-marquee__foot { align-items: flex-start; flex-direction: column; }
  .kinetic-marquee__foot span:last-child { display: none; }
}
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
    >
      <style>{styles}</style>
      <div className="kinetic-marquee__head"><span>What we make</span><button className="kinetic-marquee__direction" type="button" onClick={() => setReversed((value) => !value)}>Reverse direction</button></div>
      <div className="kinetic-marquee__rows" aria-label={words.join(", ")}>
        {[false, true].map((reverse) => (
          <div className={`kinetic-marquee__row ${reverse ? "kinetic-marquee__row--reverse" : ""}`} key={String(reverse)}>
            <div className="kinetic-marquee__group">
              {repeated.map((word, index) => <span className="kinetic-marquee__word" key={`${word}-${index}`}>{word}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div className="kinetic-marquee__foot"><span>Continuous loop / directional response</span><span>React + CSS</span></div>
    </section>
  );
}
