"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Ticket from "./Ticket";
import { toast } from "./Toast";
import { cancelBooking, downloadIcs, useBookings, useHydrated } from "@/lib/store";

export default function TicketsList() {
  const bookings = useBookings();
  const hydrated = useHydrated();
  const [confirming, setConfirming] = useState<string | null>(null);
  // A scanned QR code opens this page with ?code=…; bring that ticket forward.
  const focus = hydrated ? new URLSearchParams(window.location.search).get("code") : null;
  useEffect(() => {
    if (focus) requestAnimationFrame(() => document.getElementById(focus)?.scrollIntoView({ block: "center" }));
  }, [focus]);

  if (!hydrated) return <p className="muted">Loading tickets…</p>;

  if (!bookings.length) {
    return (
      <div className="empty">
        <h2>No tickets yet.</h2>
        <p className="muted">Book something this week and the ticket appears here, with its QR code.</p>
        <Link className="btn" href="/events">
          Find an event
        </Link>
      </div>
    );
  }

  const sorted = [...bookings].sort((a, b) => a.event.start.localeCompare(b.event.start));
  return (
    <ul className="ticket-list">
      {sorted.map((b) => (
        <li key={b.code} id={b.code} data-reveal="" style={focus === b.code ? { outline: "3px solid var(--accent)", outlineOffset: 6 } : undefined}>
          <Ticket b={b} />
          <div className="ticket-actions">
            <button type="button" className="link" onClick={() => downloadIcs(b.event, b.slug)}>
              Add to calendar
            </button>
            <Link className="link" href={`/events/${b.slug}`}>
              View event
            </Link>
            {confirming === b.code ? (
              <>
                <button
                  type="button"
                  className="link danger"
                  onClick={() => {
                    cancelBooking(b.code);
                    setConfirming(null);
                    toast("Booking cancelled. The seats are back on sale.");
                  }}
                >
                  Yes, cancel this booking
                </button>
                <button type="button" className="link" onClick={() => setConfirming(null)}>
                  Keep it
                </button>
              </>
            ) : (
              <button type="button" className="link danger" onClick={() => setConfirming(b.code)}>
                Cancel booking
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
