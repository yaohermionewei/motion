import { useState } from "react";

const styles = `
.parallax-collage { height: 100%; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; background: #f3f2ec; color: #171812; }
.parallax-collage:focus-visible { outline: 3px solid #171812; outline-offset: -3px; }
.parallax-collage__canvas { position: relative; min-height: 1580px; overflow: hidden; }
.parallax-collage__head { position: sticky; z-index: 5; top: 0; display: flex; justify-content: space-between; gap: 20px; padding: 24px clamp(22px, 5vw, 58px); background: linear-gradient(#f3f2ec 55%, rgba(243,242,236,0)); pointer-events: none; }
.parallax-collage__head span { padding: 4px 6px; background: #d9ff42; color: #171812; font: 600 11px/1.3 "DM Sans", sans-serif; text-transform: uppercase; }
.parallax-collage__head small { color: #6d7068; font: 600 11px/1.3 "DM Sans", sans-serif; }
.parallax-collage__title { position: absolute; z-index: 2; top: 10%; left: clamp(24px, 7vw, 92px); width: min(700px, 74%); margin: 0; font: 400 clamp(58px, 9vw, 126px)/.82 "Instrument Serif", serif; }
.parallax-collage__card { position: absolute; z-index: 1; left: var(--left); top: var(--top); width: var(--width); margin: 0; transform: translateY(var(--shift)) rotate(var(--rotate)); transition: transform 80ms linear; will-change: transform; }
.parallax-collage__card:nth-of-type(even) { z-index: 3; }
.parallax-collage__image { width: 100%; aspect-ratio: var(--ratio); display: block; object-fit: cover; box-shadow: 0 24px 60px rgba(24,25,20,.12); }
.parallax-collage__caption { display: flex; justify-content: space-between; gap: 12px; margin-top: 9px; font: 600 10px/1.2 "DM Sans", sans-serif; text-transform: uppercase; }
.parallax-collage__caption span:last-child { color: #777a72; }
@media (max-width: 680px) {
  .parallax-collage__canvas { min-height: 1420px; }
  .parallax-collage__title { top: 9%; width: 90%; }
  .parallax-collage__card { width: calc(var(--width) * 1.2); }
}
@media (prefers-reduced-motion: reduce) {
  .parallax-collage__card { transform: rotate(var(--rotate)); transition: none; }
}
`;

const projects = [
  { title: "North Loop", year: "2026", image: "/images/retro-media-orbit.webp", alt: "Storage media orbiting in a grainy star field", left: "58%", top: "5%", width: "28%", ratio: "4 / 5", drift: -150, rotate: "2deg" },
  { title: "Working Table", year: "2026", image: "/images/retro-cloud-stairway.webp", alt: "A stairway crossing pink clouds", left: "7%", top: "23%", width: "24%", ratio: "4 / 3", drift: 94, rotate: "-3deg" },
  { title: "Open Form", year: "2025", image: "/images/retro-cosmic-paths.webp", alt: "Interlaced paths floating through space", left: "69%", top: "34%", width: "20%", ratio: "3 / 4", drift: -76, rotate: "3deg" },
  { title: "Common Ground", year: "2025", image: "/images/retro-oval-horizon.webp", alt: "A figure looking through an oval horizon", left: "36%", top: "44%", width: "22%", ratio: "4 / 5", drift: 132, rotate: "-1deg" },
  { title: "Field Study", year: "2025", image: "/images/retro-media-orbit.webp", alt: "Retro storage media among planets", left: "4%", top: "59%", width: "31%", ratio: "16 / 10", drift: -104, rotate: "2deg" },
  { title: "Process Notes", year: "2024", image: "/images/retro-cloud-stairway.webp", alt: "A lone figure on a cloud stairway", left: "66%", top: "68%", width: "27%", ratio: "4 / 3", drift: 74, rotate: "-2deg" },
  { title: "Heavy Light", year: "2024", image: "/images/retro-oval-horizon.webp", alt: "A grainy oval portal above a dark landscape", left: "24%", top: "82%", width: "38%", ratio: "16 / 10", drift: 118, rotate: "1deg" },
];

export default function ParallaxCollage({ items = projects }) {
  const [progress, setProgress] = useState(0);

  function handleScroll(event) {
    const node = event.currentTarget;
    const max = node.scrollHeight - node.clientHeight;
    setProgress(max ? node.scrollTop / max : 0);
  }

  return (
    <section className="parallax-collage" onScroll={handleScroll} tabIndex={0} aria-label="Scrollable project collage">
      <style>{styles}</style>
      <div className="parallax-collage__canvas">
        <div className="parallax-collage__head"><span>Selected archive</span><small>Scroll inside the preview</small></div>
        <h2 className="parallax-collage__title">A living wall of selected work.</h2>
        {items.map((item) => (
          <figure
            className="parallax-collage__card"
            key={item.title}
            data-drift={item.drift}
            style={{
              "--left": item.left,
              "--top": item.top,
              "--width": item.width,
              "--ratio": item.ratio,
              "--rotate": item.rotate,
              "--shift": `${(progress - 0.5) * item.drift}px`,
            }}
          >
            <img className="parallax-collage__image" src={item.image} alt={item.alt || ""} />
            <figcaption className="parallax-collage__caption"><span>{item.title}</span><span>{item.year}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
