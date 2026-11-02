import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = { title: "Your events" };

export default function HostPage() {
  return (
    <div className="page">
      <Dashboard />
    </div>
  );
}
