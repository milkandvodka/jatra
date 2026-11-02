"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useBookings } from "@/lib/store";

const LINKS = [
  { href: "/events", label: "Events" },
  { href: "/host", label: "Host" },
  { href: "/tickets", label: "Tickets" },
];

const themeListeners = new Set<() => void>();
const subTheme = (cb: () => void) => {
  themeListeners.add(cb);
  return () => void themeListeners.delete(cb);
};

/** Light or dark. The choice is saved; until then the system setting decides (see the boot script in layout.tsx). */
function ThemeToggle() {
  const dark = useSyncExternalStore(subTheme, () => document.documentElement.dataset.theme === "dark", () => false);
  const flip = () => {
    const t = dark ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = t;
      themeListeners.forEach((l) => l());
    };
    try {
      localStorage.setItem("jatra:theme", t);
    } catch {}
    // The new theme wipes down over the old one where View Transitions exist; elsewhere it just swaps.
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) document.startViewTransition(apply);
    else apply();
  };
  return (
    <button type="button" className="theme-btn" aria-label="Dark mode" aria-pressed={dark} onClick={flip}>
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M10 2a8 8 0 0 1 0 16z" fill="currentColor" />
      </svg>
    </button>
  );
}

export function Wordmark() {
  return (
    <Link href="/" className="wordmark" aria-label="Jatra, home">
      Jatra <span className="wordmark__odia" lang="or" aria-hidden="true">ଯାତ୍ରା</span>
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const tickets = useBookings().length;
  const menu = useRef<HTMLDialogElement>(null);

  useEffect(() => menu.current?.close(), [pathname]);

  const links = (
    <>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={pathname.startsWith(l.href) ? "page" : undefined}>
          {l.label}
          {l.href === "/tickets" && tickets > 0 ? (
            <span className="nav__count num" aria-label={`, ${tickets} booked`}>
              {tickets}
            </span>
          ) : null}
        </Link>
      ))}
    </>
  );

  return (
    <header className="site-header">
      <Wordmark />
      <div className="site-header__end">
        <nav className="nav" aria-label="Main">
          {links}
        </nav>
        <ThemeToggle />
        <button className="menu-btn" type="button" aria-haspopup="dialog" onClick={() => menu.current?.showModal()}>
          Menu
        </button>
      </div>
      <dialog ref={menu} className="menu-sheet" aria-label="Menu">
        <div className="menu-sheet__top">
          <Wordmark />
          <button className="menu-btn" style={{ display: "block" }} type="button" onClick={() => menu.current?.close()}>
            Close
          </button>
        </div>
        <nav aria-label="Main">
          <Link href="/">Home</Link>
          {links}
        </nav>
      </dialog>
    </header>
  );
}
