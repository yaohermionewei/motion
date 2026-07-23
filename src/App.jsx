import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  Download,
  Eye,
  Menu,
  RotateCcw,
  X,
} from "lucide-react";
import { categories, motionComponents } from "./data/registry";
import ShuffleText from "./components/ShuffleText";

const defaultComponentId = motionComponents.find(
  (item) => item.category === categories[0]?.id,
)?.id ?? motionComponents[0]?.id;

function Sidebar({ selectedId, onSelect, mobileOpen, onClose, compactViewport }) {
  return (
    <aside
      className={`sidebar ${mobileOpen ? "is-open" : ""}`}
      aria-hidden={compactViewport && !mobileOpen ? true : undefined}
      inert={compactViewport && !mobileOpen}
    >
      <div className="sidebar__brand">
        <strong className="sidebar__wordmark" aria-label="Motion">MOOOTION</strong>
        <button className="icon-button sidebar__close" onClick={onClose} aria-label="关闭目录" title="关闭目录">
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="动效组件目录">
        {categories.map((category) => {
          const items = motionComponents.filter((item) => item.category === category.id);
          return (
            <section className="nav-group" key={category.id}>
              <div className="nav-group__heading">
                <span>{category.title}</span>
              </div>
              {items.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${selectedId === item.id ? "is-active" : ""}`}
                  onClick={() => { onSelect(item.id); onClose(); }}
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
  const initialId = window.location.hash.slice(1);
  const [selectedId, setSelectedId] = useState(
    motionComponents.some((item) => item.id === initialId) ? initialId : defaultComponentId,
  );
  const [view, setView] = useState("preview");
  const [replayKey, setReplayKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compactViewport, setCompactViewport] = useState(() =>
    window.matchMedia("(max-width: 1200px)").matches,
  );
  const mobileMenuTriggerRef = useRef(null);

  const selected = useMemo(
    () => motionComponents.find((item) => item.id === selectedId),
    [selectedId],
  );

  useEffect(() => {
    window.history.replaceState(null, "", `#${selectedId}`);
    setView("preview");
    setReplayKey((value) => value + 1);
  }, [selectedId]);

  useEffect(() => {
    const compactQuery = window.matchMedia("(max-width: 1200px)");
    const syncScrollLock = () => {
      setCompactViewport(compactQuery.matches);
      document.documentElement.classList.toggle(
        "is-library-menu-open",
        mobileOpen && compactQuery.matches,
      );
      if (!compactQuery.matches && mobileOpen) setMobileOpen(false);
    };
    const handleKeyDown = (event) => {
      if (!mobileOpen || !compactQuery.matches) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        window.requestAnimationFrame(() => mobileMenuTriggerRef.current?.focus());
        return;
      }

      if (event.key !== "Tab") return;
      const sidebar = document.querySelector(".sidebar");
      const focusable = [...sidebar.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      )].filter((element) => !element.closest('[aria-hidden="true"]'));
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

    syncScrollLock();
    if (mobileOpen && compactQuery.matches) {
      window.requestAnimationFrame(() => document.querySelector(".sidebar__close")?.focus());
    }
    compactQuery.addEventListener("change", syncScrollLock);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      compactQuery.removeEventListener("change", syncScrollLock);
      document.removeEventListener("keydown", handleKeyDown);
      document.documentElement.classList.remove("is-library-menu-open");
    };
  }, [mobileOpen]);

  function closeMobileMenu() {
    setMobileOpen(false);
    window.requestAnimationFrame(() => mobileMenuTriggerRef.current?.focus());
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
        onSelect={setSelectedId}
        mobileOpen={mobileOpen}
        onClose={closeMobileMenu}
        compactViewport={compactViewport}
      />
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          onClick={closeMobileMenu}
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      <main
        className="workspace"
        aria-hidden={compactViewport && mobileOpen ? true : undefined}
        inert={compactViewport && mobileOpen}
      >
        <div className="component-page">
          <section className="component-head">
            <button ref={mobileMenuTriggerRef} className="icon-button component-head__menu" onClick={() => setMobileOpen(true)} aria-label="打开目录" title="打开目录">
              <Menu size={19} />
            </button>
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
