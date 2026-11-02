"use client";

import { useEffect, useState } from "react";

export const toast = (message: string) => window.dispatchEvent(new CustomEvent("jatra:toast", { detail: message }));

export function Toaster() {
  const [msg, setMsg] = useState<{ text: string; id: number } | null>(null);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      setMsg({ text: (e as CustomEvent<string>).detail, id: Date.now() });
      clearTimeout(t);
      t = setTimeout(() => setMsg(null), 3200);
    };
    window.addEventListener("jatra:toast", on);
    return () => {
      window.removeEventListener("jatra:toast", on);
      clearTimeout(t);
    };
  }, []);
  return (
    <div role="status" aria-live="polite">
      {msg ? (
        <div className="toast" key={msg.id}>
          {msg.text}
        </div>
      ) : null}
    </div>
  );
}
