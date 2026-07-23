import { useEffect, useRef } from "react";

const styles = `
.horizontal-reel { height:100%; min-height:100%; padding:clamp(18px,2.4vw,32px) 0; background:#000; color:#f6f6ef; overflow:hidden; }
.horizontal-reel__track { height:100%; min-height:0; display:flex; align-items:stretch; gap:clamp(52px,5.5vw,84px); overflow-x:auto; overflow-y:hidden; overscroll-behavior-x:contain; overscroll-behavior-y:auto; scrollbar-width:none; padding:0 clamp(110px,14vw,210px) 0 clamp(28px,5vw,72px); cursor:grab; }
.horizontal-reel__track::-webkit-scrollbar { display:none; }
.horizontal-reel__track:focus-visible { outline:2px solid #f6f6ef; outline-offset:-2px; }
.horizontal-reel__track.is-dragging { cursor:grabbing; user-select:none; }
.horizontal-reel__group { flex:none; height:100%; min-height:0; display:flex; flex-direction:column; align-items:flex-start; gap:clamp(22px,3vh,34px); }
.horizontal-reel__group.is-1 { width:clamp(190px,23vh,235px); justify-content:space-between; padding:clamp(4px,1.5vh,14px) 0; margin-right:clamp(24px,4vw,60px); }
.horizontal-reel__group.is-2 { width:clamp(430px,54vh,560px); justify-content:flex-end; padding-bottom:clamp(18px,6vh,58px); margin-right:clamp(70px,10vw,150px); }
.horizontal-reel__group.is-3 { width:clamp(210px,27vh,270px); justify-content:space-between; padding:0 0 clamp(20px,5vh,48px); margin-right:clamp(20px,3vw,46px); }
.horizontal-reel__group.is-4 { width:clamp(175px,23vh,230px); justify-content:flex-end; padding-bottom:clamp(10px,3vh,28px); }
.horizontal-reel__group.is-5 { width:clamp(170px,20vh,205px); justify-content:flex-start; padding-top:clamp(54px,9vh,90px); margin-right:clamp(54px,8vw,116px); }
.horizontal-reel__group.is-6 { width:clamp(420px,52vh,540px); justify-content:center; margin-right:clamp(74px,10vw,150px); }
.horizontal-reel__group.is-7 { width:clamp(240px,30vh,310px); justify-content:space-between; padding:clamp(22px,4vh,40px) 0 clamp(12px,2vh,22px); }
.horizontal-reel__group.is-extra { width:clamp(220px,28vh,290px); justify-content:center; }
.horizontal-reel__card { flex:none; display:flex; flex-direction:column; min-width:0; }
.horizontal-reel__card.is-1 { width:clamp(190px,23vh,235px); align-self:flex-start; }
.horizontal-reel__card.is-2 { width:clamp(165px,20.5vh,210px); align-self:flex-end; }
.horizontal-reel__card.is-3 { width:clamp(430px,54vh,560px); }
.horizontal-reel__card.is-4 { width:clamp(210px,27vh,270px); align-self:flex-start; }
.horizontal-reel__card.is-5 { width:clamp(180px,22vh,225px); align-self:flex-end; }
.horizontal-reel__card.is-6 { width:clamp(175px,23vh,230px); }
.horizontal-reel__card.is-7 { width:clamp(170px,20vh,205px); }
.horizontal-reel__card.is-8 { width:clamp(420px,52vh,540px); }
.horizontal-reel__card.is-9 { width:clamp(190px,24vh,240px); align-self:flex-start; }
.horizontal-reel__card.is-10 { width:clamp(240px,30vh,310px); align-self:flex-end; }
.horizontal-reel__media { width:100%; flex:none; display:flex; justify-content:center; align-items:center; overflow:hidden; background:#111; }
.horizontal-reel__card.is-1 .horizontal-reel__media { aspect-ratio:4/5; }
.horizontal-reel__card.is-2 .horizontal-reel__media { aspect-ratio:3/4; }
.horizontal-reel__card.is-3 .horizontal-reel__media { aspect-ratio:16/9; }
.horizontal-reel__card.is-4 .horizontal-reel__media { aspect-ratio:1; }
.horizontal-reel__card.is-5 .horizontal-reel__media { aspect-ratio:1; }
.horizontal-reel__card.is-6 .horizontal-reel__media { aspect-ratio:3/5; }
.horizontal-reel__card.is-7 .horizontal-reel__media { aspect-ratio:3/4; }
.horizontal-reel__card.is-8 .horizontal-reel__media { aspect-ratio:7/5; }
.horizontal-reel__card.is-9 .horizontal-reel__media { aspect-ratio:1; }
.horizontal-reel__card.is-10 .horizontal-reel__media { aspect-ratio:1; }
.horizontal-reel__image { width:calc(100% + 4rem); max-width:none; height:calc(100% + 4rem); max-height:none; flex:none; object-fit:cover; display:block; transform:translate3d(var(--parallax-x, 0px),0,0); transform-origin:center; will-change:transform; pointer-events:none; user-select:none; }
@media(max-width:1024px){
  .horizontal-reel__track{gap:36px;padding-right:100px;padding-left:24px}
  .horizontal-reel__group{gap:24px}
  .horizontal-reel__group.is-1{width:190px;padding:0;margin-right:24px}
  .horizontal-reel__group.is-2{width:300px;padding-bottom:28px;margin-right:52px}
  .horizontal-reel__group.is-3{width:200px;padding-bottom:20px;margin-right:20px}
  .horizontal-reel__group.is-4{width:170px;padding-bottom:16px}
  .horizontal-reel__group.is-5{width:155px;padding-top:54px;margin-right:38px}
  .horizontal-reel__group.is-6{width:300px;margin-right:52px}
  .horizontal-reel__group.is-7{width:220px;padding:16px 0 8px}
  .horizontal-reel__card.is-1{width:190px}
  .horizontal-reel__card.is-2{width:165px}
  .horizontal-reel__card.is-3{width:300px}
  .horizontal-reel__card.is-4{width:200px}
  .horizontal-reel__card.is-5{width:165px}
  .horizontal-reel__card.is-6{width:170px}
  .horizontal-reel__card.is-7{width:155px}
  .horizontal-reel__card.is-8{width:300px}
  .horizontal-reel__card.is-9{width:180px}
  .horizontal-reel__card.is-10{width:220px}
}
@media(max-width:700px){
  .horizontal-reel{padding:18px 0}
  .horizontal-reel__track{gap:32px;padding-right:84px;padding-left:20px}
  .horizontal-reel__group.is-2,.horizontal-reel__group.is-6{margin-right:34px}
  .horizontal-reel__group.is-5{margin-right:24px}
}
@media(prefers-reduced-motion:reduce){ .horizontal-reel__image{transform:none;will-change:auto} }
`;

const defaultProjects = [
  ["North Loop", "2026", "/images/retro-media-orbit.webp"],
  ["Signal Archive", "2026", "/images/retro-disc-signal.webp"],
  ["Event Horizon", "2025", "/images/retro-luminous-black-hole.webp"],
  ["Working Notes", "2025", "/images/retro-cloud-stairway.webp"],
  ["Material Study", "2024", "/images/retro-cosmic-paths.webp"],
  ["Long Distance", "2024", "/images/retro-planetary-voyage.webp"],
  ["Threshold Study", "2023", "/images/retro-yellow-gateway.webp"],
  ["Orbital Ring", "2023", "/images/retro-stellar-ring.webp"],
  ["Reflected Window", "2022", "/images/retro-window-reflection.webp"],
  ["Vertical City", "2021", "/images/retro-oval-horizon.webp"],
];

const projectGroupSlots = [[0, 1], [2], [3, 4], [5], [6], [7], [8, 9]];

function groupProjects(projects) {
  const groups = projectGroupSlots
    .map((slots) => slots.filter((index) => index < projects.length))
    .filter((slots) => slots.length);

  for (let index = projectGroupSlots.flat().length; index < projects.length; index += 1) {
    groups.push([index]);
  }

  return groups;
}

export default function HorizontalReel({ projects = defaultProjects }) {
  const trackRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const updateParallax = () => {
      frame = 0;
      const trackRect = track.getBoundingClientRect();
      const viewportWidth = track.clientWidth;
      const reducedMotion = media.matches;

      track.querySelectorAll(".horizontal-reel__card").forEach((card) => {
        const image = card.querySelector(".horizontal-reel__image");
        if (!image) return;

        const cardRect = card.getBoundingClientRect();
        const cardLeft = cardRect.left - trackRect.left;
        const travel = viewportWidth + cardRect.width;
        const progress = Math.min(1, Math.max(0, (viewportWidth - cardLeft) / travel));
        const offset = reducedMotion ? 0 : (progress - 0.5) * 64;

        image.style.setProperty("--parallax-x", `${offset}px`);
        image.dataset.parallaxX = offset.toFixed(3);
      });
    };

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(updateParallax);
    };
    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX) || event.deltaY === 0) return;

      const multiplier = event.deltaMode === 1
        ? 16
        : event.deltaMode === 2
          ? track.clientWidth
          : 1;
      const delta = event.deltaY * multiplier;
      const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
      const currentScrollLeft = Math.min(maxScrollLeft, Math.max(0, track.scrollLeft));
      const canScroll = delta > 0
        ? currentScrollLeft < maxScrollLeft - 0.5
        : currentScrollLeft > 0.5;

      if (!canScroll) return;

      event.preventDefault();
      track.scrollLeft = Math.min(maxScrollLeft, Math.max(0, currentScrollLeft + delta));
    };
    const resizeObserver = new ResizeObserver(requestUpdate);

    resizeObserver.observe(track);
    track.addEventListener("wheel", handleWheel, { passive: false });
    track.addEventListener("scroll", requestUpdate, { passive: true });
    media.addEventListener?.("change", requestUpdate);
    requestUpdate();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      track.removeEventListener("wheel", handleWheel);
      track.removeEventListener("scroll", requestUpdate);
      media.removeEventListener?.("change", requestUpdate);
    };
  }, [projects]);

  function handlePointerDown(event) {
    const track = trackRef.current;
    if (!track || event.pointerType !== "mouse" || event.button !== 0) return;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startScrollLeft: track.scrollLeft };
    track.classList.add("is-dragging");
    track.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function handlePointerMove(event) {
    const track = trackRef.current;
    const drag = dragRef.current;
    if (!track || !drag || drag.pointerId !== event.pointerId) return;
    track.scrollLeft = drag.startScrollLeft - (event.clientX - drag.startX);
  }

  function finishPointerDrag(event) {
    const track = trackRef.current;
    const drag = dragRef.current;
    if (!track || !drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    track.classList.remove("is-dragging");
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
  }

  const projectGroups = groupProjects(projects);

  return (
    <section className="horizontal-reel">
      <style>{styles}</style>
      <div
        ref={trackRef}
        className="horizontal-reel__track"
        tabIndex="0"
        aria-label="Selected work"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerDrag}
        onPointerCancel={finishPointerDrag}
        onDragStart={(event) => event.preventDefault()}
      >
        {projectGroups.map((slots, groupIndex) => (
          <div
            className={`horizontal-reel__group ${groupIndex < projectGroupSlots.length ? `is-${groupIndex + 1}` : "is-extra"}`}
            key={slots.join("-")}
          >
            {slots.map((projectIndex) => {
              const [title, year, image] = projects[projectIndex];
              const layoutIndex = (projectIndex % projectGroupSlots.flat().length) + 1;
              return (
                <article className={`horizontal-reel__card is-${layoutIndex}`} key={`${title}-${projectIndex}`}>
                  <div className="horizontal-reel__media">
                    <img className="horizontal-reel__image" src={image} alt="" draggable="false" />
                  </div>
                </article>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
