import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  Download,
  Eye,
  RotateCcw,
} from "lucide-react";
import { categories, motionComponents } from "./data/registry";
import ShuffleText from "./components/ShuffleText";

const defaultComponentId = motionComponents.find(
  (item) => item.category === categories[0]?.id,
)?.id ?? motionComponents[0]?.id;

const legacyComponentIds = {
  "social-fan": "fanned-image-gallery",
};

const mobileMenuCloseFallbackDuration = 320;

function Sidebar({ selectedId, onSelect, menuPhase, onTransitionEnd, compactViewport }) {
  const mobileOpen = menuPhase === "open";
  const mobileClosing = menuPhase === "closing";

  return (
    <aside
      id="motion-index-sidebar"
      className={`sidebar ${mobileOpen ? "is-open" : ""} ${mobileClosing ? "is-closing" : ""}`}
      role={compactViewport ? "dialog" : undefined}
      aria-label={compactViewport ? "动效组件目录" : undefined}
      aria-modal={compactViewport && mobileOpen ? true : undefined}
      aria-hidden={compactViewport && !mobileOpen ? true : undefined}
      inert={compactViewport && !mobileOpen}
      onTransitionEnd={onTransitionEnd}
    >
      <div className="sidebar__brand">
        <strong className="sidebar__wordmark" aria-label="Motion">MOOOTION</strong>
      </div>

      <nav className="sidebar__nav" aria-label="动效组件目录">
        {categories.map((category, categoryIndex) => {
          const items = motionComponents.filter((item) => item.category === category.id);
          return (
            <section
              className="nav-group"
              key={category.id}
              style={{ "--menu-delay": `${120 + categoryIndex * 28}ms` }}
            >
              <div className="nav-group__heading">
                <span>{category.title}</span>
              </div>
              {items.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${selectedId === item.id ? "is-active" : ""}`}
                  onClick={() => onSelect(item.id)}
                >
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.english}</small>
                  </span>
                </button>
              ))}
            </section>
          );
        })}
      </nav>

      <div className="sidebar__foot">
        <span className="sidebar__credit">©HermioneWei</span>
      </div>
    </aside>
  );
}

function CodeView({ source }) {
  return (
    <div className="code-view" aria-label="组件源码">
      <pre>
        <code>
          {source.split("\n").map((line, index) => (
            <span className="code-line" key={`${index}-${line}`}>
              <span className="code-line__number">{String(index + 1).padStart(2, "0")}</span>
              <span className="code-line__content">{line || " "}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

async function writeClipboard(text) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    field.style.pointerEvents = "none";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    if (!copied) throw new Error("Clipboard copy failed");
  }
}

export default function App() {
  const hashId = window.location.hash.slice(1);
  const initialId = legacyComponentIds[hashId] ?? hashId;
  const [selectedId, setSelectedId] = useState(
    motionComponents.some((item) => item.id === initialId) ? initialId : defaultComponentId,
  );
  const [view, setView] = useState("preview");
  const [replayKey, setReplayKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [mobileMenuPhase, setMobileMenuPhase] = useState("closed");
  const [compactViewport, setCompactViewport] = useState(() =>
    window.matchMedia("(max-width: 1200px)").matches,
  );
  const mobileMenuTriggerRef = useRef(null);
  const mobileMenuCloseFallbackRef = useRef(null);
  const mobileMenuSelectionFrameRef = useRef(null);
  const mobileMenuOpen = mobileMenuPhase === "open";
  const mobileMenuActive = mobileMenuPhase !== "closed";

  const selected = useMemo(
    () => motionComponents.find((item) => item.id === selectedId),
    [selectedId],
  );

  useEffect(() => {
    window.history.replaceState(null, "", `#${selectedId}`);
  }, [selectedId]);

  useEffect(() => {
    const compactQuery = window.matchMedia("(max-width: 1200px)");
    const syncCompactViewport = () => {
      setCompactViewport(compactQuery.matches);
      if (compactQuery.matches) return;

      window.clearTimeout(mobileMenuCloseFallbackRef.current);
      setMobileMenuPhase("closed");
    };

    syncCompactViewport();
    compactQuery.addEventListener("change", syncCompactViewport);
    return () => {
      compactQuery.removeEventListener("change", syncCompactViewport);
      window.clearTimeout(mobileMenuCloseFallbackRef.current);
      window.cancelAnimationFrame(mobileMenuSelectionFrameRef.current);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "is-library-menu-open",
      compactViewport && mobileMenuActive,
    );
    return () => document.documentElement.classList.remove("is-library-menu-open");
  }, [compactViewport, mobileMenuActive]);

  useEffect(() => {
    if (!compactViewport || !mobileMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileMenu();
        return;
      }

      if (event.key !== "Tab") return;
      const sidebar = document.querySelector(".sidebar");
      const sidebarFocusable = [...sidebar.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      )].filter((element) => !element.closest('[aria-hidden="true"]'));
      const focusable = [...sidebarFocusable, mobileMenuTriggerRef.current].filter(Boolean);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [compactViewport, mobileMenuOpen]);

  function openMobileMenu() {
    if (!compactViewport) return;

    window.clearTimeout(mobileMenuCloseFallbackRef.current);
    setMobileMenuPhase("open");
  }

  function completeMobileMenuClose() {
    window.clearTimeout(mobileMenuCloseFallbackRef.current);
    setMobileMenuPhase((phase) => (phase === "closing" ? "closed" : phase));
  }

  function handleMobileMenuTransitionEnd(event) {
    if (event.target !== event.currentTarget || mobileMenuPhase !== "closing") return;
    if (event.propertyName !== "clip-path" && event.propertyName !== "-webkit-clip-path") return;
    completeMobileMenuClose();
  }

  function closeMobileMenu() {
    if (!mobileMenuOpen) return;

    window.clearTimeout(mobileMenuCloseFallbackRef.current);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMobileMenuPhase(reducedMotion ? "closed" : "closing");
    window.requestAnimationFrame(() => mobileMenuTriggerRef.current?.focus());
    if (reducedMotion) return;

    mobileMenuCloseFallbackRef.current = window.setTimeout(
      completeMobileMenuClose,
      mobileMenuCloseFallbackDuration,
    );
  }

  function handleComponentSelect(id) {
    if (id === selectedId) {
      if (mobileMenuOpen) closeMobileMenu();
      return;
    }

    const selectComponent = () => {
      setView("preview");
      setSelectedId(id);
    };

    if (compactViewport && mobileMenuOpen) {
      closeMobileMenu();
      window.cancelAnimationFrame(mobileMenuSelectionFrameRef.current);
      mobileMenuSelectionFrameRef.current = window.requestAnimationFrame(() => {
        mobileMenuSelectionFrameRef.current = window.requestAnimationFrame(() => {
          mobileMenuSelectionFrameRef.current = null;
          startTransition(selectComponent);
        });
      });
      return;
    }

    selectComponent();
  }

  async function copySource() {
    await writeClipboard(selected.source);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const DemoComponent = selected.Component;

  return (
    <div className="app-shell">
      <Sidebar
        selectedId={selectedId}
        onSelect={handleComponentSelect}
        menuPhase={mobileMenuPhase}
        onTransitionEnd={handleMobileMenuTransitionEnd}
        compactViewport={compactViewport}
      />

      <button
        ref={mobileMenuTriggerRef}
        className={`mobile-menu-toggle ${mobileMenuOpen ? "is-open" : ""}`}
        type="button"
        onClick={mobileMenuOpen ? closeMobileMenu : openMobileMenu}
        aria-controls="motion-index-sidebar"
        aria-expanded={mobileMenuOpen}
        aria-label={mobileMenuOpen ? "关闭目录" : "打开目录"}
        title={mobileMenuOpen ? "关闭目录" : "打开目录"}
      >
        <span className="mobile-menu-toggle__line mobile-menu-toggle__line--top" aria-hidden="true" />
        <span className="mobile-menu-toggle__line mobile-menu-toggle__line--bottom" aria-hidden="true" />
      </button>

      <main
        className="workspace"
        aria-hidden={compactViewport && mobileMenuActive ? true : undefined}
        inert={compactViewport && mobileMenuActive}
      >
        <div className="component-page">
          <section className="component-head">
            <div className="component-head__copy">
              <div className="component-title-lockup">
                <h1><span>{selected.title}</span></h1>
                <p className="component-english" lang="en">
                  {selected.english}
                </p>
              </div>
            </div>
            <p
              className="component-tech"
              aria-label={`核心实现：${selected.implementation.join("、")}`}
            >
              {selected.implementation.join(" · ")}
            </p>
          </section>

          <section className="demo-tool">
            <div className="tool-row">
              <div className="segmented-control" aria-label="视图切换">
                <button className={view === "preview" ? "is-active" : ""} onClick={() => setView("preview")}>
                  <Eye size={15} /> <ShuffleText text="Preview" enabled />
                </button>
                <button className={view === "code" ? "is-active" : ""} onClick={() => setView("code")}>
                  <Code2 size={15} /> <ShuffleText text="Code" enabled />
                </button>
              </div>
              <div className="tool-actions">
                <button className="icon-button" onClick={() => setReplayKey((value) => value + 1)} aria-label="重新播放" title="重新播放">
                  <RotateCcw size={17} />
                </button>
                {selected.id === "anchored-cloud-field" && (
                  <a
                    className="command-button"
                    href="/images/air-cloud.png"
                    download="air-cloud.png"
                    aria-label="下载云朵 PNG 图片"
                  >
                    <Download size={16} />
                    <ShuffleText text="下载图片" enabled />
                  </a>
                )}
                <button className="command-button" onClick={copySource}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <ShuffleText
                    text={copied ? "已复制" : "复制代码"}
                    enabled
                  />
                </button>
              </div>
            </div>

            <div className={`demo-stage ${view === "code" ? "is-code" : ""}`}>
              {view === "preview" ? <DemoComponent key={`${selected.id}-${replayKey}`} /> : <CodeView source={selected.source} />}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
