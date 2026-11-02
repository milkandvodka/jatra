"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { rupees, shortDate, timeRange, dayOf } from "@/lib/events";
import type { Booking } from "@/lib/store";

function Qr({ text }: { text: string }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    QRCode.toString(text, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#0a0a0a", light: "#0000" } }).then(setSvg);
  }, [text]);
  return <div className="ticket__qr" role="img" aria-label="QR code for this ticket" dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** The ticket as issued: the event, what was booked, and a QR code that opens it on this site. */
export default function Ticket({ b, print = false }: { b: Booking; print?: boolean }) {
  const multiDay = dayOf(b.event.start) !== dayOf(b.event.end);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return (
    <article className={`ticket${print ? " ticket--print" : ""}`} aria-label={`Ticket for ${b.event.title}`}>
      <div className="ticket__main">
        <h3>{b.event.title}</h3>
        <p className="meta">
          {multiDay ? `${shortDate(b.event.start)} to ${shortDate(b.event.end)}` : `${shortDate(b.event.start)}, ${timeRange(b.event.start, b.event.end)}`}
          <br />
          {b.event.venue}
        </p>
        <p className="ticket__lines num">
          {b.lines.map((l) => `${l.qty} × ${l.name}`).join(", ")}
          <br />
          {b.name}, {b.total === 0 ? "free" : rupees(b.total)}
        </p>
      </div>
      <div className="ticket__stub">
        <Qr text={`${origin}/tickets?code=${b.code}`} />
        <span className="ticket__code">{b.code}</span>
      </div>
    </article>
  );
}
