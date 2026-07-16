import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import * as THREE from "three";

const styles = `
.scroll-ripple {
  position: relative;
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  isolation: isolate;
  background: #e8efec;
  color: #1d211f;
}
.scroll-ripple:focus-visible { outline: 3px solid #1d211f; outline-offset: -3px; }
.scroll-ripple__webgl {
  position: absolute;
  z-index: 3;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  will-change: transform;
}
.scroll-ripple__track {
  position: relative;
  z-index: 1;
  min-height: 2760px;
  padding: clamp(34px, 5vw, 70px) clamp(18px, 4vw, 48px) 260px;
}
.scroll-ripple__intro {
  min-height: 280px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 28px;
  align-content: start;
  border-top: 1px solid #9ba8a2;
  padding-top: 16px;
}
.scroll-ripple__eyebrow,
.scroll-ripple__year,
.scroll-ripple__index,
.scroll-ripple__meta span {
  font: 600 10px/1.25 "DM Sans", sans-serif;
  text-transform: uppercase;
}
.scroll-ripple__year { color: #68736e; text-align: right; }
.scroll-ripple__title {
  grid-column: 1 / -1;
  max-width: 900px;
  margin: 10px 0 0;
  font: 400 clamp(58px, 8vw, 112px)/.82 "Instrument Serif", serif;
  letter-spacing: 0;
}
.scroll-ripple__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 28px;
  row-gap: 180px;
}
.scroll-ripple__item { min-width: 0; margin: 0; }
.scroll-ripple__item--wide { grid-column: 1 / -1; }
.scroll-ripple__media {
  position: relative;
  aspect-ratio: var(--media-ratio);
  background: transparent;
}
.scroll-ripple__image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
.scroll-ripple__item.is-webgl .scroll-ripple__image { opacity: 0; }
.scroll-ripple__fallback {
  position: absolute;
  z-index: 4;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #c6d2cc;
  color: #53605a;
  font: 600 11px/1.4 "DM Sans", sans-serif;
  text-align: center;
  text-transform: uppercase;
}
.scroll-ripple__meta {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: baseline;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #9ba8a2;
}
.scroll-ripple__meta h3 {
  margin: 0;
  font: 500 clamp(22px, 3vw, 34px)/1 "DM Sans", sans-serif;
  letter-spacing: 0;
}
.scroll-ripple__meta span { color: #68736e; text-align: right; }
.scroll-ripple__item:nth-child(3) .scroll-ripple__index { color: #f04b32; }
.scroll-ripple.is-static .scroll-ripple__webgl { display: none; }
.scroll-ripple.is-static .scroll-ripple__item.is-webgl .scroll-ripple__image { opacity: 1; }

@media (max-width: 680px) {
  .scroll-ripple__track { min-height: 2860px; padding: 28px 18px 220px; }
  .scroll-ripple__intro { min-height: 250px; }
  .scroll-ripple__title { font-size: 64px; }
  .scroll-ripple__list { grid-template-columns: 1fr; gap: 150px; }
  .scroll-ripple__item { grid-column: 1; }
  .scroll-ripple__media { aspect-ratio: 4 / 5; }
  .scroll-ripple__meta { grid-template-columns: 32px minmax(0, 1fr); }
  .scroll-ripple__index { grid-column: 1; grid-row: 1; }
  .scroll-ripple__meta h3 { grid-column: 2; grid-row: 1; }
  .scroll-ripple__meta > span:last-child { grid-column: 2; grid-row: 2; text-align: left; }
}
`;

const defaultItems = [
  {
    title: "Glass House",
    year: "2026",
    image: "/images/retro-oval-horizon.webp",
    alt: "Glass towers beneath a cloudy sky",
    layout: "wide",
    ratio: "16 / 9",
  },
  {
    title: "North Facade",
    year: "2026",
    image: "/images/retro-media-orbit.webp",
    alt: "Blue modern architecture against a clear sky",
    layout: "half",
    ratio: "4 / 5",
  },
  {
    title: "Working Table",
    year: "2025",
    image: "/images/retro-cloud-stairway.webp",
    alt: "Design materials arranged on a work table",
    layout: "half",
    ratio: "4 / 5",
  },
  {
    title: "Open Studio",
    year: "2024",
    image: "/images/retro-cosmic-paths.webp",
    alt: "Artist working in a bright studio",
    layout: "wide",
    ratio: "16 / 10",
  },
];

const vertexShader = `
  uniform float uTime;
  uniform float uMotion;
  uniform float uFrequency;
  uniform float uDepth;

  varying vec2 vUv;
  varying float vWave;

  void main() {
    vUv = uv;

    vec3 displaced = position;
    vec3 world = (modelMatrix * vec4(position, 1.0)).xyz;
    float field = sin(world.y * uFrequency + uTime * 0.8);
    float wave = field * uMotion;

    vWave = wave * 0.1;
    displaced.z += wave * uDepth;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uMotion;
  uniform float uTargetAspect;
  uniform float uSourceAspect;
  uniform float uDistortion;
  uniform float uRgbShift;

  varying vec2 vUv;
  varying float vWave;

  vec2 coverUv(vec2 uv) {
    vec2 result = uv;
    if (uTargetAspect > uSourceAspect) {
      result.y = 0.5 + (uv.y - 0.5) * (uSourceAspect / uTargetAspect);
    } else {
      result.x = 0.5 + (uv.x - 0.5) * (uTargetAspect / uSourceAspect);
    }
    return result;
  }

  void main() {
    float response = uMotion * 0.015;
    vec2 sampleUv = vUv;
    sampleUv.y += sin(sampleUv.x * 10.0) * response * uDistortion;

    float split = response * uRgbShift;
    float red = texture2D(uTexture, coverUv(sampleUv + vec2(split, 0.0))).r;
    float green = texture2D(uTexture, coverUv(sampleUv)).g;
    float blue = texture2D(uTexture, coverUv(sampleUv - vec2(split, 0.0))).b;

    vec3 color = vec3(red, green, blue);
    color += vWave * 0.1 * vec3(0.2, 0.0, 0.3);
    gl_FragColor = vec4(color, 1.0);
  }
`;

function addMediaListener(query, listener) {
  query.addEventListener?.("change", listener);
  if (!query.addEventListener) query.addListener(listener);
}

function removeMediaListener(query, listener) {
  query.removeEventListener?.("change", listener);
  if (!query.removeEventListener) query.removeListener(listener);
}

export default function ScrollRippleReveal({
  items = defaultItems,
  eyebrow = "Material Studies / 01-04",
  title = "Images shaped by movement.",
  depth = 7.5,
  frequency = 0.0055,
  velocityScale = 0.25,
  motionLimit = 5,
  response = 0.09,
  decay = 0.965,
  distortion = 0.05,
  rgbShift = 0.02,
}) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRefs = useRef([]);
  const [ready, setReady] = useState({});
  const [failed, setFailed] = useState({});
  const [staticMode, setStaticMode] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-width: 1024px)");
    const touch = window.matchMedia("(hover: none)");
    const update = () => setStaticMode(reduced.matches || compact.matches || touch.matches);

    update();
    addMediaListener(reduced, update);
    addMediaListener(compact, update);
    addMediaListener(touch, update);

    return () => {
      removeMediaListener(reduced, update);
      removeMediaListener(compact, update);
      removeMediaListener(touch, update);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    setReady({});
    setFailed({});

    if (staticMode || !root || !canvas) return undefined;

    let disposed = false;
    let frame = 0;
    const startedAt = performance.now();
    const motion = { current: 0, target: 0 };
    const meshes = [];
    const content = root.querySelector(".scroll-ripple__track");
    const lenis = new Lenis({
      wrapper: root,
      content,
      lerp: 0.05,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      syncTouch: true,
      syncTouchLerp: 0.05,
    });

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 1, 4000);
    const geometry = new THREE.PlaneGeometry(1, 1, 24, 48);
    const sharedTime = { value: 0 };
    const sharedMotion = { value: 0 };
    const loader = new THREE.TextureLoader();

    function createMesh(item, index) {
      const uniforms = {
        uTexture: { value: null },
        uTime: sharedTime,
        uMotion: sharedMotion,
        uFrequency: { value: frequency },
        uDepth: { value: depth },
        uTargetAspect: { value: 1 },
        uSourceAspect: { value: 1 },
        uDistortion: { value: distortion },
        uRgbShift: { value: rgbShift },
      };
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
      });
      material.toneMapped = false;

      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false;
      mesh.frustumCulled = false;
      mesh.renderOrder = index;
      scene.add(mesh);

      const record = { mesh, material, texture: null, ready: false, index };
      meshes.push(record);

      loader.load(
        item.image,
        (texture) => {
          if (disposed) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          record.texture = texture;
          record.ready = true;
          material.uniforms.uTexture.value = texture;
          const image = texture.image;
          material.uniforms.uSourceAspect.value = (image.naturalWidth || image.width || 1)
            / Math.max(image.naturalHeight || image.height || 1, 1);
          setReady((current) => ({ ...current, [index]: true }));
          setFailed((current) => ({ ...current, [index]: false }));
        },
        undefined,
        () => {
          if (!disposed) setFailed((current) => ({ ...current, [index]: true }));
        },
      );
    }

    items.forEach(createMesh);

    function resize() {
      const width = Math.max(1, root.clientWidth);
      const height = Math.max(1, root.clientHeight);
      const cameraDistance = height / (2 * Math.tan(THREE.MathUtils.degToRad(25)));

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = cameraDistance;
      camera.far = cameraDistance * 4;
      camera.updateProjectionMatrix();
      lenis.resize();
    }

    function handleLenisScroll(event) {
      const velocity = typeof event?.velocity === "number" ? event.velocity : lenis.velocity || 0;
      motion.target = Math.min(motionLimit, Math.abs(velocity * velocityScale));
    }

    function updateMeshes() {
      const rootRect = root.getBoundingClientRect();
      const viewportWidth = root.clientWidth;
      const viewportHeight = root.clientHeight;

      meshes.forEach((record) => {
        const element = mediaRefs.current[record.index];
        if (!record.ready || !element) {
          record.mesh.visible = false;
          return;
        }

        const rect = element.getBoundingClientRect();
        const visible = rect.bottom > rootRect.top - 300
          && rect.top < rootRect.bottom + 300
          && rect.right > rootRect.left
          && rect.left < rootRect.right;

        record.mesh.visible = visible;
        if (!visible) return;

        const centerX = rect.left - rootRect.left + rect.width * 0.5;
        const centerY = rect.top - rootRect.top + rect.height * 0.5;
        record.mesh.position.set(centerX - viewportWidth * 0.5, -(centerY - viewportHeight * 0.5), 0);
        record.mesh.scale.set(rect.width, rect.height, 1);
        record.material.uniforms.uTargetAspect.value = rect.width / Math.max(rect.height, 1);
      });
    }

    function animate(now) {
      lenis.raf(now);

      motion.current += (motion.target - motion.current) * response;
      motion.target *= decay;
      if (Math.abs(motion.current) < 0.0001) motion.current = 0;
      if (Math.abs(motion.target) < 0.0001) motion.target = 0;

      sharedTime.value = (now - startedAt) / 1000;
      sharedMotion.value = motion.current;
      canvas.dataset.motion = motion.current.toFixed(4);
      canvas.style.transform = `translate3d(0, ${root.scrollTop}px, 0)`;

      updateMeshes();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    lenis.on("scroll", handleLenisScroll);
    resize();
    frame = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      lenis.off("scroll", handleLenisScroll);
      lenis.destroy();
      meshes.forEach((record) => {
        scene.remove(record.mesh);
        record.texture?.dispose();
        record.material.dispose();
      });
      geometry.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.style.removeProperty("transform");
      delete canvas.dataset.motion;
    };
  }, [decay, depth, distortion, frequency, items, motionLimit, response, rgbShift, staticMode, velocityScale]);

  return (
    <section
      className={`scroll-ripple ${staticMode ? "is-static" : ""}`}
      ref={rootRef}
      tabIndex={0}
      aria-label="Scrollable image studies"
    >
      <style>{styles}</style>
      <canvas className="scroll-ripple__webgl" ref={canvasRef} aria-hidden="true" />
      <div className="scroll-ripple__track">
        <header className="scroll-ripple__intro">
          <span className="scroll-ripple__eyebrow">{eyebrow}</span>
          <span className="scroll-ripple__year">Archive 2024-2026</span>
          <h2 className="scroll-ripple__title">{title}</h2>
        </header>

        <div className="scroll-ripple__list">
          {items.map((item, index) => (
            <figure
              className={`scroll-ripple__item scroll-ripple__item--${item.layout || "wide"} ${ready[index] && !failed[index] ? "is-webgl" : ""}`}
              key={`${item.image}-${item.title}-${index}`}
            >
              <div
                className="scroll-ripple__media"
                ref={(node) => { mediaRefs.current[index] = node; }}
                style={{ "--media-ratio": item.ratio || "16 / 10" }}
              >
                <img
                  className="scroll-ripple__image"
                  src={item.image}
                  alt={item.alt || ""}
                  onError={() => setFailed((current) => ({ ...current, [index]: true }))}
                />
                {failed[index] && <div className="scroll-ripple__fallback">Media unavailable</div>}
              </div>
              <figcaption className="scroll-ripple__meta">
                <span className="scroll-ripple__index">{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <span>{item.year}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
