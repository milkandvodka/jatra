"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import Poster from "./Poster";
import { AREAS, CATEGORIES, COVERS, addDays, isoAt, slugify, todayIST, type Area, type Category, type EventItem, type Picture } from "@/lib/events";
import { saveEvent, useHydrated, useUserEvents } from "@/lib/store";

type TierDraft = { id: string; name: string; price: string; capacity: string; sold: number };
type Draft = {
  title: string; category: Category; summary: string; about: string; date: string; from: string; to: string;
  venue: string; address: string; area: Area; host: string; cover: Picture; tiers: TierDraft[];
};
type Errors = Partial<Record<string, string>>;

const MAX_TIERS = 4;
const rid = () => Math.random().toString(36).slice(2, 7);

function draftFrom(e: EventItem | undefined): Draft {
  if (!e) {
    return {
      title: "", category: "Music", summary: "", about: "", date: addDays(todayIST(), 7), from: "18:30", to: "20:30",
      venue: "", address: "", area: "Old Town", host: "", cover: COVERS[0],
      tiers: [{ id: rid(), name: "General", price: "299", capacity: "100", sold: 0 }],
    };
  }
  return {
    title: e.title, category: e.category, summary: e.summary, about: e.about.join("\n\n"),
    date: e.start.slice(0, 10), from: e.start.slice(11, 16), to: e.end.slice(11, 16),
    venue: e.venue, address: e.address, area: e.area, host: e.host, cover: e.image,
    tiers: e.tiers.map((t) => ({ id: t.id, name: t.name, price: String(t.price), capacity: String(t.capacity), sold: t.sold })),
  };
}

function toEvent(d: Draft, slug: string, createdAt?: string): EventItem {
  return {
    slug,
    title: d.title.trim(),
    category: d.category,
    area: d.area,
    venue: d.venue.trim(),
    address: d.address.trim() || `${d.area}, Bhubaneswar`,
    summary: d.summary.trim(),
    about: (d.about.trim() || d.summary.trim()).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    schedule: [],
    goodToKnow: [],
    host: d.host.trim(),
    image: d.cover,
    tiers: d.tiers.map((t) => ({ id: t.id, name: t.name.trim() || "General", price: Math.max(0, Math.round(Number(t.price) || 0)), capacity: Math.max(1, Math.round(Number(t.capacity) || 1)), sold: t.sold })),
    start: isoAt(d.date || todayIST(), d.from || "18:00"),
    end: isoAt(d.date || todayIST(), d.to || "20:00"),
    userCreated: true,
    createdAt: createdAt ?? new Date().toISOString(),
  };
}

function validate(d: Draft): Errors {
  const e: Errors = {};
  if (d.title.trim().length < 3) e.title = "Give the event a title of at least three characters.";
  if (d.summary.trim().length < 10) e.summary = "Write one sentence that says what happens, at least ten characters.";
  if (!d.date) e.date = "Choose a date.";
  else if (d.date < todayIST()) e.date = "Choose today or a later date.";
  if (!d.from || !d.to) e.to = "Set a start and an end time.";
  else if (d.to <= d.from) e.to = "End time must be after the start time.";
  if (!d.venue.trim()) e.venue = "Name the venue so people can find it.";
  if (!d.host.trim()) e.host = "Say who is hosting: you, your club or your venue.";
  d.tiers.forEach((t, i) => {
    if (!t.name.trim()) e[`tier-${i}-name`] = `Name ticket type ${i + 1}, for example General or Front row.`;
    if (t.price === "" || Number(t.price) < 0 || !Number.isFinite(Number(t.price))) e[`tier-${i}-price`] = `Set a price of 0 or more for ticket type ${i + 1}.`;
    if (!(Number(t.capacity) >= 1)) e[`tier-${i}-capacity`] = `Set how many tickets of type ${i + 1} are available, at least 1.`;
  });
  return e;
}

async function shrink(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1000 / bitmap.width, 1250 / bitmap.height);
  const canvas = Object.assign(document.createElement("canvas"), { width: Math.round(bitmap.width * scale), height: Math.round(bitmap.height * scale) });
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

export default function HostFormLoader() {
  const hydrated = useHydrated();
  const edit = useSearchParams().get("edit");
  const mine = useUserEvents();
  if (!hydrated) return <p className="muted">Loading the form…</p>;
  const existing = edit ? mine.find((e) => e.slug === edit) : undefined;
  return <HostForm key={edit ?? "new"} existing={existing} missing={!!edit && !existing} />;
}

function HostForm({ existing, missing }: { existing?: EventItem; missing: boolean }) {
  const router = useRouter();
  const [d, setD] = useState<Draft>(() => draftFrom(existing));
  const [errors, setErrors] = useState<Errors>({});
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const slug = existing?.slug ?? "";

  // Editing a field clears its error; the rest stay until the next attempt to publish.
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setD((x) => ({ ...x, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined, ...(k === "from" ? { to: undefined } : {}) }));
  };
  const setTier = (i: number, k: keyof TierDraft, v: string) => {
    setD((x) => ({ ...x, tiers: x.tiers.map((t, j) => (j === i ? { ...t, [k]: v } : t)) }));
    setErrors((e) => ({ ...e, [`tier-${i}-${k}`]: undefined }));
  };
  const preview = toEvent(d, slug || "preview", existing?.createdAt);

  const onUpload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setErrors((e) => ({ ...e, cover: "Choose an image file (JPG, PNG or WebP)." }));
    if (file.size > 15 * 1024 * 1024) return setErrors((e) => ({ ...e, cover: "That image is over 15 MB. Choose a smaller one." }));
    setUploading(true);
    try {
      const src = await shrink(file);
      set("cover", { src, w: 1000, h: 1250, alt: `Cover photo for ${d.title || "this event"}` });
      setErrors((e) => ({ ...e, cover: undefined }));
    } catch {
      setErrors((e) => ({ ...e, cover: "That image couldn’t be read. Try a JPG or PNG." }));
    } finally {
      setUploading(false);
    }
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const errs = validate(d);
    setErrors(errs);
    setSaveError("");
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    const finalSlug = slug || `${slugify(d.title) || "event"}-${rid()}`;
    try {
      saveEvent(toEvent(d, finalSlug, existing?.createdAt));
    } catch (err) {
      setSaveError((err as Error).message);
      return;
    }
    router.push(`/events/${finalSlug}?published=1`);
  };

  const err = (k: string) =>
    errors[k] ? (
      <span className="err" id={`err-${k}`}>
        {errors[k]}
      </span>
    ) : null;
  const a11y = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `err-${k}` : undefined, id: `f-${k}` });
  const errorList = Object.entries(errors).filter(([, v]) => v);

  return (
    <div className="grid host-layout">
      <form className="host-form" onSubmit={submit} noValidate>
        {missing ? <p className="form-errors">That event isn’t saved in this browser, so you are starting a new one.</p> : null}
        {errorList.length ? (
          <div className="form-errors" ref={summaryRef} tabIndex={-1} role="alert">
            <strong>
              {errorList.length === 1 ? "One thing needs fixing" : `${errorList.length} things need fixing`} before you publish:
            </strong>
            <ul>
              {errorList.map(([k, v]) => (
                <li key={k}>
                  <a className="link" href={`#f-${k}`}>
                    {v}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <fieldset>
          <legend>What is it?</legend>
          <label className="field">
            <span>Title</span>
            <input className="input" value={d.title} maxLength={70} onChange={(e) => set("title", e.target.value)} {...a11y("title")} />
            {err("title")}
          </label>
          <div className="two">
            <label className="field">
              <span>Category</span>
              <select className="select" value={d.category} onChange={(e) => set("category", e.target.value as Category)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Hosted by</span>
              <input className="input" value={d.host} autoComplete="organization" onChange={(e) => set("host", e.target.value)} {...a11y("host")} />
              {err("host")}
            </label>
          </div>
          <label className="field">
            <span>One-line summary</span>
            <input className="input" value={d.summary} maxLength={160} onChange={(e) => set("summary", e.target.value)} {...a11y("summary")} />
            {err("summary") ?? <small>{160 - d.summary.length} characters left. This shows in lists and search.</small>}
          </label>
          <label className="field">
            <span>About (optional)</span>
            <textarea className="textarea" value={d.about} onChange={(e) => set("about", e.target.value)} />
            <small>Leave a blank line between paragraphs.</small>
          </label>
        </fieldset>

        <fieldset>
          <legend>When and where?</legend>
          <div className="three">
            <label className="field">
              <span>Date</span>
              <input className="input" type="date" min={todayIST()} value={d.date} onChange={(e) => set("date", e.target.value)} {...a11y("date")} />
              {err("date")}
            </label>
            <label className="field">
              <span>Starts</span>
              <input className="input" type="time" value={d.from} onChange={(e) => set("from", e.target.value)} />
            </label>
            <label className="field">
              <span>Ends</span>
              <input className="input" type="time" value={d.to} onChange={(e) => set("to", e.target.value)} {...a11y("to")} />
              {err("to")}
            </label>
          </div>
          <div className="two">
            <label className="field">
              <span>Venue</span>
              <input className="input" value={d.venue} onChange={(e) => set("venue", e.target.value)} {...a11y("venue")} />
              {err("venue")}
            </label>
            <label className="field">
              <span>Area</span>
              <select className="select" value={d.area} onChange={(e) => set("area", e.target.value as Area)}>
                {AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            <span>Address (optional)</span>
            <input className="input" value={d.address} autoComplete="street-address" onChange={(e) => set("address", e.target.value)} />
            <small>Used for the Google Maps link on your event page.</small>
          </label>
        </fieldset>

        <fieldset>
          <legend>Cover picture</legend>
          <div className="covers" role="group" aria-label="Choose a cover">
            {COVERS.map((c) => (
              <button key={c.src} type="button" className="cover" aria-pressed={d.cover.src === c.src} aria-label={c.alt} onClick={() => set("cover", c)}>
                <Image src={c.src} alt="" width={c.w} height={c.h} sizes="160px" />
              </button>
            ))}
            <label className="cover cover--upload" id="f-cover" style={d.cover.src.startsWith("data:") ? { outline: "3px solid var(--ink)" } : undefined}>
              {d.cover.src.startsWith("data:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.cover.src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              ) : null}
              <span style={{ position: "relative" }}>{uploading ? "Reading…" : d.cover.src.startsWith("data:") ? "" : "Upload your own"}</span>
              <input type="file" accept="image/*" aria-label="Upload your own cover" onChange={(e) => onUpload(e.target.files?.[0])} />
            </label>
          </div>
          {err("cover") ?? <small className="small muted">JPG, PNG or WebP. Resized in your browser to keep it light.</small>}
        </fieldset>

        <fieldset>
          <legend>Tickets</legend>
          {d.tiers.map((t, i) => (
            <div className="tier-row" key={t.id}>
              <label className="field">
                <span>Ticket type</span>
                <input className="input" value={t.name} onChange={(e) => setTier(i, "name", e.target.value)} {...a11y(`tier-${i}-name`)} />
              </label>
              <label className="field">
                <span>Price (₹)</span>
                <input className="input num" type="number" min={0} step={1} inputMode="numeric" value={t.price} onChange={(e) => setTier(i, "price", e.target.value)} {...a11y(`tier-${i}-price`)} />
              </label>
              <label className="field">
                <span>Available</span>
                <input className="input num" type="number" min={1} step={1} inputMode="numeric" value={t.capacity} onChange={(e) => setTier(i, "capacity", e.target.value)} {...a11y(`tier-${i}-capacity`)} />
              </label>
              <button
                type="button"
                className="btn btn--quiet"
                disabled={d.tiers.length === 1}
                aria-label={`Remove ticket type ${i + 1}`}
                onClick={() => setD((x) => ({ ...x, tiers: x.tiers.filter((_, j) => j !== i) }))}
              >
                Remove
              </button>
              {err(`tier-${i}-name`)}
              {err(`tier-${i}-price`)}
              {err(`tier-${i}-capacity`)}
            </div>
          ))}
          {d.tiers.length < MAX_TIERS ? (
            <button type="button" className="link" style={{ justifySelf: "start" }} onClick={() => setD((x) => ({ ...x, tiers: [...x.tiers, { id: rid(), name: "", price: "0", capacity: "50", sold: 0 }] }))}>
              Add another ticket type
            </button>
          ) : (
            <small className="small muted">Four ticket types is the most an event can have.</small>
          )}
          <small className="small muted">Set the price to 0 for a free ticket.</small>
        </fieldset>

        {saveError ? <p className="form-errors" role="alert">{saveError}</p> : null}
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <button type="submit" className="btn">
            {existing ? "Save changes" : "Publish event"}
          </button>
          <span className="small muted">Saved in this browser. Anyone using it can see and book your event.</span>
        </div>
      </form>

      <aside className="host-preview" aria-label="Preview">
        <span>Preview</span>
        <Poster e={preview} link={false} sizes="(min-width: 901px) 30vw, 100vw" />
      </aside>
    </div>
  );
}
