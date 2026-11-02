"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Split from "./Split";
import { getLenis } from "./Motion";
import { shortDate, type EventItem } from "@/lib/events";

gsap.registerPlugin(ScrollTrigger);

/** Jatra means procession: the title holds while the season's headliners pass by, one pixel of scroll per pixel of travel. */
export default function Season({ events }: { events: EventItem[] }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [at, setAt] = useState(1);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      const el = root.current!;
      const tr = track.current!;
      el.classList.add("is-pinned");
      const dx = () => tr.scrollWidth - tr.clientWidth;
      if (dx() <= 0 || dx() > innerHeight * 3) {
        el.classList.remove("is-pinned");
        return;
      }
      const tween = gsap.to(tr, {
        x: () => -dx(),
        ease: "none",
        scrollTrigger: {
          trigger: stage.current,
          start: "top top",
          end: () => `+=${dx()}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => setAt(Math.min(events.length, 1 + Math.round(self.progress * (events.length - 1)))),
        },
      });
      // Keyboard: bring the focused frame into view by scrolling to its place on the track.
      const onFocus = (e: FocusEvent) => {
        const st = tween.scrollTrigger!;
        const item = (e.target as HTMLElement).closest("li");
        if (!item) return;
        const x = Math.min(dx(), Math.max(0, item.offsetLeft - parseFloat(getComputedStyle(tr).paddingLeft)));
        const y = st.start + x;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(y, { immediate: true });
        else window.scrollTo({ top: y, behavior: "instant" });
      };
      tr.addEventListener("focusin", onFocus);
      return () => {
        tr.removeEventListener("focusin", onFocus);
        el.classList.remove("is-pinned");
      };
    });
    return () => mm.revert();
  }, [events.length]);

  return (
    <section className="season" ref={root} aria-labelledby="season-title">
      <div className="season__stage" ref={stage}>
        <div className="season__head">
          <Split text="This season" className="season__title" id="season-title" />
          <div className="season__lede" data-reveal="" style={{ ["--d" as string]: "200ms" }}>
            <p>Jatra is Odia for a procession. This is the city’s for the next three weeks, passing in the order it happens.</p>
            <Link href="/events" className="link">
              See every event
            </Link>
          </div>
        </div>
        <div className="season__window">
        <ul className="season__track" ref={track}>
          {events.map((e, i) => (
            <li className="season__item" key={e.slug} data-reveal="" style={{ ["--d" as string]: `${Math.min(i, 3) * 80}ms` }}>
              <Link href={`/events/${e.slug}`}>
                <div className="season__frame">
                  {/* eager: off to the right of the screen, lazy loading would wait until each frame slides in */}
                  <Image src={e.image.src} alt={e.image.alt} width={e.image.w} height={e.image.h} sizes="(min-width: 901px) 34vh, 72vw" loading="eager" fetchPriority="low" />
                </div>
                <div className="season__cap">
                  <strong>{e.title}</strong>
                  <span>
                    {shortDate(e.start)}, {e.venue}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        </div>
        <p className="season__count num" aria-hidden="true">
          {at} of {events.length}
        </p>
      </div>
    </section>
  );
}
