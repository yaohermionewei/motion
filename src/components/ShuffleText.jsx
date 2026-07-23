import "./ShuffleText.css";

export const DEFAULT_SHUFFLE_DURATION_MS = 350;
export const DEFAULT_SHUFFLE_STAGGER_MS = 30;

export function getShuffleDelay(
  index,
  characterCount,
  durationMs = DEFAULT_SHUFFLE_DURATION_MS,
  staggerMs = DEFAULT_SHUFFLE_STAGGER_MS,
) {
  const firstGroupCount = Math.floor(characterCount / 2);
  const secondGroupStart = Math.round(
    0.7 * (durationMs + Math.max(0, firstGroupCount - 1) * staggerMs),
  );
  const groupIndex = Math.floor(index / 2);

  return index % 2 === 1
    ? groupIndex * staggerMs
    : secondGroupStart + groupIndex * staggerMs;
}

export default function ShuffleText({
  text,
  enabled = false,
  durationMs = DEFAULT_SHUFFLE_DURATION_MS,
  staggerMs = DEFAULT_SHUFFLE_STAGGER_MS,
  className = "",
}) {
  const characters = Array.from(text);
  const rootClassName = ["shuffle-text", enabled && "is-enabled", className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={rootClassName}>
      <span className="shuffle-text__static" aria-hidden="true">{text}</span>
      <span className="shuffle-text__animated" aria-hidden="true">
        {characters.map((character, index) => {
          const glyph = character === " " ? "\u00a0" : character;
          const delay = getShuffleDelay(index, characters.length, durationMs, staggerMs);

          return (
            <span className="shuffle-text__char" key={`${character}-${index}`}>
              <span
                className="shuffle-text__stack"
                style={{
                  "--shuffle-delay": `${delay}ms`,
                  "--shuffle-duration": `${durationMs}ms`,
                }}
              >
                <span>{glyph}</span>
                <span>{glyph}</span>
              </span>
            </span>
          );
        })}
      </span>
      <span className="visually-hidden">{text}</span>
    </span>
  );
}
