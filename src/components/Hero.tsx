"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** A torana-shaped window on a film of the Old Town opens to the edges over one screen of scroll. */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = root.current!;
    const v = video.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) {
      v.removeAttribute("autoplay");
      v.pause();
      return;
    }

    // Pause the film whenever it is off screen.
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    io.observe(el);

    const phone = matchMedia("(max-width: 900px)").matches;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: () => `+=${innerHeight * (phone ? 0.7 : 1)}`,
      scrub: true,
      onUpdate: ({ progress: p }) => {
        media.current!.style.setProperty("--p", p.toFixed(4));
        const q = Math.min(1, p / 0.45);
        copy.current!.style.opacity = String(1 - q);
        copy.current!.style.transform = `translateY(${(-40 * q).toFixed(1)}px)`;
        copy.current!.style.visibility = q >= 1 ? "hidden" : "visible";
      },
    });
    return () => {
      io.disconnect();
      st.kill();
    };
  }, []);

  return (
    <section className="hero" data-scene="" ref={root} aria-labelledby="hero-title">
      <div className="hero__stage">
        <div className="hero__media" ref={media}>
          <div className="hero__inner">
            <video
              ref={video}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/media/city-poster.jpg"
              aria-label="Film of Odissi dancers among the temples of Bhubaneswar's Old Town at dusk"
            >
              <source src="/media/city.webm" type="video/webm" />
              <source src="/media/city.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="hero__scrim" />
        </div>
        <div className="hero__copy" ref={copy}>
          <h1 className="hero__title" id="hero-title">
            <span className="line">
              <span style={{ ["--i" as string]: 0 }}>What’s on in</span>
            </span>
            <span className="line">
              <span style={{ ["--i" as string]: 1 }}>Bhubaneswar</span>
            </span>
          </h1>
          <div className="hero__aside">
            <p>Odissi under temple arches, open mics, food walks and night runs. Find this week’s plan and book it in a minute.</p>
            <Link href="/events" className="btn" style={{ ["--d" as string]: "480ms" }}>
              Find an event
            </Link>
            <p className="hero__byline" style={{ ["--d" as string]: "560ms" }}>
              Designed and built by <strong>Subham Shah</strong>, <span className="num">Roll No. 24155739</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
