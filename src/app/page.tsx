import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import Season from "@/components/Season";
import ThisWeek from "@/components/ThisWeek";
import Split from "@/components/Split";
import Countdown from "@/components/Countdown";
import { SEASON, addDays, dayOf, fromPrice, pic, sampleEvents, todayIST, weekday, when } from "@/lib/events";

export const revalidate = 3600;

const show = [
  { slug: "paper-boats-on-bindu-sagar", bg: pic("paper-boats", "Paper and bark boats with small flags floating on a dark pond"), small: pic("bindu-sagar-1880", "Bindu Sagar lake and its island temple, photographed in the nineteenth century") },
  { slug: "applique-night-market", bg: pic("applique", "Pipili appliqué canopies and lanterns in red, yellow and green"), small: pic("pipili-shop", "A Pipili shop hung floor to ceiling with appliqué lanterns") },
];

const verbs = [
  { word: "Find", line: "Filter by day, neighbourhood and price. Everything listed is in Bhubaneswar or a short ride out.", img: pic("city-night", "Traffic light trails on a Bhubaneswar road at night") },
  { word: "Book", line: "Choose your tickets and add your name. The QR code is saved on this phone straight away.", img: pic("pipili-shop", "Inside a Pipili shop full of appliqué lanterns and umbrellas") },
  { word: "Go", line: "Show the code at the gate. Add the start time to your calendar on the way out.", img: pic("rath-yatra", "The three chariots of the Rath Yatra rising above a dense crowd") },
];

const hostBlocks = [
  { title: "Publish in one sitting", img: pic("open-mic", "A microphone on a stand in front of a dark stage"), lines: ["Title, date, venue and a cover", "A live preview as you type", "Free to list", "Edit or cancel any time"] },
  { title: "Sell in tiers", img: pic("pottery", "Hands shaping clay on a potter's wheel"), lines: ["Up to four ticket types", "Free, early bird or front row", "A cap on each tier", "Sold-out tiers close themselves"] },
  { title: "Know who is coming", img: pic("mukteswar-carving", "Carved sandstone figures on the Mukteswar temple wall"), lines: ["Tickets sold, tier by tier", "Seats left at a glance", "Takings in rupees", "Every guest's ticket code"] },
  { title: "Listed where people look", img: pic("pipili-jagannath", "Appliqué panels with the faces of Jagannath hanging in a Pipili shop"), lines: ["Filed under the area you pick", "Old Town to Patia to Khandagiri", "Shown in this week’s list", "Linked from the season page"] },
];

const faqs = [
  ["Do I need an account?", "No. Tickets you book and events you host are saved in this browser. Clear your browser data and they go with it."],
  ["Is the payment real?", "No. Jatra is a demonstration, so checkout asks for your name, email and phone number and nothing else. No card, no UPI."],
  ["Can I cancel a booking?", "Yes. Open My tickets and choose Cancel booking. The seats go back on sale at once."],
  ["How do I get in on the day?", "Show the QR code on your ticket at the gate. If the scanner is down, the host can type the code printed under it."],
  ["Can my college club host here?", "Yes. Anyone can list an event: clubs, venues, collectives, a group of friends with a speaker. Listing is free."],
];

export default function Home() {
  const events = sampleEvents(new Date());
  const today = todayIST();
  const bySlug = new Map(events.map((e) => [e.slug, e]));
  const season = SEASON.map((s) => bySlug.get(s)!).filter(Boolean);
  const weekEnd = addDays(today, 6);
  const week = events.filter((e) => dayOf(e.start) >= today && dayOf(e.start) <= weekEnd).sort((a, b) => a.start.localeCompare(b.start));
  const days = Array.from({ length: 7 }, (_, i) => {
    const ymd = addDays(today, i);
    const iso = `${ymd}T12:00:00+05:30`;
    return { ymd, label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : weekday(iso), date: String(Number(ymd.slice(8))) };
  });

  return (
    <>
      <Hero />
      <Season events={season} />
      <ThisWeek days={days} events={week} />

      <section className="show" aria-label="Coming up">
        {show.map((s, i) => {
          const e = bySlug.get(s.slug)!;
          return (
            <div className="show__frame" data-col={i + 2} key={s.slug}>
              <div className="show__bg" data-reveal="settle">
                <Image src={s.bg.src} alt={s.bg.alt} width={s.bg.w} height={s.bg.h} sizes="100vw" />
              </div>
              <article className="show__card" data-reveal="" style={{ ["--d" as string]: "250ms" }}>
                <h2>{e.title}</h2>
                <p className="meta">
                  {when(e)}
                  <br />
                  {e.venue}
                </p>
                <p className="show__desc">{e.summary}</p>
                <Countdown start={e.start} end={e.end} />
                <p className="price num">{fromPrice(e)}</p>
                <figure>
                  <Image src={s.small.src} alt={s.small.alt} width={s.small.w} height={s.small.h} sizes="(min-width: 901px) 20vw, 96px" />
                </figure>
                <Link className="btn btn--light btn--full" href={`/events/${e.slug}`}>
                  Book tickets
                </Link>
              </article>
            </div>
          );
        })}
      </section>

      <section className="verbs" aria-label="How booking works">
        {verbs.map((v) => (
          <div className="verb-panel" key={v.word}>
            <div className="verb-panel__bg">
              <Image src={v.img.src} alt={v.img.alt} width={v.img.w} height={v.img.h} sizes="100vw" />
            </div>
            <div className="verb-panel__hold">
              <h2 className="verb">{v.word}</h2>
            </div>
            <p className="verb-panel__line">{v.line}</p>
          </div>
        ))}
      </section>

      <section className="host" aria-labelledby="host-title">
        <div className="grid wrap host__grid">
          <div className="host__head">
            <Split text="Host your own" id="host-title" />
            <p>Running a recital, a run club or a stall? Put it on the city’s calendar. It takes about five minutes.</p>
            <Link href="/host/new" className="btn btn--light">
              Create an event
            </Link>
          </div>
          <div className="host__blocks">
            {hostBlocks.map((b) => (
              <div className="host-block" key={b.title}>
                <h3 data-reveal="">{b.title}</h3>
                <div className="host-block__row">
                  <figure data-reveal="shutter" style={{ ["--d" as string]: "80ms" }}>
                    <Image src={b.img.src} alt={b.img.alt} width={b.img.w} height={b.img.h} sizes="(min-width: 901px) 200px, 100vw" />
                  </figure>
                  <ul>
                    {b.lines.map((l, i) => (
                      <li key={l} data-reveal="" style={{ ["--d" as string]: `${140 + i * 70}ms` }}>
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            <Link href="/host/new" className="btn btn--light btn--full host__cta-mobile">
              Create an event
            </Link>
          </div>
        </div>
      </section>

      <section className="faq" aria-labelledby="faq-title">
        <div className="grid wrap">
          <div className="faq__main">
            <Split text="Before you go" id="faq-title" />
            <ul className="faq__facts">
              <li>Booking is free in this demo.</li>
              <li>Tickets stay in this browser.</li>
              <li>All times are Indian Standard Time.</li>
            </ul>
            {faqs.map(([q, a]) => (
              <details className="qa" key={q} name="faq">
                <summary>
                  {q}
                  <svg className="chev" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M2 5l5 5 5-5" />
                  </svg>
                </summary>
                <p>{a}</p>
              </details>
            ))}
            <div className="faq__actions">
              <Link href="/events" className="btn">
                Find an event
              </Link>
              <Link href="/tickets" className="link">
                Open my tickets
              </Link>
            </div>
          </div>
          <div className="faq__pics">
            <div className="faq__tall" data-reveal="shutter">
              <Image src="/img/lingaraj.jpg" alt="The Lingaraj temple towers in Bhubaneswar's Old Town under a blue sky" width={1920} height={1280} sizes="(min-width: 901px) 50vw, 100vw" />
            </div>
            <div className="faq__square" data-reveal="" style={{ ["--d" as string]: "300ms" }}>
              <Image src="/img/konark-wheel.jpg" alt="A carved stone wheel from the Konark Sun Temple" width={1920} height={1242} sizes="(min-width: 901px) 17vw, 38vw" />
            </div>
          </div>
        </div>
      </section>

      <Link href="/host/new" className="cta">
        <p className="cta__line">Running something this season? List it on Jatra in about five minutes.</p>
        <svg className="cta__arrow" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <path d="M12 36L36 12M16 12h20v20" />
        </svg>
        <span className="cta__word">Host</span>
      </Link>
    </>
  );
}
