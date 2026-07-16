import { useState } from "react";

const styles = `
.signature-draw { height: 100%; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; background: #20251c; color: #f6f6ef; }
.signature-draw:focus-visible { outline: 3px solid #d9ff42; outline-offset: -3px; }
.signature-draw__track { height: 180%; }
.signature-draw__stage { position: sticky; top: 0; height: 55.5556%; display: grid; place-items: center; overflow: hidden; }
.signature-draw__pattern { position: absolute; inset: -20%; opacity: .12; background: repeating-radial-gradient(ellipse at 65% 45%, transparent 0 78px, #959a8e 80px 81px, transparent 83px 138px); }
.signature-draw__words { position: absolute; inset: 50% auto auto 50%; width: 140%; transform: translate(-50%, -50%); color: #d9ff42; opacity: .48; font: 400 clamp(68px, 11vw, 150px)/.82 "Instrument Serif", serif; white-space: nowrap; text-align: center; }
.signature-draw__svg { position: relative; z-index: 2; width: min(1000px, 92%); overflow: visible; filter: drop-shadow(0 0 10px rgba(217,255,66,.12)); }
.signature-draw__path { fill: none; stroke: #d9ff42; stroke-width: 14; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: var(--dash); }
.signature-draw__path--fine { stroke-width: 8; opacity: .9; }
.signature-draw__head { position: absolute; z-index: 3; inset: 24px 28px auto; display: flex; justify-content: space-between; gap: 20px; color: #b8bdaf; font: 600 10px/1.2 "DM Sans", sans-serif; text-transform: uppercase; }
.signature-draw__head span:first-child { color: #d9ff42; }
.signature-draw__progress { position: absolute; z-index: 3; right: 28px; bottom: 24px; font: 600 10px/1 "DM Sans", sans-serif; }
@media (max-width: 650px) {
  .signature-draw__head { align-items: flex-start; flex-direction: column; }
  .signature-draw__words { width: 240%; }
  .signature-draw__path { stroke-width: 18; }
}
@media (prefers-reduced-motion: reduce) {
  .signature-draw__path { stroke-dashoffset: 0; }
}
`;

export default function SignatureDraw() {
  const [progress, setProgress] = useState(0);

  function handleScroll(event) {
    const node = event.currentTarget;
    const max = node.scrollHeight - node.clientHeight;
    setProgress(max ? Math.min(node.scrollTop / max, 1) : 1);
  }

  const first = 1 - Math.min(progress / 0.78, 1);
  const second = 1 - Math.max(0, Math.min((progress - 0.34) / 0.66, 1));

  return (
    <section className="signature-draw" onScroll={handleScroll} tabIndex={0} aria-label="Scrollable handwriting path animation">
      <style>{styles}</style>
      <div className="signature-draw__track">
        <div className="signature-draw__stage">
          <div className="signature-draw__pattern" />
          <div className="signature-draw__words">LEAVE A MARK WORTH FOLLOWING</div>
          <div className="signature-draw__head"><span>Original path study</span><span>Scroll to draw</span></div>
          <svg className="signature-draw__svg" viewBox="0 0 1000 520" role="img" aria-label="An original handwritten flourish being drawn">
            <path className="signature-draw__path" pathLength="1" style={{ "--dash": first }} d="M92 356 C182 218 286 82 452 78 C580 75 578 214 465 256 C356 297 210 274 162 379 C120 472 279 434 389 332 C507 223 584 131 663 129 C731 127 689 247 620 313 C560 369 557 449 631 417 C708 385 757 271 813 246 C855 227 838 304 800 349" />
            <path className="signature-draw__path signature-draw__path--fine" pathLength="1" style={{ "--dash": second }} d="M331 406 C470 353 600 332 744 326 C819 323 883 334 922 359 M478 423 C555 387 639 379 724 391" />
          </svg>
          <span className="signature-draw__progress">{Math.round(progress * 100)}%</span>
        </div>
      </div>
    </section>
  );
}
