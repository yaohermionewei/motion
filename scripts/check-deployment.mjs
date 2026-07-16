import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const entries = await readdir(dist, { withFileTypes: true });
const names = new Set(entries.map((entry) => entry.name));
const required = ["index.html", "assets", "fonts", "images", "motion-index-mark.svg"];
const allowed = new Set(required);
const missing = required.filter((name) => !names.has(name));
const unexpected = [...names].filter((name) => !allowed.has(name));
const demoImages = [
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
const requiredImages = [
  "air-cloud.png",
  ...demoImages.flatMap((name) => [`${name}.png`, `${name}.webp`]),
];
const missingPublicFiles = (
  await Promise.all(
    requiredImages.map(async (name) => {
      const details = await stat(new URL(`../dist/images/${name}`, import.meta.url)).catch(() => null);
      return details?.isFile() && details.size > 0 ? null : name;
    }),
  )
).filter(Boolean);
const assetFiles = await readdir(new URL("../dist/assets/", import.meta.url));
const bundleFiles = assetFiles.filter((name) => name.endsWith(".js") || name.endsWith(".css"));
const bundles = await Promise.all(
  bundleFiles.map((name) => readFile(new URL(`../dist/assets/${name}`, import.meta.url), "utf8")),
);
const localOnlyMarkers = [
  "motion.localhost",
  "lando.localhost",
  "contra.localhost",
  "k95.localhost",
  "reference-sites/",
  "reference-switcher",
];
const leakedMarkers = localOnlyMarkers.filter((marker) =>
  bundles.some((source) => source.includes(marker)),
);

if (missing.length || missingPublicFiles.length || unexpected.length || leakedMarkers.length) {
  if (missing.length) console.error(`Deployment is missing Motion Index output: ${missing.join(", ")}`);
  if (unexpected.length) console.error(`Deployment contains non-library output: ${unexpected.join(", ")}`);
  if (missingPublicFiles.length) console.error(`Deployment is missing demo images: ${missingPublicFiles.join(", ")}`);
  if (leakedMarkers.length) console.error(`Deployment contains local research markers: ${leakedMarkers.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log("Deployment boundary OK (public Motion Index only)." );
}
