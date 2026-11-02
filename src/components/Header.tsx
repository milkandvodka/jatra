"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useBookings } from "@/lib/store";

const LINKS = [
  { href: "/events", label: "Events" },
  { href: "/host", label: "Host" },
  { href: "/tickets", label: "Tickets" },
];

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
      <nav className="nav" aria-label="Main">
        {links}
      </nav>
      <button className="menu-btn" type="button" aria-haspopup="dialog" onClick={() => menu.current?.showModal()}>
        Menu
      </button>
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
