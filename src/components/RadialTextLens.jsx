import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const styles = `
@font-face {
  font-family: "Noto Sans Radial Lens";
  src: url("/fonts/noto-sans-latin-400-normal.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
.radial-text-lens {
  --lens-background: #050505;
  --lens-text: #b8b8b4;
  --lens-accent: #f4f3ee;
  position: relative;
  height: 100%;
  min-height: 340px;
  overflow: hidden;
  isolation: isolate;
  background: var(--lens-background);
  color: var(--lens-text);
}
.radial-text-lens__frame {
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: min(400px, 100%);
  overflow: hidden;
  cursor: none;
  transform: translateY(-50%);
}
.radial-text-lens__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
.radial-text-lens__cursor {
  position: absolute;
  z-index: 3;
  top: 0;
  left: 0;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--lens-accent) 72%, transparent);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  transform: translate3d(-80px, -80px, 0);
  transition: opacity 160ms ease;
}
.radial-text-lens__cursor::after {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--lens-accent);
  box-shadow: 0 0 8px var(--lens-accent);
  content: "";
}
.radial-text-lens.is-hovered .radial-text-lens__cursor { opacity: 1; }
.radial-text-lens__fallback {
  position: absolute;
  inset: 0;
  display: none;
  overflow: hidden;
  place-items: center;
  background: var(--lens-background);
}
.radial-text-lens__fallback-text {
  position: absolute;
  left: 50%;
  top: 50%;
  width: max-content;
  transform: translate(-50%, -50%);
  color: var(--lens-text);
  font: 400 clamp(72px, 12vw, 164px)/.8 "Noto Sans Radial Lens", Arial, sans-serif;
  letter-spacing: -0.07em;
  white-space: nowrap;
  opacity: .62;
  filter: blur(1.5px);
}
.radial-text-lens__fallback-ring {
  position: relative;
  width: min(38vh, 32%);
  aspect-ratio: 1;
  border: 1px solid color-mix(in srgb, var(--lens-accent) 34%, transparent);
  border-radius: 50%;
  box-shadow: 18px 15px 24px -18px var(--lens-accent);
}
.radial-text-lens.is-fallback .radial-text-lens__canvas { display: none; }
.radial-text-lens.is-fallback .radial-text-lens__fallback { display: grid; }
.radial-text-lens__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
@media (hover: none) {
  .radial-text-lens__frame { cursor: default; }
  .radial-text-lens__cursor { display: none; }
}
@media (max-width: 680px) {
  .radial-text-lens__frame {
    left: 50%;
    width: 960px;
    max-width: none;
    transform: translate(-50%, -50%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .radial-text-lens__cursor { display: none; transition: none; }
}
`;

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const sourceFragmentShader = `
  precision highp float;

  varying vec2 vUv;
  uniform sampler2D uText;
  uniform vec2 uCssResolution;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uRepeat;
  uniform vec3 uBackground;
  uniform vec3 uTextColor;

  float signalHash(vec2 point) {
    return fract(sin(dot(point, vec2(91.73, 317.19))) * 43719.371);
  }

  float signalNoise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    vec2 curve = local * local * (3.0 - 2.0 * local);
    float a = signalHash(cell);
    float b = signalHash(cell + vec2(1.0, 0.0));
    float c = signalHash(cell + vec2(0.0, 1.0));
    float d = signalHash(cell + vec2(1.0, 1.0));
    return mix(mix(a, b, curve.x), mix(c, d, curve.x), curve.y);
  }

  float signalFbm(vec2 point) {
    float value = 0.0;
    float weight = 0.56;
    mat2 turn = mat2(0.84, -0.54, 0.54, 0.84);
    for (int octave = 0; octave < 4; octave++) {
      value += signalNoise(point) * weight;
      point = turn * point * 2.07 + 7.31;
      weight *= 0.48;
    }
    return value;
  }

  float glyph(vec2 samplePoint) {
    vec2 textUv = vec2(fract(samplePoint.x), clamp(samplePoint.y, 0.0, 1.0));
    return texture2D(uText, textUv).a;
  }

  void main() {
    vec2 point = vUv;
    float phase = uTime * uSpeed * uRepeat / max(uCssResolution.x, 1.0);
    point.x = point.x * uRepeat - phase + (point.y - 0.5) * 0.052;
    point.y = 0.5 + (point.y - 0.5) * 1.08;

    float broad = signalFbm(vec2(point.x * 1.46 + uTime * 0.055, point.y * 3.4 - uTime * 0.036));
    float detail = signalNoise(vec2(point.x * 5.7 - uTime * 0.11, point.y * 7.1 + uTime * 0.074));
    point.x += (broad - 0.5) * 0.027 + sin(point.y * 17.0 + uTime * 0.31) * 0.0035;
    point.y += (broad - 0.5) * 0.046 + (detail - 0.5) * 0.011;
    point.y += sin(point.x * 8.4 - uTime * 0.42) * 0.011;

    float primary = glyph(point);
    float softTrail = glyph(point + vec2(0.0055, 0.0025)) * 0.34;
    softTrail += glyph(point - vec2(0.008, 0.0035)) * 0.21;
    float verticalGhost = glyph(point + vec2(0.001, 0.010)) * 0.16;
    float coverage = clamp(primary + softTrail + verticalGhost, 0.0, 1.0);
    vec3 color = mix(uBackground, uTextColor, coverage * 0.58);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const warpFragmentShader = `
  precision highp float;

  varying vec2 vUv;
  uniform sampler2D uInput;
  uniform vec2 uCssResolution;
  uniform vec2 uShatterPointer;
  uniform vec2 uLiquifyPointer;
  uniform float uPointerStrength;
  uniform float uTime;
  uniform float uShatterRadius;
  uniform float uInfluenceRadius;
  uniform float uEdgeDisplacementPx;

  float fieldHash(vec2 point) {
    point = fract(point * vec2(0.1031, 0.1137));
    point += dot(point, point.yx + 23.17);
    return fract((point.x + point.y) * point.x);
  }

  float fieldNoise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    vec2 curve = local * local * (3.0 - 2.0 * local);
    return mix(
      mix(fieldHash(cell), fieldHash(cell + vec2(1.0, 0.0)), curve.x),
      mix(fieldHash(cell + vec2(0.0, 1.0)), fieldHash(cell + vec2(1.0)), curve.x),
      curve.y
    );
  }

  float fieldFbm(vec2 point) {
    float value = 0.0;
    float weight = 0.54;
    mat2 turn = mat2(0.78, -0.63, 0.63, 0.78);
    for (int octave = 0; octave < 4; octave++) {
      value += fieldNoise(point) * weight;
      point = turn * point * 2.12 + 11.2;
      weight *= 0.47;
    }
    return value;
  }

  void main() {
    float aspect = uCssResolution.x / max(uCssResolution.y, 1.0);
    vec2 screenRadial = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);
    vec2 radial = screenRadial;
    float radius = length(radial);
    vec2 direction = radial / max(radius, 0.0001);

    float centerCompression = exp(-radius / 0.09);
    float radialScale = 1.0 + centerCompression * 3.0;
    radial *= radialScale;

    float edgeEnvelope = exp(-pow((radius - 0.285) / 0.31, 2.0));
    float edgeWave = sin(radius * 42.0 - uTime * 0.66);
    float displacement = uEdgeDisplacementPx / max(uCssResolution.y, 1.0);
    radial += direction * edgeWave * edgeEnvelope * displacement;

    float ambientA = fieldFbm(radial * 2.4 + vec2(uTime * 0.035, -uTime * 0.026));
    float ambientB = fieldFbm(radial.yx * 4.1 + vec2(-uTime * 0.051, uTime * 0.043));
    radial += vec2(ambientA - 0.5, ambientB - 0.5) * vec2(0.027, 0.021);

    vec2 shatterUv = vec2(0.5, 0.4) + (uShatterPointer - 0.5) * 0.8;
    vec2 shatterPoint = vec2((shatterUv.x - 0.5) * aspect, shatterUv.y - 0.5);
    vec2 shatterDelta = screenRadial - shatterPoint;
    float shatterDistance = length(shatterDelta);
    float shatterMask = (
      1.0 - smoothstep(0.025, uShatterRadius, shatterDistance)
    ) * uPointerStrength;
    vec2 cell = floor(shatterDelta * 19.0);
    vec2 cellJitter = vec2(fieldHash(cell + 3.7), fieldHash(cell.yx + 19.2)) - 0.5;
    float pulse = sin(shatterDistance * 54.0 - uTime * 3.1);
    vec2 shatterDirection = shatterDelta / max(shatterDistance, 0.002);
    radial += cellJitter * shatterMask * 0.064;
    radial += shatterDirection * pulse * shatterMask * 0.012;

    vec2 liquifyUv = vec2(0.5) + (uLiquifyPointer - 0.5) * 0.2;
    vec2 liquifyPoint = vec2((liquifyUv.x - 0.5) * aspect, liquifyUv.y - 0.5);
    vec2 liquifyDelta = screenRadial - liquifyPoint;
    float liquifyDistance = length(liquifyDelta);
    float liquifyMask = (1.0 - smoothstep(0.1, 1.15, liquifyDistance)) * uPointerStrength;
    vec2 liquifyFlow = vec2(
      sin(liquifyDelta.y * 31.0 + uTime * 0.63),
      cos(liquifyDelta.x * 27.0 - uTime * 0.51)
    );
    radial += liquifyFlow * liquifyMask * 0.0032;

    vec2 sampleUv = vec2(radial.x / aspect, radial.y) + 0.5;
    sampleUv = clamp(sampleUv, vec2(0.001), vec2(0.999));
    gl_FragColor = texture2D(uInput, sampleUv);
  }
`;

const compositeFragmentShader = `
  precision highp float;

  varying vec2 vUv;
  uniform sampler2D uInput;
  uniform vec2 uResolution;
  uniform vec2 uCssResolution;
  uniform vec2 uShatterPointer;
  uniform vec2 uChromaticPointer;
  uniform vec2 uBeamPointer;
  uniform vec2 uGodRayPointer;
  uniform float uPointerStrength;
  uniform float uTime;
  uniform float uBeamTrackGain;
  uniform float uShatterRadius;
  uniform float uHighlightAngularVelocity;
  uniform vec3 uBackground;
  uniform vec3 uAccent;

  float grainHash(vec2 point) {
    return fract(sin(dot(point, vec2(12.917, 71.443))) * 9531.771);
  }

  void main() {
    float aspect = uCssResolution.x / max(uCssResolution.y, 1.0);
    vec2 lensRadial = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);
    float radius = length(lensRadial);

    vec2 shatterUv = vec2(0.5, 0.4) + (uShatterPointer - 0.5) * 0.8;
    vec2 shatterPoint = vec2((shatterUv.x - 0.5) * aspect, shatterUv.y - 0.5);
    float shatterDistance = length(lensRadial - shatterPoint);
    float shatterMask = (
      1.0 - smoothstep(0.025, uShatterRadius, shatterDistance)
    ) * uPointerStrength;
    vec2 chromaticUv = vec2(0.5) + (uChromaticPointer - 0.5) * 0.25;
    vec2 chromaticPoint = vec2((chromaticUv.x - 0.5) * aspect, chromaticUv.y - 0.5);
    float chromaticDistance = length(lensRadial - chromaticPoint);
    float chromaticMask = (1.0 - smoothstep(0.18, 1.2, chromaticDistance)) * uPointerStrength;
    float edgeDistance = abs(radius - 0.285);
    float lensBlur = 1.7 + exp(-edgeDistance * 6.0) * 1.8 + shatterMask * 1.15 + chromaticMask * 0.16;
    vec2 texel = 1.0 / max(uResolution, vec2(1.0));
    vec2 blurStep = vec2(texel.x * lensBlur, texel.y * lensBlur * 0.24);

    vec3 blurred = texture2D(uInput, vUv).rgb * 0.30;
    blurred += texture2D(uInput, vUv + blurStep).rgb * 0.20;
    blurred += texture2D(uInput, vUv - blurStep).rgb * 0.20;
    blurred += texture2D(uInput, vUv + blurStep * 2.4).rgb * 0.15;
    blurred += texture2D(uInput, vUv - blurStep * 2.4).rgb * 0.15;

    float chroma = (
      0.55 + exp(-edgeDistance * 12.0) * 1.75 + shatterMask * 1.05 + chromaticMask * 0.58
    ) * texel.x;
    float red = texture2D(uInput, vUv + vec2(chroma, 0.0)).r;
    float green = blurred.g;
    float blue = texture2D(uInput, vUv - vec2(chroma, 0.0)).b;
    vec3 color = mix(blurred, vec3(red, green, blue), 0.68);

    vec2 rayOriginUv = vec2(0.5, 0.4) + (uGodRayPointer - 0.5) * 0.61;
    vec2 rayStep = (rayOriginUv - vUv) * 0.024;
    vec2 rayUv = vUv;
    vec3 rays = vec3(0.0);
    float rayWeight = 0.76;
    for (int rayIndex = 0; rayIndex < 8; rayIndex++) {
      rayUv += rayStep;
      vec3 raySample = texture2D(uInput, clamp(rayUv, vec2(0.001), vec2(0.999))).rgb;
      float rayLuma = dot(raySample, vec3(0.299, 0.587, 0.114));
      rays += raySample * smoothstep(0.24, 0.62, rayLuma) * rayWeight;
      rayWeight *= 0.82;
    }
    color += rays * (0.012 + uPointerStrength * 0.006);

    vec2 ringCenterUv = vec2(0.5) + (uBeamPointer - 0.5) * uBeamTrackGain;
    vec2 ringRadial = vec2(
      (vUv.x - ringCenterUv.x) * aspect,
      vUv.y - ringCenterUv.y
    );
    float ringRadius = length(ringRadial);
    vec2 ringNormal = ringRadial / max(ringRadius, 0.0001);
    float ringEdgeDistance = abs(ringRadius - 0.285);
    float lightAngle = -0.58 + uTime * uHighlightAngularVelocity;
    vec2 lightDirection = vec2(cos(lightAngle), sin(lightAngle));
    float litSide = max(dot(ringNormal, lightDirection), 0.0);
    float hairline = exp(-ringEdgeDistance * 430.0);
    float halo = exp(-ringEdgeDistance * 55.0);
    float bloom = exp(-ringEdgeDistance * 17.0);
    float ring = hairline * (0.12 + pow(litSide, 3.7) * 2.2);
    ring += halo * (0.035 + pow(litSide, 3.0) * 0.72);
    ring += bloom * pow(litSide, 4.0) * 0.13;

    vec2 brightPoint = lightDirection * 0.285;
    vec2 fromLight = ringRadial - brightPoint;
    float outward = smoothstep(-0.03, 0.32, dot(fromLight, lightDirection));
    float beamWidth = abs(fromLight.x * lightDirection.y - fromLight.y * lightDirection.x);
    float beam = exp(-beamWidth * 26.0) * exp(-length(fromLight) * 2.8) * outward;
    beam *= 0.035 + uPointerStrength * 0.028;
    color += uAccent * (ring + beam);

    float innerShade = smoothstep(0.285, 0.245, radius);
    color = max(color - uBackground * innerShade * 0.35, vec3(0.0));
    float scanPhase = sin(gl_FragCoord.y * 3.14159265 * 0.49 + uTime * 4.0);
    float scanline = mix(0.18, 1.0, smoothstep(-0.38, 0.62, scanPhase));
    float flicker = 0.95 + sin(uTime * 18.7 + gl_FragCoord.x * 0.013) * 0.05;
    color *= scanline * flicker;

    vec2 vignetteUv = vUv * (1.0 - vUv.yx);
    float vignette = pow(clamp(vignetteUv.x * vignetteUv.y * 18.0, 0.0, 1.0), 0.22);
    color *= mix(0.62, 1.0, vignette);
    float grain = grainHash(gl_FragCoord.xy + floor(uTime * 23.0));
    color += (grain - 0.5) * 0.0045;
    color = max(color, uBackground * 0.72);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function addMediaListener(query, listener) {
  query.addEventListener?.("change", listener);
  if (!query.addEventListener) query.addListener(listener);
}

function removeMediaListener(query, listener) {
  query.removeEventListener?.("change", listener);
  if (!query.removeEventListener) query.removeListener(listener);
}

function createTextTexture(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable for the text texture.");

  let fontSize = 248;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.letterSpacing = "-0.07em";
  do {
    context.font = `400 ${fontSize}px "Noto Sans Radial Lens", Arial, sans-serif`;
    if (context.measureText(text).width <= canvas.width * 0.86) break;
    fontSize -= 8;
  } while (fontSize > 120);

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.shadowColor = "rgba(255, 255, 255, 0.38)";
  context.shadowBlur = 7;
  context.fillText(text, canvas.width / 2, canvas.height / 2 + 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function createRenderTarget(width, height) {
  return new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

export default function RadialTextLens({
  text = "SIGNAL FIELD",
  speed = 69,
  backgroundColor = "#050505",
  textColor = "#b8b8b4",
  accentColor = "#f4f3ee",
  interactive = true,
  ariaLabel = "Radially distorted moving text",
}) {
  const rootRef = useRef(null);
  const frameRef = useRef(null);
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const safeText = String(text || "SIGNAL FIELD").trim() || "SIGNAL FIELD";

  useEffect(() => {
    const root = rootRef.current;
    const sceneFrame = frameRef.current;
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    if (!root || !sceneFrame || !canvas || !cursor) return undefined;

    let disposed = false;
    let frame = 0;
    let renderer;
    let targetA;
    let targetB;
    let geometry;
    let renderSceneGraph;
    let renderCamera;
    let renderQuad;
    let textTexture;
    let sourceMaterial;
    let warpMaterial;
    let compositeMaterial;
    let resizeObserver;
    let intersectionObserver;
    let cssWidth = 1;
    let cssHeight = 1;
    let elapsed = 0;
    let lastNow = 0;
    let inViewport = true;
    let documentVisible = !document.hidden;
    let reducedMotion = false;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)");
    const pointerTarget = new THREE.Vector2(0.5, 0.5);
    const beamPointer = new THREE.Vector2(0.5, 0.5);
    const godRayPointer = new THREE.Vector2(0.5, 0.5);
    const shatterPointer = new THREE.Vector2(0.5, 0.5);
    const liquifyPointer = new THREE.Vector2(0.5, 0.5);
    const chromaticPointer = new THREE.Vector2(0.5, 0.5);
    let pointerStrength = 0;
    let pointerStrengthTarget = 0;

    function showFallback(error) {
      if (disposed) return;
      cancelAnimationFrame(frame);
      frame = 0;
      root.dataset.sceneState = "fallback";
      setStatus("fallback");
      console.error("Radial Text Lens initialization failed.", error);
    }

    function positionCursor(event) {
      const rect = sceneFrame.getBoundingClientRect();
      cursor.style.transform = `translate3d(${event.clientX - rect.left - 19}px, ${
        event.clientY - rect.top - 19
      }px, 0)`;
    }

    function updatePointer(event) {
      if (!interactive || reducedMotion || !hoverCapable.matches) return;
      const rect = sceneFrame.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nextX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const nextY = clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1);
      pointerTarget.set(nextX, nextY);
      positionCursor(event);
    }

    function enterPointer(event) {
      if (!interactive || reducedMotion || !hoverCapable.matches) return;
      pointerStrengthTarget = 1;
      root.classList.add("is-hovered");
      updatePointer(event);
    }

    function leavePointer() {
      pointerStrengthTarget = 0;
      pointerTarget.set(0.5, 0.5);
      root.classList.remove("is-hovered");
    }

    function renderScene() {
      if (!renderer || !targetA || !targetB) return;
      renderQuad.material = sourceMaterial;
      renderer.setRenderTarget(targetA);
      renderer.render(renderSceneGraph, renderCamera);
      renderQuad.material = warpMaterial;
      renderer.setRenderTarget(targetB);
      renderer.render(renderSceneGraph, renderCamera);
      renderQuad.material = compositeMaterial;
      renderer.setRenderTarget(null);
      renderer.render(renderSceneGraph, renderCamera);
    }

    function updateUniforms() {
      sourceMaterial.uniforms.uTime.value = elapsed;
      warpMaterial.uniforms.uTime.value = elapsed;
      warpMaterial.uniforms.uShatterPointer.value.copy(shatterPointer);
      warpMaterial.uniforms.uLiquifyPointer.value.copy(liquifyPointer);
      warpMaterial.uniforms.uPointerStrength.value = pointerStrength;
      compositeMaterial.uniforms.uTime.value = elapsed;
      compositeMaterial.uniforms.uShatterPointer.value.copy(shatterPointer);
      compositeMaterial.uniforms.uChromaticPointer.value.copy(chromaticPointer);
      compositeMaterial.uniforms.uBeamPointer.value.copy(beamPointer);
      compositeMaterial.uniforms.uGodRayPointer.value.copy(godRayPointer);
      compositeMaterial.uniforms.uPointerStrength.value = pointerStrength;
      root.dataset.flowOffset = (elapsed * sourceMaterial.uniforms.uSpeed.value).toFixed(3);
      root.dataset.pointerStrength = pointerStrength.toFixed(4);
      root.dataset.beamOffsetX = (
        (beamPointer.x - 0.5) * compositeMaterial.uniforms.uBeamTrackGain.value * cssWidth
      ).toFixed(3);
      root.dataset.beamOffsetY = (
        (beamPointer.y - 0.5) * compositeMaterial.uniforms.uBeamTrackGain.value * cssHeight
      ).toFixed(3);
      root.dataset.highlightAngle = (
        elapsed * compositeMaterial.uniforms.uHighlightAngularVelocity.value * 180 / Math.PI
      ).toFixed(3);
    }

    function shouldAnimate() {
      return !disposed && !reducedMotion && inViewport && documentVisible;
    }

    function animate(now) {
      frame = 0;
      if (!shouldAnimate()) {
        lastNow = 0;
        return;
      }

      if (lastNow) elapsed += Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;
      beamPointer.lerp(pointerTarget, 0.42);
      chromaticPointer.lerp(pointerTarget, 0.42);
      shatterPointer.lerp(pointerTarget, 0.30);
      godRayPointer.lerp(pointerTarget, 0.055);
      liquifyPointer.lerp(pointerTarget, 0.032);
      const strengthResponse = pointerStrengthTarget > pointerStrength ? 0.22 : 0.055;
      pointerStrength += (pointerStrengthTarget - pointerStrength) * strengthResponse;
      updateUniforms();
      renderScene();
      frame = requestAnimationFrame(animate);
    }

    function startAnimation() {
      if (!shouldAnimate() || frame) return;
      lastNow = 0;
      frame = requestAnimationFrame(animate);
    }

    function pauseAnimation() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastNow = 0;
    }

    function resize() {
      if (!renderer) return;
      const rect = sceneFrame.getBoundingClientRect();
      cssWidth = Math.max(1, rect.width);
      cssHeight = Math.max(1, rect.height);
      const bufferWidth = Math.max(1, Math.round(cssWidth * 0.75));
      const bufferHeight = Math.max(1, Math.round(cssHeight * 0.75));
      renderer.setSize(bufferWidth, bufferHeight, false);
      targetA.setSize(bufferWidth, bufferHeight);
      targetB.setSize(bufferWidth, bufferHeight);
      sourceMaterial.uniforms.uCssResolution.value.set(cssWidth, cssHeight);
      warpMaterial.uniforms.uCssResolution.value.set(cssWidth, cssHeight);
      compositeMaterial.uniforms.uCssResolution.value.set(cssWidth, cssHeight);
      compositeMaterial.uniforms.uResolution.value.set(bufferWidth, bufferHeight);
      updateUniforms();
      renderScene();
    }

    function handleVisibility() {
      documentVisible = !document.hidden;
      if (documentVisible) startAnimation();
      else pauseAnimation();
    }

    function handleMotionPreference() {
      reducedMotion = reduced.matches;
      if (reducedMotion) {
        elapsed = 0;
        pointerTarget.set(0.5, 0.5);
        beamPointer.copy(pointerTarget);
        godRayPointer.copy(pointerTarget);
        shatterPointer.copy(pointerTarget);
        liquifyPointer.copy(pointerTarget);
        chromaticPointer.copy(pointerTarget);
        pointerStrength = 0;
        pointerStrengthTarget = 0;
        root.classList.remove("is-hovered");
        pauseAnimation();
        updateUniforms();
        renderScene();
      } else {
        startAnimation();
      }
    }

    function handleContextLost(event) {
      event.preventDefault();
      showFallback(new Error("WebGL context was lost."));
    }

    sceneFrame.addEventListener("pointerenter", enterPointer);
    sceneFrame.addEventListener("pointermove", updatePointer);
    sceneFrame.addEventListener("pointerleave", leavePointer);
    document.addEventListener("visibilitychange", handleVisibility);
    canvas.addEventListener("webglcontextlost", handleContextLost);
    addMediaListener(reduced, handleMotionPreference);

    async function initialize() {
      try {
        await document.fonts?.load(`400 200px "Noto Sans Radial Lens"`, safeText);
        if (disposed) return;

        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: false,
          antialias: false,
          depth: false,
          powerPreference: "high-performance",
        });
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.NoToneMapping;
        renderer.setPixelRatio(1);
        renderer.setClearColor(new THREE.Color(backgroundColor), 1);

        geometry = new THREE.PlaneGeometry(2, 2);
        renderSceneGraph = new THREE.Scene();
        renderCamera = new THREE.Camera();
        renderQuad = new THREE.Mesh(geometry, null);
        renderSceneGraph.add(renderQuad);
        textTexture = createTextTexture(safeText);
        const background = new THREE.Color(backgroundColor);
        const foreground = new THREE.Color(textColor);
        const accent = new THREE.Color(accentColor);
        const cssResolution = new THREE.Vector2(1, 1);
        const bufferResolution = new THREE.Vector2(1, 1);

        sourceMaterial = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader: sourceFragmentShader,
          depthTest: false,
          depthWrite: false,
          blending: THREE.NoBlending,
          uniforms: {
            uText: { value: textTexture },
            uCssResolution: { value: cssResolution.clone() },
            uTime: { value: 0 },
            uSpeed: { value: clamp(Number(speed) || 69, 20, 160) },
            uRepeat: { value: 1.68 },
            uBackground: { value: background.clone() },
            uTextColor: { value: foreground },
          },
        });
        warpMaterial = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader: warpFragmentShader,
          depthTest: false,
          depthWrite: false,
          blending: THREE.NoBlending,
          uniforms: {
            uInput: { value: null },
            uCssResolution: { value: cssResolution.clone() },
            uShatterPointer: { value: shatterPointer.clone() },
            uLiquifyPointer: { value: liquifyPointer.clone() },
            uPointerStrength: { value: 0 },
            uTime: { value: 0 },
            uShatterRadius: { value: 0.25 },
            uInfluenceRadius: { value: 0.8 },
            uEdgeDisplacementPx: { value: 23 },
          },
        });
        compositeMaterial = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader: compositeFragmentShader,
          depthTest: false,
          depthWrite: false,
          blending: THREE.NoBlending,
          uniforms: {
            uInput: { value: null },
            uResolution: { value: bufferResolution },
            uCssResolution: { value: cssResolution.clone() },
            uShatterPointer: { value: shatterPointer.clone() },
            uChromaticPointer: { value: chromaticPointer.clone() },
            uBeamPointer: { value: beamPointer.clone() },
            uGodRayPointer: { value: godRayPointer.clone() },
            uPointerStrength: { value: 0 },
            uTime: { value: 0 },
            uBeamTrackGain: { value: 0.06 },
            uShatterRadius: { value: 0.25 },
            uHighlightAngularVelocity: { value: 0.37699111843 },
            uBackground: { value: background },
            uAccent: { value: accent },
          },
        });

        targetA = createRenderTarget(1, 1);
        targetB = createRenderTarget(1, 1);
        warpMaterial.uniforms.uInput.value = targetA.texture;
        compositeMaterial.uniforms.uInput.value = targetB.texture;

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(sceneFrame);
        intersectionObserver = new IntersectionObserver(([entry]) => {
          inViewport = entry.isIntersecting;
          if (inViewport) startAnimation();
          else pauseAnimation();
        }, { threshold: 0.01 });
        intersectionObserver.observe(root);

        root.__radialTextLensMetrics = {
          influenceRadiusRatio: 0.222,
          ringRadiusHeightRatio: 0.285,
          centerSamplingScale: 0.25,
          shoulderMagnificationRange: [1.4, 1.7],
          edgeDisplacementPx: 23,
          beamTrackGain: compositeMaterial.uniforms.uBeamTrackGain.value,
          godRayTrackGain: 0.61,
          shatterTrackGain: 0.8,
          liquifyTrackGain: 0.2,
          chromaticTrackGain: 0.25,
          shatterRadiusRatio: warpMaterial.uniforms.uShatterRadius.value,
          highlightAngularVelocityDegrees:
            compositeMaterial.uniforms.uHighlightAngularVelocity.value * 180 / Math.PI,
          speedPxPerSecond: sourceMaterial.uniforms.uSpeed.value,
          getPointerStrength: () => pointerStrength,
          getDynamicState: () => ({
            elapsed,
            pointerStrength,
            beamPointer: { x: beamPointer.x, y: beamPointer.y },
            beamOffsetPx: {
              x: (beamPointer.x - 0.5)
                * compositeMaterial.uniforms.uBeamTrackGain.value * cssWidth,
              y: (beamPointer.y - 0.5)
                * compositeMaterial.uniforms.uBeamTrackGain.value * cssHeight,
            },
            godRayPointer: { x: godRayPointer.x, y: godRayPointer.y },
            shatterPointer: { x: shatterPointer.x, y: shatterPointer.y },
            liquifyPointer: { x: liquifyPointer.x, y: liquifyPointer.y },
            highlightAngleDegrees: elapsed
              * compositeMaterial.uniforms.uHighlightAngularVelocity.value * 180 / Math.PI,
          }),
        };
        root.dataset.sceneState = "ready";
        setStatus("ready");
        reducedMotion = reduced.matches;
        resize();
        handleMotionPreference();
      } catch (error) {
        showFallback(error);
      }
    }

    initialize();

    return () => {
      disposed = true;
      pauseAnimation();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      sceneFrame.removeEventListener("pointerenter", enterPointer);
      sceneFrame.removeEventListener("pointermove", updatePointer);
      sceneFrame.removeEventListener("pointerleave", leavePointer);
      document.removeEventListener("visibilitychange", handleVisibility);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      removeMediaListener(reduced, handleMotionPreference);
      geometry?.dispose();
      renderSceneGraph?.remove(renderQuad);
      textTexture?.dispose();
      sourceMaterial?.dispose();
      warpMaterial?.dispose();
      compositeMaterial?.dispose();
      targetA?.dispose();
      targetB?.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
      delete root.__radialTextLensMetrics;
      delete root.dataset.sceneState;
      delete root.dataset.flowOffset;
      delete root.dataset.pointerStrength;
      delete root.dataset.beamOffsetX;
      delete root.dataset.beamOffsetY;
      delete root.dataset.highlightAngle;
    };
  }, [accentColor, backgroundColor, interactive, safeText, speed, textColor]);

  return (
    <section
      className={`radial-text-lens ${status === "fallback" ? "is-fallback" : ""}`}
      ref={rootRef}
      style={{
        "--lens-background": backgroundColor,
        "--lens-text": textColor,
        "--lens-accent": accentColor,
      }}
    >
      <style>{styles}</style>
      <div className="radial-text-lens__frame" ref={frameRef}>
        <canvas className="radial-text-lens__canvas" ref={canvasRef} role="img" aria-label={ariaLabel} />
        <div className="radial-text-lens__cursor" ref={cursorRef} aria-hidden="true" />
        <div className="radial-text-lens__fallback" aria-hidden="true">
          <span className="radial-text-lens__fallback-text">{safeText} &nbsp; {safeText}</span>
          <span className="radial-text-lens__fallback-ring" />
        </div>
      </div>
      <span className="radial-text-lens__sr-only">{safeText}</span>
    </section>
  );
}
