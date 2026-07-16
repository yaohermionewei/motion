import { useEffect, useRef } from "react";
import * as THREE from "three";

const styles = `
.anchored-cloud-field {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 360px;
  overflow: hidden;
  isolation: isolate;
  background:
    radial-gradient(circle at 50% 14%, rgba(255,255,255,.22), transparent 26%),
    linear-gradient(180deg, var(--cloud-sky-top), var(--cloud-sky-middle) 46%, var(--cloud-sky-bottom));
}
.anchored-cloud-field::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(7,43,104,.18), transparent 18%, transparent 82%, rgba(7,43,104,.16)),
    radial-gradient(ellipse at 50% 112%, rgba(255,255,255,.28), transparent 42%);
  content: "";
}
.anchored-cloud-field__canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}
.anchored-cloud-field.is-fallback::before {
  position: absolute;
  inset: -12%;
  background:
    radial-gradient(ellipse at 0% 25%, rgba(255,255,255,.88) 0 8%, transparent 22%),
    radial-gradient(ellipse at 100% 40%, rgba(239,249,255,.9) 0 10%, transparent 24%),
    radial-gradient(ellipse at 18% 104%, rgba(222,242,255,.82) 0 12%, transparent 28%),
    radial-gradient(ellipse at 82% -4%, rgba(255,255,255,.76) 0 9%, transparent 24%);
  content: "";
}
`;

function createSeededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function createProceduralCloudTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 160;
  const context = canvas.getContext("2d");
  const random = createSeededRandom(4172);

  context.clearRect(0, 0, canvas.width, canvas.height);
  const puffs = [
    [42, 96, 48],
    [80, 72, 58],
    [124, 82, 68],
    [170, 66, 56],
    [210, 94, 46],
    [112, 116, 58],
    [162, 112, 52],
  ];

  puffs.forEach(([x, y, radius], index) => {
    const gradient = context.createRadialGradient(
      x - radius * 0.18,
      y - radius * 0.24,
      radius * 0.05,
      x,
      y,
      radius,
    );
    const brightness = 246 - (index % 3) * 4;
    gradient.addColorStop(0, `rgba(255,255,255,${0.96 - random() * 0.05})`);
    gradient.addColorStop(0.52, `rgba(${brightness},250,255,.88)`);
    gradient.addColorStop(0.78, "rgba(210,235,252,.48)");
    gradient.addColorStop(1, "rgba(190,225,247,0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  });

  context.globalCompositeOperation = "source-in";
  const shade = context.createLinearGradient(0, 24, 0, 150);
  shade.addColorStop(0, "#ffffff");
  shade.addColorStop(0.58, "#f3fbff");
  shade.addColorStop(1, "#b8dff7");
  context.fillStyle = shade;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalCompositeOperation = "source-over";

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

function createCloudLayout(count, aspect) {
  const random = createSeededRandom(9301);
  const mobileScale = Math.min(1, 0.68 + aspect * 0.22);

  return Array.from({ length: count }, (_, index) => {
    const edge = index % 4;
    const size = (0.3 + random() * 0.34) * mobileScale;
    const width = size * (1.75 + random() * 0.65);
    const height = size * (0.78 + random() * 0.22);
    let x;
    let y;

    if (edge === 0 || edge === 1) {
      x = (edge === 0 ? -1 : 1) * (aspect + width * (0.1 + random() * 0.22));
      y = -0.92 + random() * 1.84;
    } else {
      x = -aspect + random() * aspect * 2;
      y = (edge === 2 ? 1 : -1) * (1 + height * (0.04 + random() * 0.18));
    }

    return {
      x,
      y,
      z: random() * 0.6,
      width,
      height,
      rotation: (random() - 0.5) * 0.72,
      spin: (0.025 + random() * 0.045) * (random() > 0.5 ? 1 : -1),
      phase: random() * Math.PI * 2,
      drift: 0.018 + random() * 0.026,
      pulse: 0.018 + random() * 0.025,
    };
  });
}

export default function AnchoredCloudField({
  speed = 1,
  density = 42,
  skyTop = "#148cf6",
  skyMiddle = "#34a8fb",
  skyBottom = "#78c8f6",
}) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 4;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        stencil: false,
      });
    } catch {
      root.classList.add("is-fallback");
      root.dataset.motionState = "fallback";
      return () => root.classList.remove("is-fallback");
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const texture = createProceduralCloudTexture();
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.92,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    const maxClouds = Math.max(12, Math.min(Math.round(density), 80));
    const mesh = new THREE.InstancedMesh(geometry, material, maxClouds);
    const dummy = new THREE.Object3D();
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    scene.add(mesh);

    let clouds = [];
    let frameId = 0;
    let visible = true;
    let disposed = false;

    const writeMatrices = (elapsed = 0) => {
      clouds.forEach((cloud, index) => {
        const driftX = Math.sin(elapsed * 0.34 + cloud.phase) * cloud.drift;
        const driftY = Math.cos(elapsed * 0.27 + cloud.phase) * cloud.drift * 0.55;
        const pulse = 1 + Math.sin(elapsed * 0.46 + cloud.phase) * cloud.pulse;
        dummy.position.set(cloud.x + driftX, cloud.y + driftY, cloud.z);
        dummy.scale.set(cloud.width * pulse, cloud.height * pulse, 1);
        dummy.rotation.set(0, 0, cloud.rotation + elapsed * cloud.spin * speed);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
      });
      mesh.count = clouds.length;
      mesh.instanceMatrix.needsUpdate = true;
    };

    const resize = () => {
      const bounds = root.getBoundingClientRect();
      const width = Math.max(Math.round(bounds.width), 1);
      const height = Math.max(Math.round(bounds.height), 1);
      const aspect = width / height;
      camera.left = -aspect;
      camera.right = aspect;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      clouds = createCloudLayout(maxClouds, aspect);
      writeMatrices(0);
      renderer.render(scene, camera);
    };

    const animate = (time) => {
      frameId = 0;
      if (disposed || !visible) return;
      writeMatrices(time * 0.001);
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    const start = () => {
      if (reducedMotion) {
        root.dataset.motionState = "reduced";
        writeMatrices(0);
        renderer.render(scene, camera);
        return;
      }
      root.dataset.motionState = "running";
      if (!frameId && visible && !disposed) frameId = window.requestAnimationFrame(animate);
    };

    const stop = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !document.hidden;
      if (visible) start();
      else stop();
    });
    visibilityObserver.observe(root);

    const handleVisibility = () => {
      const bounds = root.getBoundingClientRect();
      visible = !document.hidden && bounds.bottom > 0 && bounds.top < window.innerHeight;
      if (visible) start();
      else stop();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    resize();
    start();

    return () => {
      disposed = true;
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      scene.clear();
      mesh.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [density, speed]);

  return (
    <section
      ref={rootRef}
      className="anchored-cloud-field"
      role="img"
      aria-label="A field of softly rolling clouds anchored around an open blue sky"
      style={{
        "--cloud-sky-top": skyTop,
        "--cloud-sky-middle": skyMiddle,
        "--cloud-sky-bottom": skyBottom,
      }}
    >
      <style>{styles}</style>
      <canvas ref={canvasRef} className="anchored-cloud-field__canvas" aria-hidden="true" />
    </section>
  );
}
