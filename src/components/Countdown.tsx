"use client";

import { useSyncExternalStore } from "react";

const tick = (cb: () => void) => {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
};
const now = () => Math.floor(Date.now() / 1000);
const pad = (n: number) => String(n).padStart(2, "0"); // taste-skill-ignore: a clock

/** Time left until an event starts, ticking each second. Shows "Happening now" during it and nothing after it. */
export default function Countdown({ start, end, blocks = false }: { start: string; end: string; blocks?: boolean }) {
  const t = useSyncExternalStore(tick, now, () => null);
  const left = t === null ? null : Math.floor(Date.parse(start) / 1000) - t;
  if (t !== null && Date.parse(end) / 1000 <= t) return null;
  if (left !== null && left <= 0) return <p className="countdown-line">Happening now</p>;

  const parts: [number | null, string][] = [
    [left === null ? null : Math.floor(left / 86400), "days"],
    [left === null ? null : Math.floor(left / 3600) % 24, "hours"],
    [left === null ? null : Math.floor(left / 60) % 60, "min"],
    [left === null ? null : left % 60, "sec"],
  ];

  if (!blocks) {
    if (left === null) return null;
    const [d, h, m, s] = parts.map(([n]) => n!);
    return (
      <p className="countdown-line num" role="timer">
        Starts in {d ? `${d}d ` : ""}
        {pad(h)}:{pad(m)}:{pad(s)}
      </p>
    );
  }
  return (
    <div className="countdown">
      <p>Starts in</p>
      <div className="countdown__cells num" role="timer" aria-label={left === null ? "Starts in" : `Starts in ${parts[0][0]} days, ${parts[1][0]} hours and ${parts[2][0]} minutes`}>
        {parts.map(([n, unit]) => (
          <span key={unit} aria-hidden="true">
            {/* keyed by value so each change replays the roll-in */}
            <b key={n ?? "x"}>{n === null ? "––" : pad(n)}</b>
            {unit}
          </span>
        ))}
      </div>
    </div>
  );
}
