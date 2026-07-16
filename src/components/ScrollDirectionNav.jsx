import { useRef, useState } from "react";

const styles = `
.direction-nav-demo { height: 100%; overflow-y: auto; overscroll-behavior: contain; background: #f5f6f1; color: #171812; scrollbar-width: thin; }
.direction-nav-demo:focus-visible { outline: 3px solid #171812; outline-offset: -3px; }
.direction-nav {
  position: sticky;
  z-index: 5;
  top: 0;
  height: 68px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: clamp(18px, 4vw, 52px);
  padding: 0 clamp(20px, 4vw, 54px);
  border-bottom: 1px solid #d9dbd2;
  background: rgba(245,246,241,.94);
  backdrop-filter: blur(14px);
  transform: translateY(0);
  transition: transform 440ms cubic-bezier(.16,1,.3,1);
}
.direction-nav.is-hidden { transform: translateY(calc(-100% - 2px)); }
.direction-nav__brand { font: 600 13px/1 "DM Sans", sans-serif; text-transform: uppercase; }
.direction-nav__links { display: flex; justify-content: center; gap: clamp(14px, 3vw, 34px); }
.direction-nav__links a, .direction-nav__action { color: inherit; font: 600 10px/1.2 "DM Sans", sans-serif; text-decoration: none; text-transform: uppercase; }
.direction-nav__links a:hover, .direction-nav__links a:focus-visible { color: #6d7067; }
.direction-nav__links a:focus-visible, .direction-nav__action:focus-visible { outline: 2px solid #171812; outline-offset: 5px; }
.direction-nav__action { min-height: 36px; display: inline-flex; align-items: center; padding: 0 15px; border-radius: 999px; background: #171812; color: #f5f6f1; }
.direction-nav__body { min-height: 1780px; }
.direction-nav__hero { min-height: 560px; display: grid; align-content: end; padding: clamp(42px, 7vw, 90px) clamp(24px, 6vw, 84px); border-bottom: 1px solid #d9dbd2; }
.direction-nav__kicker { width: fit-content; padding: 5px 7px; background: #d9ff42; font: 600 10px/1 "DM Sans", sans-serif; text-transform: uppercase; }
.direction-nav__hero h2 { max-width: 960px; margin: 20px 0 0; font: 400 clamp(62px, 9vw, 124px)/.8 "Instrument Serif", serif; }
.direction-nav__chapter { min-height: 610px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, .7fr); gap: clamp(36px, 8vw, 120px); align-items: start; padding: clamp(56px, 8vw, 112px) clamp(24px, 6vw, 84px); }
.direction-nav__chapter + .direction-nav__chapter { border-top: 1px solid #d9dbd2; background: #171812; color: #f5f6f1; }
.direction-nav__chapter h3 { max-width: 12ch; margin: 0; font: 400 clamp(42px, 6vw, 76px)/.9 "Instrument Serif", serif; }
.direction-nav__chapter p { max-width: 42ch; margin: 0; color: #6d7067; font: 500 14px/1.6 "DM Sans", sans-serif; }
.direction-nav__chapter + .direction-nav__chapter p { color: #a9ada3; }
@media (max-width: 650px) {
  .direction-nav { grid-template-columns: auto 1fr; height: 60px; }
  .direction-nav__links { justify-content: end; }
  .direction-nav__links a:nth-child(n+3), .direction-nav__action { display: none; }
  .direction-nav__hero { min-height: 590px; }
  .direction-nav__chapter { min-height: 600px; grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .direction-nav { transition: none; }
}
`;

const defaultItems = ["Archive", "Method", "Notes"];

export default function ScrollDirectionNav({
  items = defaultItems,
  threshold = 16,
}) {
  const [visible, setVisible] = useState(true);
  const lastPosition = useRef(0);
  const direction = useRef(0);
  const distance = useRef(0);

  function handleScroll(event) {
    const position = event.currentTarget.scrollTop;
    const delta = position - lastPosition.current;
    const nextDirection = Math.sign(delta);

    if (position <= 12) {
      setVisible(true);
      distance.current = 0;
    } else if (nextDirection !== 0) {
      if (nextDirection !== direction.current) distance.current = 0;
      direction.current = nextDirection;
      distance.current += Math.abs(delta);
      if (distance.current >= threshold) {
        setVisible(nextDirection < 0);
        distance.current = 0;
      }
    }

    lastPosition.current = position;
  }

  return (
    <section className="direction-nav-demo" onScroll={handleScroll} tabIndex={0} aria-label="Scrollable page with direction-aware navigation">
      <style>{styles}</style>
      <header className={`direction-nav ${visible ? "" : "is-hidden"}`} data-visible={visible}>
        <span className="direction-nav__brand">Field Notes</span>
        <nav className="direction-nav__links" aria-label="Demo navigation">
          {items.map((item) => <a href={`#direction-${item.toLowerCase()}`} key={item}>{item}</a>)}
        </nav>
        <a className="direction-nav__action" href="#direction-contact">Open brief</a>
      </header>
      <div className="direction-nav__body">
        <div className="direction-nav__hero" id="direction-archive">
          <span className="direction-nav__kicker">Scroll down, then reverse</span>
          <h2>Navigation that follows reading intent.</h2>
        </div>
        <div className="direction-nav__chapter" id="direction-method">
          <h3>Make room for the work.</h3>
          <p>Downward movement hides the fixed bar after a short threshold. The smallest upward reversal restores it, keeping navigation close without covering the page.</p>
        </div>
        <div className="direction-nav__chapter" id="direction-notes">
          <h3>Direction is the only signal.</h3>
          <p id="direction-contact">The state machine stays independent from page content, works with keyboard scrolling, and always restores the navigation at the top boundary.</p>
        </div>
      </div>
    </section>
  );
}
