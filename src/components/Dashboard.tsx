"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "./Toast";
import { rupees, when } from "@/lib/events";
import { bookedByTier, deleteEvent, useBookings, useHydrated, useUserEvents } from "@/lib/store";

/** The organizer's own events: what is listed, what has sold, and the controls to change it. */
export default function Dashboard() {
  const events = useUserEvents();
  const bookings = useBookings();
  const hydrated = useHydrated();
  const [confirming, setConfirming] = useState<string | null>(null);

  const rows = events.map((e) => {
    const booked = bookedByTier(bookings, e.slug);
    const sold = e.tiers.reduce((n, t) => n + t.sold + (booked[t.id] ?? 0), 0);
    const capacity = e.tiers.reduce((n, t) => n + t.capacity, 0);
    const takings = e.tiers.reduce((n, t) => n + (t.sold + (booked[t.id] ?? 0)) * t.price, 0);
    return { e, sold, capacity, takings };
  });
  const totals = rows.reduce((a, r) => ({ sold: a.sold + r.sold, takings: a.takings + r.takings }), { sold: 0, takings: 0 });

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title load">Your events</h1>
          <p className="page-sub load" style={{ ["--d" as string]: "90ms" }}>Events you host from this browser. Bookings made here count towards your sales straight away.</p>
        </div>
        <Link className="btn" href="/host/new">
          Create an event
        </Link>
      </div>

      {!hydrated ? (
        <p className="muted">Loading your events…</p>
      ) : rows.length === 0 ? (
        <div className="empty">
          <h2>You haven’t listed anything yet.</h2>
          <p className="muted">Add a title, a date, a venue and a ticket. Your event goes on the city’s list as soon as you publish.</p>
          <Link className="btn btn--ink" href="/host/new">
            Create your first event
          </Link>
        </div>
      ) : (
        <>
          <dl className="dash-figs">
            <div>
              <dt>Events listed</dt>
              <dd>{rows.length}</dd>
            </div>
            <div>
              <dt>Tickets sold</dt>
              <dd>{totals.sold}</dd>
            </div>
            <div>
              <dt>Takings</dt>
              <dd>{totals.takings ? rupees(totals.takings) : "₹0"}</dd>
            </div>
          </dl>
          <ul className="dash-list">
            {rows.map(({ e, sold, capacity, takings }) => (
              <li className="dash-item" key={e.slug} data-reveal="">
                <div className="dash-item__pic">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.image.src} alt="" />
                </div>
                <div>
                  <h3>{e.title}</h3>
                  <p className="meta">
                    {when(e)}, {e.venue}
                  </p>
                  <div className="bar" aria-hidden="true">
                    <i style={{ transform: `scaleX(${capacity ? sold / capacity : 0})` }} />
                  </div>
                  <p className="bar-label">
                    {sold} of {capacity} sold, {takings ? rupees(takings) : "₹0"} taken
                  </p>
                </div>
                <div className="dash-item__actions">
                  <Link className="link" href={`/events/${e.slug}`}>
                    View
                  </Link>
                  <Link className="link" href={`/host/new?edit=${e.slug}`}>
                    Edit
                  </Link>
                  {confirming === e.slug ? (
                    <>
                      <button
                        type="button"
                        className="link danger"
                        onClick={() => {
                          deleteEvent(e.slug);
                          setConfirming(null);
                          toast(`Deleted “${e.title}”`);
                        }}
                      >
                        Confirm delete
                      </button>
                      <button type="button" className="link" onClick={() => setConfirming(null)}>
                        Keep
                      </button>
                    </>
                  ) : (
                    <button type="button" className="link danger" onClick={() => setConfirming(e.slug)}>
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
