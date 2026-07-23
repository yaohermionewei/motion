import { useState } from "react";
import { ChevronDown } from "lucide-react";

const styles = `
.signature-draw { height: 100%; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; background: #000; color: #f6f6ef; }
.signature-draw:focus-visible { outline: 2px solid #f6f6ef; outline-offset: -2px; }
.signature-draw__track { height: 180%; }
.signature-draw__stage { position: sticky; top: 0; height: 55.5556%; display: grid; place-items: center; overflow: hidden; }
.signature-draw__cue { position: absolute; z-index: 3; left: 50%; top: 50%; display: grid; justify-items: center; gap: 9px; color: rgba(246,246,239,.62); opacity: var(--cue-opacity); transform: translate(-50%, -50%); pointer-events: none; transition: opacity 180ms ease; }
.signature-draw__cue-label { font: 600 9px/1 "DM Sans", sans-serif; letter-spacing: 0; }
.signature-draw__cue-icon { width: 17px; height: 17px; stroke-width: 1.6; animation: signature-scroll-cue 1500ms cubic-bezier(.4,0,.2,1) infinite; }
.signature-draw__svg { position: relative; z-index: 2; width: min(1000px, 92%); overflow: visible; filter: drop-shadow(0 0 10px rgba(255,255,255,.12)); }
.signature-draw__path { fill: none; stroke: #f6f6ef; stroke-width: 14; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: var(--dash); }
.signature-draw__path--fine { stroke-width: 8; }
@media (max-width: 650px) {
  .signature-draw__path { stroke-width: 18; }
}
@media (prefers-reduced-motion: reduce) {
  .signature-draw__cue-icon { animation: none; }
}
@keyframes signature-scroll-cue {
  0%, 100% { transform: translateY(0); opacity: .48; }
  50% { transform: translateY(6px); opacity: 1; }
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
  const cueOpacity = Math.max(0, 1 - progress / 0.04);

  return (
    <section className="signature-draw" onScroll={handleScroll} tabIndex={0} aria-label="Scrollable handwriting path animation">
      <style>{styles}</style>
      <div className="signature-draw__track">
        <div className="signature-draw__stage">
          <div className="signature-draw__cue" style={{ "--cue-opacity": cueOpacity }} aria-hidden="true">
            <span className="signature-draw__cue-label">SCROLL DOWN</span>
            <ChevronDown className="signature-draw__cue-icon" />
          </div>
          <svg className="signature-draw__svg" viewBox="0 0 1000 520" role="img" aria-label="An original handwritten flourish being drawn">
            <path className="signature-draw__path" pathLength="1" style={{ "--dash": first, opacity: progress > 0 ? 1 : 0 }} d="M92 356 C182 218 286 82 452 78 C580 75 578 214 465 256 C356 297 210 274 162 379 C120 472 279 434 389 332 C507 223 584 131 663 129 C731 127 689 247 620 313 C560 369 557 449 631 417 C708 385 757 271 813 246 C855 227 838 304 800 349" />
            <path className="signature-draw__path signature-draw__path--fine" pathLength="1" style={{ "--dash": second, opacity: progress > 0.34 ? 0.9 : 0 }} d="M331 406 C470 353 600 332 744 326 C819 323 883 334 922 359 M478 423 C555 387 639 379 724 391" />
          </svg>
        </div>
      </div>
    </section>
  );
}
