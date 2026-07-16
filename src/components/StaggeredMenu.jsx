import { useEffect, useId, useRef, useState } from "react";

const styles = `
.staggered-menu { min-height: 100%; position: relative; overflow: hidden; background: #dbe3ff; color: #171812; }
.staggered-menu__home { height: 100%; display: grid; align-content: space-between; padding: clamp(24px, 3vw, 40px); }
.staggered-menu__home-head { display: flex; justify-content: space-between; gap: 20px; font: 600 11px/1.2 "DM Sans", sans-serif; text-transform: uppercase; }
.staggered-menu__home-title { max-width: 850px; margin: 34px 0; font: 400 clamp(58px, 7.2vw, 92px)/.8 "Instrument Serif", serif; }
.staggered-menu__home-foot { display: flex; justify-content: space-between; gap: 20px; padding-top: 14px; border-top: 1px solid #9ca7c8; color: #59617a; font: 600 11px/1.3 "DM Sans", sans-serif; }
.staggered-menu__toggle { position: absolute; z-index: 8; right: clamp(18px, 3vw, 34px); top: clamp(18px, 3vw, 30px); width: 72px; height: 72px; border: 0; border-radius: 50%; background: #d9ff42; color: #171812; font: 600 10px/1 "DM Sans", sans-serif; cursor: pointer; transition: transform 350ms cubic-bezier(.16,1,.3,1), background 220ms ease; }
.staggered-menu__toggle:hover { transform: rotate(8deg) scale(1.04); }
.staggered-menu.is-open .staggered-menu__toggle { background: #ff6547; transform: rotate(-8deg); }
.staggered-menu__overlay { position: absolute; z-index: 6; inset: 0; display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(240px, .8fr); gap: clamp(26px, 5vw, 70px); padding: clamp(86px, 10vh, 112px) clamp(24px, 4vw, 52px) clamp(28px, 4vw, 40px); background: #171812; color: #f6f6ef; clip-path: ellipse(0% 0% at 100% 0%); transition: clip-path 820ms cubic-bezier(.76,0,.24,1); pointer-events: none; }
.staggered-menu.is-open .staggered-menu__overlay { clip-path: ellipse(150% 150% at 100% 0%); pointer-events: auto; }
.staggered-menu__nav { align-self: center; border-top: 1px solid #44463f; }
.staggered-menu__link { width: 100%; display: grid; grid-template-columns: 38px 1fr auto; align-items: center; min-height: clamp(64px, 8vh, 78px); padding: 0; border: 0; border-bottom: 1px solid #44463f; background: transparent; color: inherit; text-align: left; cursor: pointer; opacity: 0; transform: translateY(42px); transition: transform 620ms cubic-bezier(.16,1,.3,1), opacity 320ms ease; transition-delay: calc(var(--index) * 70ms); }
.staggered-menu.is-open .staggered-menu__link { opacity: 1; transform: translateY(0); transition-delay: calc(310ms + var(--index) * 75ms); }
.staggered-menu__link small { color: #85887f; font: 600 10px/1 "DM Sans", sans-serif; }
.staggered-menu__link strong { font: 400 clamp(38px, 5vw, 70px)/.9 "Instrument Serif", serif; }
.staggered-menu__link span { color: #d9ff42; font-size: 24px; opacity: 0; transform: translateX(-12px); transition: opacity 220ms ease, transform 350ms cubic-bezier(.16,1,.3,1); }
.staggered-menu__link:hover span, .staggered-menu__link:focus-visible span { opacity: 1; transform: translateX(0); }
.staggered-menu__visual { position: relative; align-self: stretch; min-height: min(300px, 42vh); overflow: hidden; opacity: 0; transform: translateY(50px); transition: transform 700ms cubic-bezier(.16,1,.3,1) 250ms, opacity 350ms ease 250ms; }
.staggered-menu.is-open .staggered-menu__visual { opacity: 1; transform: translateY(0); transition-delay: 520ms; }
.staggered-menu__image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity 400ms ease, transform 700ms cubic-bezier(.16,1,.3,1); }
.staggered-menu__image:not(.is-active) { opacity: 0; transform: scale(1.06); }
.staggered-menu__overlay-foot { display: none; }
.staggered-menu.is-compact { background: #f5f6f1; }
.staggered-menu.is-compact .staggered-menu__home-title { max-width: 760px; }
.staggered-menu.is-compact .staggered-menu__overlay { grid-template-columns: 1fr; align-content: space-between; background: #f5f6f1; color: #171812; clip-path: inset(0 0 100% 0); }
.staggered-menu.is-compact.is-open .staggered-menu__overlay { clip-path: inset(0); }
.staggered-menu.is-compact .staggered-menu__nav { width: min(920px, 100%); align-self: end; border-color: #bfc2b9; }
.staggered-menu.is-compact .staggered-menu__link { min-height: clamp(70px, 10vh, 94px); border-color: #bfc2b9; }
.staggered-menu.is-compact .staggered-menu__link small { color: #6d7067; }
.staggered-menu.is-compact .staggered-menu__link strong { font-size: clamp(42px, 6vw, 76px); }
.staggered-menu.is-compact .staggered-menu__link span { color: #ff6547; }
.staggered-menu.is-compact .staggered-menu__visual { display: none; }
.staggered-menu.is-compact .staggered-menu__overlay-foot { display: flex; justify-content: space-between; gap: 20px; padding-top: 16px; border-top: 1px solid #bfc2b9; color: #6d7067; font: 600 10px/1.3 "DM Sans", sans-serif; text-transform: uppercase; opacity: 0; transform: translateY(18px); transition: opacity 300ms ease, transform 500ms cubic-bezier(.16,1,.3,1); }
.staggered-menu.is-compact.is-open .staggered-menu__overlay-foot { opacity: 1; transform: translateY(0); transition-delay: 610ms; }
@media (max-width: 700px) {
  .staggered-menu__toggle { width: 58px; height: 58px; }
  .staggered-menu__overlay { grid-template-columns: 1fr; padding-top: 92px; }
  .staggered-menu__link { min-height: 64px; }
  .staggered-menu__visual { min-height: 190px; }
  .staggered-menu.is-compact .staggered-menu__overlay { padding: 92px 20px 24px; }
  .staggered-menu.is-compact .staggered-menu__link { grid-template-columns: 30px 1fr auto; min-height: 68px; }
  .staggered-menu.is-compact .staggered-menu__overlay-foot { align-items: flex-start; flex-direction: column; }
}
@media (prefers-reduced-motion: reduce) {
  .staggered-menu__overlay, .staggered-menu__link, .staggered-menu__visual, .staggered-menu__image, .staggered-menu__overlay-foot { transition: none; }
}
`;

const menuItems = [
  { title: "Work", image: "/images/retro-media-orbit.webp" },
  { title: "Studio", image: "/images/retro-cosmic-paths.webp" },
  { title: "Journal", image: "/images/retro-cloud-stairway.webp" },
  { title: "Contact", image: "/images/retro-oval-horizon.webp" },
];

export default function StaggeredMenu({ items = menuItems, variant = "compact" }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const overlayId = useId();
  const toggleRef = useRef(null);
  const firstLinkRef = useRef(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const frame = requestAnimationFrame(() => firstLinkRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }

    if (wasOpen.current) {
      wasOpen.current = false;
      toggleRef.current?.focus();
    }

    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <section className={`staggered-menu ${open ? "is-open" : ""} ${variant === "compact" ? "is-compact" : ""}`}>
      <style>{styles}</style>
      <div className="staggered-menu__home">
        <div className="staggered-menu__home-head"><span>Independent practice</span><span>Index / 04</span></div>
        <h2 className="staggered-menu__home-title">A quiet page with the whole index one tap away.</h2>
        <div className="staggered-menu__home-foot"><span>Selected projects and field notes</span><span>2021 - 2026</span></div>
      </div>
      <button
        className="staggered-menu__toggle"
        type="button"
        ref={toggleRef}
        onClick={() => setOpen((value) => !value)}
        aria-controls={overlayId}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? "CLOSE" : "MENU"}
      </button>
      <div className="staggered-menu__overlay" id={overlayId} aria-hidden={!open}>
        <nav className="staggered-menu__nav" aria-label="Demo menu">
          {items.map((item, index) => (
            <button className="staggered-menu__link" type="button" ref={index === 0 ? firstLinkRef : null} tabIndex={open ? 0 : -1} style={{ "--index": index }} key={item.title} onPointerEnter={() => setActive(index)} onFocus={() => setActive(index)} onClick={() => setActive(index)}>
              <small>{String(index + 1).padStart(2, "0")}</small><strong>{item.title}</strong><span>→</span>
            </button>
          ))}
        </nav>
        <div className="staggered-menu__visual">
          {items.map((item, index) => <img className={`staggered-menu__image ${active === index ? "is-active" : ""}`} src={item.image} alt="" key={item.title} />)}
        </div>
        <div className="staggered-menu__overlay-foot"><span>Available for selected collaborations</span><span>hello@example.com</span></div>
      </div>
    </section>
  );
}
