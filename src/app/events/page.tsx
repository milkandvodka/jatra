import { Suspense } from "react";
import type { Metadata } from "next";
import Browse, { BrowseHeader } from "@/components/Browse";
import Poster from "@/components/Poster";
import { sampleEvents, todayIST } from "@/lib/events";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Events", description: "Every event on in Bhubaneswar over the next three weeks: music, dance, food, workshops, talks, sport and trips." };

export default function EventsPage() {
  const events = sampleEvents(new Date());
  // Until the URL's filters are read on the client, show everything.
  const fallback = (
    <>
      <BrowseHeader count={events.length} />
      <ul className="posters">
        {events.map((e) => (
          <li key={e.slug}>
            <Poster e={e} />
          </li>
        ))}
      </ul>
    </>
  );
  return (
    <div className="page">
      <Suspense fallback={fallback}>
        <Browse sample={events} today={todayIST()} />
      </Suspense>
    </div>
  );
}
