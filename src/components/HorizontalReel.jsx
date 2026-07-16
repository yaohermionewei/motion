import { useRef } from "react";

const styles = `
.horizontal-reel { min-height:100%; display:grid; align-content:center; gap:14px; padding:clamp(22px,3vw,32px); background:#eef1ea; color:#171812; overflow:hidden; }
.horizontal-reel__top { display:flex; justify-content:space-between; gap:20px; align-items:end; }
.horizontal-reel__heading { margin:0; max-width:620px; font:400 clamp(42px,5vw,56px)/.88 "Instrument Serif",serif; }
.horizontal-reel__hint { color:#666960; font:500 12px/1.4 "DM Sans",sans-serif; text-align:right; }
.horizontal-reel__track { display:flex; gap:14px; overflow-x:auto; overscroll-behavior:contain; scroll-snap-type:x mandatory; scrollbar-width:none; padding-right:25%; }
.horizontal-reel__track::-webkit-scrollbar { display:none; }
.horizontal-reel__card { flex:0 0 min(48vw,340px); scroll-snap-align:start; }
.horizontal-reel__image { aspect-ratio:4/3; width:100%; object-fit:cover; display:block; }
.horizontal-reel__card:nth-child(even) { padding-top:30px; }
.horizontal-reel__meta { display:flex; justify-content:space-between; gap:14px; padding-top:10px; font:600 12px/1.2 "DM Sans",sans-serif; }
.horizontal-reel__year { color:#171812; box-shadow:inset 0 -.55em #d9ff42; }
@media(max-width:700px){ .horizontal-reel__top{align-items:start;flex-direction:column}.horizontal-reel__hint{text-align:left}.horizontal-reel__card{flex-basis:76vw}.horizontal-reel__card:nth-child(even){padding-top:26px} }
`;

const defaultProjects = [
  ["North Loop", "2026", "/images/retro-media-orbit.webp"],
  ["Working Notes", "2025", "/images/retro-cloud-stairway.webp"],
  ["Material Study", "2025", "/images/retro-cosmic-paths.webp"],
  ["Vertical City", "2024", "/images/retro-oval-horizon.webp"],
];

export default function HorizontalReel({ projects = defaultProjects }) {
  const trackRef = useRef(null);

  function handleWheel(event) {
    const track = trackRef.current;
    if (!track || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
    event.preventDefault();
    track.scrollLeft += event.deltaY;
  }

  return (
    <section className="horizontal-reel">
      <style>{styles}</style>
      <div className="horizontal-reel__top">
        <h2 className="horizontal-reel__heading">Selected work, one continuous reel.</h2>
        <div className="horizontal-reel__hint">Scroll or drag inside the track →</div>
      </div>
      <div ref={trackRef} className="horizontal-reel__track" onWheel={handleWheel}>
        {projects.map(([title, year, image]) => (
          <article className="horizontal-reel__card" key={title}>
            <img className="horizontal-reel__image" src={image} alt="" />
            <div className="horizontal-reel__meta"><span>{title}</span><span className="horizontal-reel__year">{year}</span></div>
          </article>
        ))}
      </div>
    </section>
  );
}
