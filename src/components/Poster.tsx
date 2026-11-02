import Image from "next/image";
import Link from "next/link";
import { fromPrice, type EventItem } from "@/lib/events";

const fDay = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" });
const fWeek = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "long" });

/** One event as a poster: picture, date block, title, place, a short description, price. */
export default function Poster({ e, link = true, reveal, sizes = "(min-width: 1001px) 31vw, (min-width: 561px) 46vw, 100vw" }: { e: EventItem; link?: boolean; reveal?: number; sizes?: string }) {
  const d = new Date(e.start);
  const body = (
    <>
      <div className="poster__frame">
        {e.image.src.startsWith("data:") ? (
          // An organizer's own upload, stored in their browser.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.image.src} alt={e.image.alt} />
        ) : (
          <Image src={e.image.src} alt={e.image.alt} width={e.image.w} height={e.image.h} sizes={sizes} />
        )}
        <p className="poster__date num" aria-hidden="true">
          <b>{fDay.format(d)}</b>
          <span>{fWeek.format(d)}</span>
        </p>
      </div>
      <div className="poster__body">
        <h3 className="poster__title">
          {e.title || "Your event title"}
          {e.userCreated ? <span className="poster__tag">Yours</span> : null}
        </h3>
        <p className="poster__meta">
          {e.venue || "Venue"}, {e.area}
        </p>
        {e.summary ? <p className="poster__desc">{e.summary}</p> : null}
        <p className="poster__price num">{fromPrice(e)}</p>
      </div>
    </>
  );
  const r = reveal === undefined ? {} : { "data-reveal": "", style: { ["--d" as string]: `${(reveal % 3) * 80}ms` } };
  return (
    <div className="poster" {...r}>
      {link ? <Link href={`/events/${e.slug}`}>{body}</Link> : body}
    </div>
  );
}
