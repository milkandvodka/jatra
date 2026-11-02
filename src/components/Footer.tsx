import Link from "next/link";

export const REPO = "https://github.com/milkandvodka/jatra";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="grid wrap footer__top">
        <div className="footer__invite">
          <h2>
            See you
            <br />
            out there
          </h2>
          <Link href="/events" className="btn btn--light">
            Find an event
          </Link>
        </div>
        <ul className="footer__links">
          <li><Link className="link" href="/events">Events</Link></li>
          <li><Link className="link" href="/host/new">Host an event</Link></li>
          <li><Link className="link" href="/tickets">My tickets</Link></li>
          <li><Link className="link" href="/credits">Picture credits</Link></li>
          <li><a className="link" href={REPO}>Source code</a></li>
        </ul>
      </div>
      <div className="footer__legal">
        <span>Jatra is a demo project. Sample events, hosts and bookings are fictional.</span>
        <span>
          Photographs and film by Wikimedia Commons contributors. <Link className="link" href="/credits">Credits</Link>
        </span>
      </div>
      <div className="footer__mark" aria-hidden="true">
        Jatra
      </div>
    </footer>
  );
}
