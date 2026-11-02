import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <div className="empty">
        <h1 className="page-title">Nothing on at this address</h1>
        <p className="page-sub">The page may have moved, or the link was mistyped.</p>
        <Link className="btn" href="/events">
          See what’s on
        </Link>
      </div>
    </div>
  );
}
