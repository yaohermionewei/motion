import { useEffect, useRef, useState } from "react";

const styles = `
.oval-title-reveal {
  min-height: 100%;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: clamp(26px, 5vw, 64px);
  background: #f6f6ef;
  color: #171812;
}
.oval-title-reveal__title { width: 100%; margin: 0; text-align: center; }
.oval-title-reveal__clip {
  display: block;
  overflow: hidden;
  clip-path: ellipse(22% 0% at 50% 0%);
  transition: clip-path 1300ms cubic-bezier(.76,0,.24,1);
  transition-delay: calc(var(--line) * 150ms);
}
.oval-title-reveal__clip:nth-child(2) { clip-path: ellipse(22% 0% at 50% 100%); }
.oval-title-reveal__line {
  display: block;
  transform: translateY(-42%);
  opacity: .2;
  font: 600 clamp(62px, 10vw, 142px)/.82 "DM Sans", sans-serif;
  transition: transform 1300ms cubic-bezier(.76,0,.24,1), opacity 700ms ease;
  transition-delay: calc(80ms + var(--line) * 150ms);
}
.oval-title-reveal__clip:nth-child(2) .oval-title-reveal__line {
  transform: translateY(42%);
  font-family: "Instrument Serif", serif;
  font-weight: 400;
}
.oval-title-reveal.is-visible .oval-title-reveal__clip { clip-path: ellipse(110% 125% at 50% 50%); }
.oval-title-reveal.is-visible .oval-title-reveal__line { transform: translateY(0); opacity: 1; }
@media (prefers-reduced-motion: reduce) {
  .oval-title-reveal__clip { clip-path: none; transition: none; }
  .oval-title-reveal__line { transform: none !important; opacity: 1; transition: none; }
}
`;

export default function OvalTitleReveal({ lines = ["What comes", "into view"] }) {
  const rootRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.35 },
    );
    if (rootRef.current) observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={rootRef} className={`oval-title-reveal ${visible ? "is-visible" : ""}`}>
      <style>{styles}</style>
      <h2 className="oval-title-reveal__title">
        {lines.map((line, index) => (
          <span className="oval-title-reveal__clip" style={{ "--line": index }} key={line}>
            <span className="oval-title-reveal__line">{line}</span>
          </span>
        ))}
      </h2>
    </section>
  );
}
