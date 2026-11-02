"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Split from "./Split";
import { dayOf, fromPrice, timeRange, type EventItem } from "@/lib/events";

type Day = { ymd: string; label: string; date: string };

/** The week as a list. Pick a day; the row at the middle of the screen (or under the pointer) lights and shows its picture. */
export default function ThisWeek({ days, events }: { days: Day[]; events: EventItem[] }) {
  const [day, setDay] = useState<string | null>(null);
  const shown = useMemo(() => (day ? events.filter((e) => dayOf(e.start) === day) : events), [day, events]);
  const [active, setActive] = useState<string | undefined>(events[0]?.slug);
  const list = useRef<HTMLUListElement>(null);
  const current = shown.some((e) => e.slug === active) ? active : shown[0]?.slug;

  useEffect(() => {
    const rows = list.current?.querySelectorAll<HTMLElement>("[data-slug]");
    if (!rows?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive((hit.target as HTMLElement).dataset.slug);
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    rows.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, [shown]);

  const dayName = days.find((d) => d.ymd === day);

  return (
    <section className="week" aria-labelledby="week-title">
      <div className="grid wrap week__grid">
        <div className="week__photo" aria-hidden="true">
          {events.map((e) => (
            <Image key={e.slug} src={e.image.src} alt="" width={e.image.w} height={e.image.h} sizes="(min-width: 901px) 40vw, 100vw" className={e.slug === current ? "is-on" : undefined} />
          ))}
        </div>
        <div className="week__main">
          <div className="week__head">
            <Split text="This week" className="head" id="week-title" />
          </div>
          <div className="week__days" role="group" aria-label="Choose a day">
            <button className="day" type="button" aria-pressed={day === null} onClick={() => setDay(null)}>
              All 7 days
            </button>
            {days.map((d) => (
              <button key={d.ymd} className="day" type="button" aria-pressed={day === d.ymd} onClick={() => setDay(d.ymd)}>
                {d.label} <span className="num">{d.date}</span>
              </button>
            ))}
          </div>
          <ul className="week__list" ref={list} aria-live="polite">
            {shown.map((e) => (
              <li
                key={e.slug}
                data-slug={e.slug}
                className={`row${e.slug === current ? " is-active" : ""}`}
                onPointerEnter={() => setActive(e.slug)}
                onFocus={() => setActive(e.slug)}
              >
                <Link className="row__link" href={`/events/${e.slug}`}>
                  <span className="row__name">{e.title}</span>
                  <span className="row__price num">{fromPrice(e)}</span>
                </Link>
                <div className="row__desc">
                  <div>
                    <p>{e.summary}</p>
                    <p className="meta">
                      {days.find((d) => d.ymd === dayOf(e.start))?.label}, {timeRange(e.start, e.end)} at {e.venue}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {shown.length === 0 ? (
            <p className="week__empty">
              Nothing listed for {dayName?.label} yet.{" "}
              <Link className="link" href="/host/new">
                Host something
              </Link>
            </p>
          ) : null}
          <p className="week__more">
            <Link href="/events" className="btn btn--ink">
              See all events
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
