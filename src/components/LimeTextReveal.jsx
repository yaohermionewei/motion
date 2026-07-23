import { useEffect, useRef, useState } from "react";

const styles = `
.lime-text-reveal {
  min-height: 100%;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: clamp(24px, 4vw, 48px);
  background: #000;
  color: #f5f5ee;
}
.lime-text-reveal__title { width: 100%; max-width: 1050px; margin: 0; }
.lime-text-reveal__clip {
  position: relative;
  display: block;
  width: fit-content;
  overflow: hidden;
  clip-path: inset(0 100% 0 0);
  transition: clip-path 620ms cubic-bezier(.16,1,.3,1);
  transition-delay: calc(var(--line) * 150ms);
}
.lime-text-reveal__text {
  position: relative;
  display: block;
  font: 600 clamp(46px, 7vw, 90px)/.88 "DM Sans", sans-serif;
}
.lime-text-reveal__clip:nth-child(2) .lime-text-reveal__text { color: #d9ff42; font-family: "Instrument Serif", serif; font-weight: 400; }
.lime-text-reveal__block {
  position: absolute;
  z-index: 2;
  inset: 0;
  background: #d9ff42;
  transform: scaleX(1);
  transform-origin: right center;
  transition: transform 620ms cubic-bezier(.76,0,.24,1);
  transition-delay: calc(300ms + var(--line) * 150ms);
}
.lime-text-reveal.is-visible .lime-text-reveal__clip { clip-path: inset(0); }
.lime-text-reveal.is-visible .lime-text-reveal__block { transform: scaleX(0); }
@media (prefers-reduced-motion: reduce) {
  .lime-text-reveal__clip { clip-path: none; transition: none; }
  .lime-text-reveal__block { display: none; }
}
`;

export default function LimeTextReveal({
  lines = ["Build the signal.", "Reveal the story.", "Keep it moving."],
}) {
  const rootRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.3 },
    );
    if (rootRef.current) observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={rootRef} className={`lime-text-reveal ${visible ? "is-visible" : ""}`}>
      <style>{styles}</style>
      <h2 className="lime-text-reveal__title">
        {lines.map((line, index) => (
          <span className="lime-text-reveal__clip" style={{ "--line": index }} key={line}>
            <span className="lime-text-reveal__text">{line}</span>
            <span className="lime-text-reveal__block" aria-hidden="true" />
          </span>
        ))}
      </h2>
    </section>
  );
}
