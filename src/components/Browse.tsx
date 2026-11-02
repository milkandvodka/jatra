"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Poster from "./Poster";
import { AREAS, CATEGORIES, addDays, dayOf, type EventItem } from "@/lib/events";
import { useUserEvents } from "@/lib/store";

const WHEN = [
  ["any", "Any time"],
  ["today", "Today"],
  ["weekend", "This weekend"],
  ["week", "Next 7 days"],
  ["month", "Next 30 days"],
] as const;
const PRICE = [
  ["any", "Any price"],
  ["free", "Free"],
  ["under500", "Under ₹500"],
] as const;

function inWindow(e: EventItem, when: string, today: string) {
  const d = dayOf(e.start);
  const end = dayOf(e.end);
  if (when === "today") return d <= today && end >= today;
  if (when === "week") return d <= addDays(today, 6);
  if (when === "month") return d <= addDays(today, 29);
  if (when === "weekend") {
    const [y, m, dd] = today.split("-").map(Number);
    const dow = new Date(Date.UTC(y, m - 1, dd)).getUTCDay();
    const sat = dow === 0 ? addDays(today, -1) : addDays(today, 6 - dow);
    const sun = addDays(sat, 1);
    return d <= sun && end >= sat;
  }
  return true;
}

export function BrowseHeader({ count }: { count: number }) {
  return (
    <div className="page-head">
      <div>
        <h1 className="page-title load">Events in Bhubaneswar</h1>
        <p className="page-sub load" style={{ ["--d" as string]: "90ms" }}>
          {count} events over the next three weeks, from the Old Town to Patia. All times are Indian Standard Time.
        </p>
      </div>
      <Link className="btn btn--ink load" href="/host/new" style={{ ["--d" as string]: "160ms" }}>
        Host an event
      </Link>
    </div>
  );
}

export default function Browse({ sample, today }: { sample: EventItem[]; today: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const mine = useUserEvents();

  const q = params.get("q") ?? "";
  const cat = params.get("cat") ?? "";
  const when = params.get("when") ?? "any";
  const area = params.get("area") ?? "";
  const price = params.get("price") ?? "any";
  const sort = params.get("sort") ?? "soon";

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === "any" || (key === "sort" && value === "soon")) next.delete(key);
    else next.set(key, value);
    router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const all = useMemo(() => [...mine, ...sample].filter((e) => dayOf(e.end) >= today), [mine, sample, today]);
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = all.filter((e) => {
      if (cat && e.category !== cat) return false;
      if (area && e.area !== area) return false;
      const min = Math.min(...e.tiers.map((t) => t.price));
      if (price === "free" && min !== 0) return false;
      if (price === "under500" && min >= 500) return false;
      if (!inWindow(e, when, today)) return false;
      if (needle && !`${e.title} ${e.summary} ${e.venue} ${e.area} ${e.category} ${e.host}`.toLowerCase().includes(needle)) return false;
      return true;
    });
    return out.sort((a, b) =>
      sort === "price" ? Math.min(...a.tiers.map((t) => t.price)) - Math.min(...b.tiers.map((t) => t.price)) : a.start.localeCompare(b.start),
    );
  }, [all, q, cat, area, price, when, sort, today]);

  // The search box keeps its own text while typing and follows the URL when it changes elsewhere (Clear filters).
  const [text, setText] = useState(q);
  const [seenQ, setSeenQ] = useState(q);
  if (q !== seenQ) {
    setSeenQ(q);
    if (q !== text) setText(q);
  }

  const filtered = q || cat || area || when !== "any" || price !== "any";

  return (
    <MotionConfig reducedMotion="user">
      <BrowseHeader count={all.length} />
      <div className="filters load" style={{ ["--d" as string]: "200ms" }}>
        <div className="filters__row">
          <label className="search">
            <span className="sr-only">Search events</span>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="9" cy="9" r="6" />
              <path d="M14 14l4 4" />
            </svg>
            <input className="input" type="search" placeholder="Search Odissi, food walk, Patia…" value={text} onChange={(e) => { setText(e.target.value); set("q", e.target.value); }} />
          </label>
          <label>
            <span className="sr-only">When</span>
            <select className="select" value={when} onChange={(e) => set("when", e.target.value)}>
              {WHEN.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Area</span>
            <select className="select" value={area} onChange={(e) => set("area", e.target.value)}>
              <option value="">All areas</option>
              {AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Price</span>
            <select className="select" value={price} onChange={(e) => set("price", e.target.value)}>
              {PRICE.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="chips" role="group" aria-label="Category">
          <button type="button" className="chip" aria-pressed={!cat} onClick={() => set("cat", "")}>
            Everything
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => set("cat", cat === c ? "" : c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="results-bar">
        <p aria-live="polite">
          <strong className="num">{results.length}</strong> {results.length === 1 ? "event" : "events"}
          {filtered ? (
            <Link className="link" href={pathname} scroll={false} style={{ marginLeft: 16 }}>
              Clear filters
            </Link>
          ) : null}
        </p>
        <label className="small">
          <span className="sr-only">Sort</span>
          <select className="select" value={sort} onChange={(e) => set("sort", e.target.value)} style={{ minHeight: 40 }}>
            <option value="soon">Soonest first</option>
            <option value="price">Lowest price first</option>
          </select>
        </label>
      </div>

      {results.length ? (
        <motion.ul className="posters" layout>
          <AnimatePresence mode="popLayout" initial={false}>
            {results.map((e) => (
              <motion.li
                key={e.slug}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
                transition={{ type: "spring", duration: 0.45, bounce: 0 }}
              >
                <Poster e={e} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <div className="empty">
          <h2>Nothing matches those filters.</h2>
          <p className="muted">Try another day or area, or clear the filters to see everything on.</p>
          <Link className="btn btn--ink" href={pathname} scroll={false}>
            Clear filters
          </Link>
        </div>
      )}
    </MotionConfig>
  );
}
