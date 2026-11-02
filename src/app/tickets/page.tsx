import type { Metadata } from "next";
import TicketsList from "@/components/TicketsList";

export const metadata: Metadata = { title: "My tickets" };

export default function TicketsPage() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title load">My tickets</h1>
          <p className="page-sub load" style={{ ["--d" as string]: "90ms" }}>Tickets booked in this browser. Show the QR code at the gate, or read out the code under it.</p>
        </div>
      </div>
      <TicketsList />
    </div>
  );
}
