"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

/** Smooth scrolling (pointer devices, motion allowed) and one-shot reveals for [data-reveal] and [data-split]. */
export default function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis?.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true });
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -4% 0px", threshold: 0 },
    );
    const PENDING = "[data-reveal]:not(.is-in), [data-split]:not(.is-in)";
    const scan = () => document.querySelectorAll(PENDING).forEach((el) => io.observe(el));
    scan();
    // A jump (End key, a fast fling) can carry an element past the viewport inside one frame, and the
    // observer never sees it intersect. Reveal anything already above the fold once the scroll settles.
    // At the end of the page nothing can scroll further into view, so everything left is shown.
    const sweep = () => {
      const atEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
      document.querySelectorAll(PENDING).forEach((el) => {
        if (atEnd || el.getBoundingClientRect().top < innerHeight * 0.88) {
          el.classList.add("is-in");
          io.unobserve(el);
        }
      });
    };
    window.addEventListener("scrollend", sweep);
    const poll = setInterval(sweep, 250);
    // Client components (filters, lists) render new reveal targets later.
    const mo = new MutationObserver(scan);
    mo.observe(document.getElementById("main") ?? document.body, { childList: true, subtree: true });
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = setTimeout(refresh, 400);
    return () => {
      io.disconnect();
      mo.disconnect();
      clearInterval(poll);
      window.removeEventListener("scrollend", sweep);
      clearTimeout(t);
      window.removeEventListener("load", refresh);
    };
  }, [pathname]);

  return null;
}
