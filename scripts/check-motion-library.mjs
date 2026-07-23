import { readFile, stat } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const componentFiles = [
  "OvalTitleReveal.jsx",
  "LimeTextReveal.jsx",
  "KineticMarquee.jsx",
  "RadialTextLens.jsx",
  "RollingLettersButton.jsx",
  "StaggeredRollButton.jsx",
  "ShuffleText.jsx",
  "RadialFillButton.jsx",
  "ArrowStateButton.jsx",
  "LayeredImageReveal.jsx",
  "ScrollRippleReveal.jsx",
  "PixelShimmerField.jsx",
  "HoverDisclosureCard.jsx",
  "HorizontalReel.jsx",
  "ParallaxCollage.jsx",
  "SocialFan.jsx",
  "AnchoredCloudField.jsx",
  "HeroShrinkScene.jsx",
  "DualPanelConverge.jsx",
  "ScrollScatterScene.jsx",
  "SignatureDraw.jsx",
  "StaggeredMenu.jsx",
];
const requiredFiles = [
  "index.html",
  "src/App.jsx",
  "src/main.jsx",
  "src/styles.css",
  "src/theme.css",
  "src/data/registry.js",
  "src/components/ShuffleText.css",
  ...componentFiles.map((name) => `src/components/${name}`),
];
const imageFiles = [
  "retro-media-orbit",
  "retro-disc-signal",
  "retro-cosmic-paths",
  "retro-oval-horizon",
  "retro-yellow-gateway",
  "retro-cloud-stairway",
  "retro-window-reflection",
  "retro-stellar-ring",
  "retro-luminous-black-hole",
  "retro-planetary-voyage",
];
const requiredAssets = [
  "public/motion-index-mark.svg",
  "public/fonts/noto-sans-latin-400-normal.woff2",
  "public/fonts/OFL-Noto-Sans.txt",
  "public/images/air-cloud.png",
  ...imageFiles.flatMap((name) => [
    `public/images/${name}.png`,
    `public/images/${name}.webp`,
  ]),
];
const componentIds = [
  "oval-title-reveal",
  "lime-text-reveal",
  "kinetic-marquee",
  "radial-text-lens",
  "rolling-letters",
  "staggered-roll-button",
  "radial-fill-button",
  "arrow-state",
  "layered-image-reveal",
  "scroll-ripple-reveal",
  "pixel-shimmer-field",
  "hover-disclosure-card",
  "horizontal-reel",
  "parallax-collage",
  "social-fan",
  "anchored-cloud-field",
  "hero-shrink-scene",
  "dual-panel-converge",
  "scroll-scatter-scene",
  "signature-draw",
  "staggered-menu",
];
const categoryIds = ["type", "buttons", "covers", "galleries", "scenes-3d", "transitions", "paths", "navigation"];
const localOnlyMarkers = [
  "reference-sites/",
  "直接移植",
  "UnicornStudio",
  "hero-scene-data",
  "Moonshot AI",
  "NotoSans-Latin",
];

const sources = await Promise.all(
  requiredFiles.map(async (path) => ({ path, source: await readFile(new URL(path, root), "utf8") })),
);
const empty = sources.filter((file) => file.source.trim().length === 0);
const missingAssets = (
  await Promise.all(
    requiredAssets.map(async (path) => {
      const details = await stat(new URL(path, root)).catch(() => null);
      return details?.isFile() && details.size > 0 ? null : path;
    }),
  )
).filter(Boolean);

const registry = sources.find((file) => file.path.endsWith("registry.js")).source;
const categoryBlock = registry.slice(
  registry.indexOf("export const categories"),
  registry.indexOf("export const motionComponents"),
);
const componentBlock = registry.slice(registry.indexOf("export const motionComponents"));
const registeredCategories = [...categoryBlock.matchAll(/\{ id: "([^"]+)"/g)].map((match) => match[1]);
const registeredIds = [...componentBlock.matchAll(/^\s{4}id: "([^"]+)"/gm)].map((match) => match[1]);
const missingIds = componentIds.filter((id) => !registeredIds.includes(id));
const unexpectedIds = registeredIds.filter((id) => !componentIds.includes(id));
const duplicateIds = registeredIds.filter((id, index) => registeredIds.indexOf(id) !== index);
const missingCategories = categoryIds.filter((id) => !registeredCategories.includes(id));
const unexpectedCategories = registeredCategories.filter((id) => !categoryIds.includes(id));
const leakedMarkers = localOnlyMarkers.filter((marker) =>
  sources.some((file) => file.source.includes(marker)),
);

if (
  empty.length ||
  missingAssets.length ||
  missingIds.length ||
  unexpectedIds.length ||
  duplicateIds.length ||
  missingCategories.length ||
  unexpectedCategories.length ||
  leakedMarkers.length
) {
  if (empty.length) console.error(`Empty public files: ${empty.map((file) => file.path).join(", ")}`);
  if (missingAssets.length) console.error(`Missing public assets: ${missingAssets.join(", ")}`);
  if (missingIds.length) console.error(`Missing component registrations: ${missingIds.join(", ")}`);
  if (unexpectedIds.length) console.error(`Unexpected component registrations: ${unexpectedIds.join(", ")}`);
  if (duplicateIds.length) console.error(`Duplicate component registrations: ${duplicateIds.join(", ")}`);
  if (missingCategories.length) console.error(`Missing categories: ${missingCategories.join(", ")}`);
  if (unexpectedCategories.length) console.error(`Unexpected categories: ${unexpectedCategories.join(", ")}`);
  if (leakedMarkers.length) console.error(`Local research markers leaked into public source: ${leakedMarkers.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(`Motion Index OK (${componentIds.length} components, ${categoryIds.length} categories, ${imageFiles.length} demo images).`);
}
