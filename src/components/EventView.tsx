"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Countdown from "./Countdown";
import Poster from "./Poster";
import Ticket from "./Ticket";
import { toast } from "./Toast";
import { dayOf, longDate, rupees, timeRange, todayIST, when, type EventItem } from "@/lib/events";
import { addBooking, bookedByTier, downloadIcs, ticketCode, useBookings, useHydrated, useUserEvents, type Booking } from "@/lib/store";

const MAX_PER_TIER = 6;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** An Indian mobile number: optional +91 or 0, then ten digits starting 6 to 9. Spaces and dashes are ignored. */
const PHONE = /^(?:\+?91|0)?[6-9]\d{9}$/;

type Errors = Partial<Record<"name" | "email" | "phone", string>>;
function validate(f: FormData) {
  const v = {
    name: String(f.get("name") ?? "").trim(),
    email: String(f.get("email") ?? "").trim(),
    phone: String(f.get("phone") ?? "").replace(/[\s-]/g, ""),
  };
  const errs: Errors = {};
  if (v.name.length < 2) errs.name = "Enter the name to print on the ticket.";
  if (!EMAIL.test(v.email)) errs.email = "Enter an email address like name@example.com.";
  if (!PHONE.test(v.phone)) errs.phone = "Enter a 10-digit mobile number, like 98765 43210.";
  return { v, errs };
}

export default function EventView({ initial, slug, more }: { initial: EventItem | null; slug: string; more: EventItem[] }) {
  const mine = useUserEvents();
  const hydrated = useHydrated();
  const e = initial ?? mine.find((x) => x.slug === slug) ?? null;

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("published")) {
      toast("Published. This is the page visitors see.");
      url.searchParams.delete("published");
      history.replaceState(null, "", url);
    }
  }, []);

  if (!e) {
    return (
      <div className="page">
        {hydrated ? (
          <div className="empty">
            <h1 className="page-title">This event isn’t here</h1>
            <p className="page-sub">It may have been removed by its host, or it was created in another browser. Events hosted on Jatra live in the browser that made them.</p>
            <Link className="btn btn--ink" href="/events">
              See every event
            </Link>
          </div>
        ) : (
          <p className="muted">Loading event…</p>
        )}
      </div>
    );
  }
  return <EventPage e={e} more={more} ended={hydrated && dayOf(e.end) < todayIST()} />;
}

function EventPage({ e, more, ended }: { e: EventItem; more: EventItem[]; ended: boolean }) {
  const bookings = useBookings();
  const booked = bookedByTier(bookings, e.slug);
  const [qty, setQty] = useState<Record<string, number>>({});
  const dialog = useRef<HTMLDialogElement>(null);
  const [issued, setIssued] = useState<Booking | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  const left = (t: EventItem["tiers"][number]) => Math.max(0, t.capacity - t.sold - (booked[t.id] ?? 0));
  const lines = e.tiers.filter((t) => (qty[t.id] ?? 0) > 0).map((t) => ({ tierId: t.id, name: t.name, price: t.price, qty: qty[t.id] }));
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce((n, l) => n + l.qty * l.price, 0);
  const allGone = e.tiers.every((t) => left(t) === 0);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue}, ${e.address}`)}`;

  const step = (id: string, d: number, max: number) => setQty((q) => ({ ...q, [id]: Math.min(max, Math.max(0, (q[id] ?? 0) + d)) }));

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: e.title, text: e.summary, url });
      } catch {}
      return;
    }
    await navigator.clipboard.writeText(url);
    toast("Link copied");
  };

  const confirm = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const { v, errs } = validate(new FormData(ev.currentTarget));
    setErrors(errs);
    const first = (["name", "email", "phone"] as const).find((k) => errs[k]);
    if (first) {
      (ev.currentTarget.elements.namedItem(first) as HTMLInputElement).focus();
      return;
    }
    const b: Booking = {
      code: ticketCode(),
      slug: e.slug,
      event: { title: e.title, start: e.start, end: e.end, venue: e.venue, address: e.address, image: e.image },
      lines,
      total,
      name: v.name,
      email: v.email,
      phone: v.phone,
      createdAt: new Date().toISOString(),
    };
    addBooking(b);
    setIssued(b);
    setQty({});
  };

  return (
    <article>
      <header className="ev-hero">
        <Link href="/events" className="ev-hero__back link">
          All events
        </Link>
        <div className="ev-hero__bg" data-reveal="settle">
          {e.image.src.startsWith("data:") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.image.src} alt={e.image.alt} />
          ) : (
            <Image src={e.image.src} alt={e.image.alt} width={e.image.w} height={e.image.h} sizes="100vw" priority />
          )}
        </div>
        <div className="ev-hero__scrim" />
        <div className="ev-hero__copy">
          <h1 className="load">{e.title}</h1>
          <p className="ev-hero__meta load" style={{ ["--d" as string]: "120ms" }}>
            <span>{when(e)}</span>
            <span>{e.venue}</span>
          </p>
        </div>
      </header>

      <div className="grid ev-body">
        <div className="ev-main">
          <section data-reveal="">
            <p className="ev-summary">{e.summary}</p>
            <div className="ev-about" style={{ marginTop: 24 }}>
              {e.about.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
          {e.schedule.length ? (
            <section aria-labelledby="sched" data-reveal="">
              <h2 id="sched">Schedule</h2>
              <ol className="schedule">
                {e.schedule.map(([t, what]) => (
                  <li key={t + what}>
                    <time>{t}</time>
                    <span>{what}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
          <section aria-labelledby="details" data-reveal="">
            <h2 id="details">Details</h2>
            <dl className="facts">
              <div>
                <dt>When</dt>
                <dd>
                  {longDate(e.start)}
                  {dayOf(e.start) !== dayOf(e.end) ? ` to ${longDate(e.end)}` : ""}
                  <br />
                  {timeRange(e.start, e.end)}
                </dd>
              </div>
              <div>
                <dt>Where</dt>
                <dd>
                  {e.venue}
                  <br />
                  {e.address}
                  <br />
                  <a className="link" href={mapUrl} target="_blank" rel="noreferrer">
                    Open in Google Maps
                  </a>
                </dd>
              </div>
              <div>
                <dt>Hosted by</dt>
                <dd>{e.host}</dd>
              </div>
              <div>
                <dt>Category and area</dt>
                <dd>
                  {e.category}, {e.area}
                </dd>
              </div>
            </dl>
          </section>
          {e.goodToKnow.length ? (
            <section aria-labelledby="gtk" data-reveal="">
              <h2 id="gtk">Good to know</h2>
              <ul style={{ display: "grid", gap: 10, paddingLeft: 20, listStyle: "disc" }}>
                {e.goodToKnow.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="ev-side" aria-labelledby="tix">
          <div className="tickets-panel" data-reveal="" style={{ ["--d" as string]: "150ms" }}>
            <h2 id="tix">Tickets</h2>
            {ended ? (
              <p>This event has ended.</p>
            ) : (
              <>
                <Countdown start={e.start} end={e.end} blocks />
                <div>
                  {e.tiers.map((t) => {
                    const l = left(t);
                    const max = Math.min(MAX_PER_TIER, l);
                    const n = qty[t.id] ?? 0;
                    return (
                      <div className="tier" key={t.id}>
                        <div>
                          <div className="tier__name">{t.name}</div>
                          <div className="tier__sub num">
                            {rupees(t.price)}
                            {t.note ? `, ${t.note.toLowerCase()}` : ""}
                          </div>
                          {l === 0 ? <div className="soldout">Sold out</div> : l <= 10 ? <div className="tier__sub num">{l} left</div> : null}
                        </div>
                        <div className="stepper" role="group" aria-label={`${t.name} tickets`}>
                          <button type="button" aria-label={`One fewer ${t.name}`} disabled={n === 0} onClick={() => step(t.id, -1, max)}>
                            −
                          </button>
                          <output aria-live="polite">{n}</output>
                          <button type="button" aria-label={`One more ${t.name}`} disabled={n >= max} onClick={() => step(t.id, 1, max)}>
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="total">
                  <span>Total</span>
                  <span className="num">{count ? rupees(total) : "—"}</span>
                </div>
                <button type="button" className="btn btn--full" disabled={count === 0} onClick={() => dialog.current?.showModal()}>
                  {allGone ? "Sold out" : count ? `Book ${count} ${count === 1 ? "ticket" : "tickets"}` : "Choose tickets"}
                </button>
                <p className="demo-note">Demo checkout: no payment is taken. Up to {MAX_PER_TIER} tickets per type.</p>
              </>
            )}
            <button type="button" className="link small" onClick={share} style={{ justifySelf: "start" }}>
              Share this event
            </button>
          </div>
        </aside>
      </div>

      {more.length ? (
        <section className="more" aria-labelledby="more-title">
          <h2 id="more-title" data-reveal="">Also coming up</h2>
          <ul className="posters">
            {more.map((m, i) => (
              <li key={m.slug}>
                <Poster e={m} reveal={i} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <dialog
        ref={dialog}
        className="sheet"
        aria-labelledby="sheet-title"
        onClose={() => {
          setIssued(null);
          setErrors({});
        }}
      >
        <div className="sheet__body">
          <div className="sheet__top">
            <h2 id="sheet-title">{issued ? "You’re going" : "Confirm booking"}</h2>
            <button type="button" className="icon-btn" aria-label="Close" onClick={() => dialog.current?.close()}>
              <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>
          {issued ? (
            <>
              <Ticket b={issued} print />
              <p className="confirm-msg" role="status">
                Booking confirmed, {issued.name}. Your ticket is saved in My tickets on this browser. Show the QR code at the gate.
              </p>
              <div className="ticket-actions">
                <button type="button" className="btn btn--ink" onClick={() => downloadIcs(issued.event, issued.slug)}>
                  Add to calendar
                </button>
                <Link className="link" href="/tickets">
                  See my tickets
                </Link>
              </div>
            </>
          ) : (
            <form
              onSubmit={confirm}
              // Once errors are showing, each one clears as its field is fixed.
              onInput={(ev) => Object.keys(errors).length && setErrors(validate(new FormData(ev.currentTarget)).errs)}
              noValidate
              style={{ display: "grid", gap: 18 }}
            >
              <label className="field">
                <span>Event</span>
                <input className="input" name="event" value={e.title} readOnly aria-describedby="event-note" />
                <small id="event-note">
                  {when(e)}, {e.venue}
                </small>
              </label>
              <ul className="summary-lines num">
                {lines.map((l) => (
                  <li key={l.tierId}>
                    <span>
                      {l.qty} × {l.name}
                    </span>
                    <span>{rupees(l.qty * l.price)}</span>
                  </li>
                ))}
                <li style={{ fontWeight: 600 }}>
                  <span>Total</span>
                  <span>{rupees(total)}</span>
                </li>
              </ul>
              <label className="field">
                <span>Name on the ticket</span>
                <input className="input" name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "err-name" : undefined} />
                {errors.name ? (
                  <span className="err" id="err-name">
                    {errors.name}
                  </span>
                ) : null}
              </label>
              <label className="field">
                <span>Email</span>
                <input className="input" name="email" type="email" inputMode="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "err-email" : "email-note"} />
                {errors.email ? (
                  <span className="err" id="err-email">
                    {errors.email}
                  </span>
                ) : (
                  <small id="email-note">Only stored in this browser. Nothing is sent.</small>
                )}
              </label>
              <label className="field">
                <span>Phone number</span>
                <input className="input" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "err-phone" : undefined} />
                {errors.phone ? (
                  <span className="err" id="err-phone">
                    {errors.phone}
                  </span>
                ) : null}
              </label>
              <button type="submit" className="btn btn--full">
                Confirm booking
              </button>
            </form>
          )}
        </div>
      </dialog>
    </article>
  );
}
