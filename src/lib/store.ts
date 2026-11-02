"use client";

import { useSyncExternalStore } from "react";
import type { EventItem } from "./events";

export type BookingLine = { tierId: string; name: string; price: number; qty: number };
export type Booking = {
  code: string;
  slug: string;
  event: Pick<EventItem, "title" | "start" | "end" | "venue" | "address" | "image">;
  lines: BookingLine[];
  total: number;
  name: string;
  email: string;
  /** Absent on bookings made before the phone field existed. */
  phone?: string;
  createdAt: string;
};

const KEYS = { events: "jatra:events", bookings: "jatra:bookings" } as const;
type Key = keyof typeof KEYS;

const EMPTY: never[] = [];
const cache: Record<string, { raw: string | null; value: unknown[] }> = {};
const listeners = new Set<() => void>();

function read<T>(key: Key): T[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEYS[key]);
  } catch {
    return EMPTY;
  }
  const hit = cache[key];
  if (hit && hit.raw === raw) return hit.value as T[];
  let value: unknown[] = EMPTY;
  try {
    const parsed = raw ? JSON.parse(raw) : EMPTY;
    value = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    value = EMPTY;
  }
  cache[key] = { raw, value };
  return value as T[];
}

function write<T>(key: Key, value: T[]) {
  try {
    localStorage.setItem(KEYS[key], JSON.stringify(value));
  } catch {
    // Quota exceeded (usually a large uploaded cover). Surface it to the caller.
    throw new Error("This browser has no room left to save that. Try a smaller cover photo.");
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key?.startsWith("jatra:") && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export const useUserEvents = () => useSyncExternalStore(subscribe, () => read<EventItem>("events"), () => EMPTY as EventItem[]);
export const useBookings = () => useSyncExternalStore(subscribe, () => read<Booking>("bookings"), () => EMPTY as Booking[]);
/** False during SSR and the first client render, true after hydration. */
export const useHydrated = () => useSyncExternalStore(subscribe, () => true, () => false);

export function saveEvent(e: EventItem) {
  const all = read<EventItem>("events").filter((x) => x.slug !== e.slug);
  write("events", [e, ...all]);
}
export function deleteEvent(slug: string) {
  write("events", read<EventItem>("events").filter((x) => x.slug !== slug));
}
export function addBooking(b: Booking) {
  write("bookings", [b, ...read<Booking>("bookings")]);
}
export function cancelBooking(code: string) {
  write("bookings", read<Booking>("bookings").filter((b) => b.code !== code));
}

/** Tickets booked in this browser, per tier, for one event. */
export function bookedByTier(bookings: Booking[], slug: string) {
  const out: Record<string, number> = {};
  for (const b of bookings) if (b.slug === slug) for (const l of b.lines) out[l.tierId] = (out[l.tierId] ?? 0) + l.qty;
  return out;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function ticketCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const s = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `JT-${s.slice(0, 4)}-${s.slice(4)}`;
}

export function downloadIcs(e: { title: string; start: string; end: string; venue: string; address: string }, slug: string) {
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s: string) => s.replace(/[\\,;]/g, (m) => `\\${m}`);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Jatra//Bhubaneswar//EN",
    "BEGIN:VEVENT",
    `UID:${slug}-${stamp(e.start)}@jatra`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(e.start)}`,
    `DTEND:${stamp(e.end)}`,
    `SUMMARY:${esc(e.title)}`,
    `LOCATION:${esc(`${e.venue}, ${e.address}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `${slug}.ics` });
  a.click();
  URL.revokeObjectURL(url);
}
