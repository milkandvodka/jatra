import type { Metadata } from "next";
import EventView from "@/components/EventView";
import { sampleEvents } from "@/lib/events";

export const revalidate = 3600;

export function generateStaticParams() {
  return sampleEvents().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const e = sampleEvents().find((x) => x.slug === slug);
  return e ? { title: e.title, description: e.summary, openGraph: { title: e.title, description: e.summary, images: [e.image.src] } } : { title: "Event" };
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const all = sampleEvents(new Date());
  const e = all.find((x) => x.slug === slug) ?? null;
  // Organizer-made events are not on the server; the client finds them in the browser that made them.
  const others = all.filter((x) => x.slug !== slug);
  const more = (e ? [...others.filter((x) => x.category === e.category), ...others.filter((x) => x.category !== e.category)] : others).slice(0, 3);
  return <EventView key={slug} initial={e} slug={slug} more={more} />;
}
