import { useState } from "react";
const glyphs: Record<string, string> = {
  search: "⌕",
  home: "⌂",
  team: "♜",
  league: "♕",
  player: "♙",
  match: "⚽",
  stadium: "▥",
  calendar: "▦",
  country: "◎",
  back: "←",
  favorite: "☆",
  history: "◷",
  error: "!",
};
export function Icon({ name }: { name: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="icon" aria-hidden="true">
      {failed ? (
        glyphs[name] || "◇"
      ) : (
        <img
          src={`/assets/icons/${name}.svg`}
          alt=""
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
export function Media({
  src,
  alt,
  kind = "team",
  className = "",
}: {
  src?: string | null;
  alt: string;
  kind?: "team" | "player" | "stadium" | "logo";
  className?: string;
}) {
  const remote = src && /^https?:\/\//i.test(src) ? src : undefined;
  const placeholder = `/assets/images/${kind === "logo" ? "logo" : `${kind}-placeholder`}.png`;
  const [failed, setFailed] = useState<string[]>([]);
  const candidate =
    remote && !failed.includes(remote)
      ? remote
      : !failed.includes(placeholder)
        ? placeholder
        : null;
  return (
    <span className={`media ${kind} ${className}`}>
      {candidate ? (
        <img
          src={candidate}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setFailed((list) => [...list, candidate])}
        />
      ) : (
        <span role="img" aria-label={alt} className="media-fallback">
          {kind === "stadium" ? (
            <span className="pitch">
              <i />
            </span>
          ) : kind === "logo" ? (
            "↗"
          ) : (
            "⬡"
          )}
        </span>
      )}
    </span>
  );
}
