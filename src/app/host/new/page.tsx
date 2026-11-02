import { Suspense } from "react";
import type { Metadata } from "next";
import HostForm from "@/components/HostForm";

export const metadata: Metadata = { title: "Host an event" };

export default function NewEventPage() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title load">Host an event</h1>
          <p className="page-sub load" style={{ ["--d" as string]: "90ms" }}>Four short sections. Your poster on the right updates as you type, exactly as it will look in the list.</p>
        </div>
      </div>
      <Suspense fallback={<p className="muted">Loading the form…</p>}>
        <HostForm />
      </Suspense>
    </div>
  );
}
