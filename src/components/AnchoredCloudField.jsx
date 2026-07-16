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
    linear-gradient(90deg, rgba(7, 43, 104, 0.2), transparent 18%, transparent 82%, rgba(7, 43, 104, 0.19)),
    radial-gradient(ellipse at 50% 10%, rgba(255, 255, 255, 0.12), transparent 32%),
    linear-gradient(180deg, var(--cloud-sky-top) 0%, var(--cloud-sky-middle) 44%, var(--cloud-sky-bottom) 100%);
}
.anchored-cloud-field__canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}
`;

const lerp = (start, end, amount) => start + (end - start) * amount;

function createCloudMaterial(texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uCloud: { value: texture },
      uDepth: { value: new THREE.Vector2(-100, 50) },
      uPlaneSize: { value: 17 },
      uSkyColor: { value: new THREE.Color("#00b3ff") },
      uSkyColorBottom: { value: new THREE.Color("#c7e9ff") },
      uOpacity: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
    vertexShader: `
      uniform vec2 uDepth;
      uniform float uPlaneSize;
      varying vec2 vUv;
      varying float vDepth;
      varying vec2 vFlatUv;
      varying vec2 vViewportUV;

      void main() {
        vUv = uv;
        vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position * uPlaneSize, 1.0);
        vec4 viewPosition = viewMatrix * worldPosition;
        gl_Position = projectionMatrix * viewPosition;
        vec3 ndc = gl_Position.xyz / gl_Position.w;
        vViewportUV = ndc.xy * 0.5 + 0.5;
        float cosR = instanceMatrix[0][0];
        float sinR = instanceMatrix[1][0];
        vec2 centeredUv = uv - 0.5;
        vFlatUv = vec2(
          centeredUv.x * cosR + centeredUv.y * sinR,
          -centeredUv.x * sinR + centeredUv.y * cosR
        ) + 0.5;
        float depth = (worldPosition.z - uDepth.x) / (uDepth.y - uDepth.x);
        vDepth = clamp(depth, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uCloud;
      uniform vec3 uSkyColor;
      uniform vec3 uSkyColorBottom;
      uniform float uOpacity;
      varying vec2 vUv;
      varying float vDepth;
      varying vec2 vFlatUv;
      varying vec2 vViewportUV;

      void main() {
        vec4 tex = texture2D(uCloud, vUv);
        float inverseFade = 1.0 - pow(vDepth, 10.0);
        tex.a *= 1.0 - pow(1.0 - vDepth, 1.5);
        tex.a *= inverseFade;
        vec3 averageSky = (uSkyColor + uSkyColorBottom) / 2.0;
        float skyBrightness = dot(averageSky, vec3(0.2126, 0.7152, 0.0722));
        vec3 cloudColor = mix(
          averageSky,
          tex.rgb * clamp(skyBrightness * 3.0, 0.0, 1.0),
          clamp(skyBrightness * 2.0, 0.0, 1.0)
        );
        vec3 skyColor = mix(uSkyColor, uSkyColorBottom, 1.0 - vViewportUV.y);
        vec3 greyGradient = mix(cloudColor * 0.5, cloudColor, smoothstep(0.2, 0.6, vFlatUv.y));
        vec3 color = mix(
          greyGradient,
          mix(skyColor, cloudColor, 0.1),
          1.0 - smoothstep(0.1, 0.6, vFlatUv.y)
        );
        gl_FragColor = vec4(color, clamp(tex.a * uOpacity, 0.0, 1.0));
      }
    `,
  });
}

export default function AnchoredCloudField({
  speed = 1,
  textureUrl = "/images/air-cloud.png",
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
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 240);
    camera.position.set(0, 0, 50);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      stencil: false,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    let disposed = false;
    let frameId = 0;
    let previousTime = 0;
    let visible = true;
    const cloudTexture = new THREE.TextureLoader().load(textureUrl);
    const cloudGeometry = new THREE.PlaneGeometry(1, 1);
    const cloudMaterial = createCloudMaterial(cloudTexture);
    const cloudInstances = [];
    const cloudMesh = new THREE.InstancedMesh(cloudGeometry, cloudMaterial, 400);
    const cloudDummy = new THREE.Object3D();
    cloudMesh.frustumCulled = false;
    cloudMesh.renderOrder = 3;
    scene.add(cloudMesh);

    const initialCloudSeed = 12358;
    let cloudSeed = initialCloudSeed;
    let cloudPlaneSize = 17;
    const cloudRandom = () => {
      const value = Math.sin(cloudSeed++) * 10000;
      return value - Math.floor(value);
    };

    const placeCloudCluster = (baseX, baseY, baseZ, clusterIndex, scaleFactor) => {
      const radius = cloudPlaneSize * scaleFactor * 0.5;
      for (let itemIndex = 0; itemIndex < 20; itemIndex += 1) {
        const alternating = itemIndex % 2 === 0 ? 1 : -1;
        const offsetX =
          (1 - Math.pow(1 - itemIndex / 20, 3)) *
          radius *
          Math.cos(Math.PI / 2 + ((Math.PI * 2) / 20) * alternating * itemIndex);
        let scale =
          lerp(0.5, 1.25, 1 - Math.pow(1 - Math.abs(offsetX) / Math.max(radius, 0.001), 2)) +
          (cloudRandom() - 0.5) * 0.5;
        scale *= 0.5;
        const rotation = cloudRandom() * Math.PI * 2;
        const direction = cloudRandom() < 0.5 ? 1 : -1;
        const cloudSpeed = 0.5 + cloudRandom() * 0.5;
        cloudInstances.push({
          x: baseX + offsetX,
          y: baseY + (scale * cloudPlaneSize) / 2 - (cloudRandom() - 0.5),
          z: baseZ + (cloudRandom() - 0.5),
          scale,
          rotation,
          direction,
          speed: cloudSpeed,
          clusterIndex,
        });
      }
    };

    const writeMatrices = (delta = 0) => {
      cloudInstances.sort((first, second) => first.z - second.z);
      cloudInstances.forEach((cloud, index) => {
        if (!reducedMotion) {
          cloud.rotation += delta * cloud.speed * cloud.direction * 0.05 * speed;
        }
        const pulse = cloud.scale + Math.sin(cloud.rotation * 10) * 0.1;
        cloudDummy.position.set(cloud.x, cloud.y, cloud.z);
        cloudDummy.scale.set(pulse, pulse, pulse);
        cloudDummy.rotation.set(0, 0, cloud.rotation);
        cloudDummy.updateMatrix();
        cloudMesh.setMatrixAt(index, cloudDummy.matrix);
      });
      cloudMesh.count = cloudInstances.length;
      cloudMesh.instanceMatrix.needsUpdate = true;
    };

    const initializeClouds = (width, height) => {
      cloudSeed = initialCloudSeed;
      cloudInstances.length = 0;
      const viewportWorldHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const viewportWorldWidth = viewportWorldHeight * camera.aspect;
      cloudPlaneSize = Math.max((viewportWorldWidth / 32) * 12, 17);
      cloudMaterial.uniforms.uPlaneSize.value = cloudPlaneSize;

      // Same normalized document slice as Air's 1280x720 Story scene at scrollY 7400.
      const sourcePageHeight = height * (11229 / 720);
      const sourceScrollY = height * (7400 / 720);
      const documentWorldHeight =
        (viewportWorldHeight / Math.max(height, 1)) * (sourcePageHeight - height * 1.5);
      const rowStep = documentWorldHeight / 20;
      const sideParity = 1;

      for (let row = 0; row < 20; row += 1) {
        const side = row % 2 === sideParity ? 1 : -1;
        const z = row > 17 ? 0 : -((cloudRandom() - 0.5) * 100);
        const depthScale = lerp(1, 2, -z / 100);
        placeCloudCluster(
          (viewportWorldWidth / 2) * side * depthScale,
          -viewportWorldHeight - rowStep * row - (cloudRandom() - 0.5) * (rowStep / 2),
          z,
          row,
          1,
        );
      }

      cloudMesh.position.y = (viewportWorldHeight / Math.max(height, 1)) * sourceScrollY;
      writeMatrices(0);
    };

    const resize = () => {
      const bounds = root.getBoundingClientRect();
      const width = Math.max(Math.round(bounds.width), 1);
      const height = Math.max(Math.round(bounds.height), 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      initializeClouds(width, height);
      renderer.render(scene, camera);
    };

    const renderFrame = (time = 0) => {
      const delta = Math.min(Math.max((time - previousTime) * 0.001, 0), 0.05);
      previousTime = time;
      writeMatrices(delta);
      renderer.render(scene, camera);
    };

    const animate = (time) => {
      frameId = 0;
      if (disposed || !visible) return;
      renderFrame(time);
      frameId = window.requestAnimationFrame(animate);
    };

    const start = () => {
      if (reducedMotion) {
        renderFrame(0);
        return;
      }
      previousTime = performance.now();
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
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      cloudTexture.dispose();
      renderer.dispose();
    };
  }, [speed, textureUrl]);

  return (
    <section
      ref={rootRef}
      className="anchored-cloud-field"
      role="img"
      aria-label="Clouds anchored around a blue sky while their layers slowly roll"
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
