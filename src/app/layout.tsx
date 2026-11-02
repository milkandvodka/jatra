import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Noto_Sans_Oriya } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Motion from "@/components/Motion";
import { Toaster } from "@/components/Toast";

const generalSans = localFont({
  src: [
    { path: "./fonts/GeneralSans-400.woff2", weight: "400" },
    { path: "./fonts/GeneralSans-500.woff2", weight: "500" },
    { path: "./fonts/GeneralSans-600.woff2", weight: "600" },
    { path: "./fonts/GeneralSans-700.woff2", weight: "700" },
  ],
  variable: "--font-gs",
  display: "swap",
});

const odia = Noto_Sans_Oriya({ subsets: ["oriya"], weight: ["600"], variable: "--font-odia", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://jatra-bhubaneswar.vercel.app"),
  title: { default: "Jatra: what's on in Bhubaneswar", template: "%s | Jatra" },
  description: "Find, book and host events in Bhubaneswar: Odissi under temple arches, open mics, food walks, workshops, runs and festivals. Designed and built by Subham Shah (Roll No. 24155739).",
  authors: [{ name: "Subham Shah" }],
  creator: "Subham Shah",
  openGraph: { title: "Jatra: what's on in Bhubaneswar", description: "Find, book and host events in Bhubaneswar.", images: ["/media/city-poster.jpg"] },
};

export const viewport: Viewport = { themeColor: "#dedad3" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${generalSans.variable} ${odia.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Motion />
        <Toaster />
      </body>
    </html>
  );
}
