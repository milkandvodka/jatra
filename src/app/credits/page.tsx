import type { Metadata } from "next";
import media from "@/lib/media.json";

export const metadata: Metadata = { title: "Picture credits" };

export default function CreditsPage() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title load">Picture credits</h1>
          <p className="page-sub load" style={{ ["--d" as string]: "90ms" }}>
            The photographs and the film on Jatra are from Wikimedia Commons, used under the licences listed with each.
          </p>
        </div>
      </div>
      <ul className="credits-list">
        {Object.values(media).map((m) => (
          <li key={m.src}>
            <a href={m.page}>“{m.title}”</a> by {m.creator}, <a href={m.licenseUrl}>{m.license}</a>, via Wikimedia Commons.
          </li>
        ))}
        <li>
          Typeface: General Sans by Indian Type Foundry, via Fontshare. Odia lettering: Noto Sans Oriya, SIL Open Font License.
        </li>
      </ul>
    </div>
  );
}
