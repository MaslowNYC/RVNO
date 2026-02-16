import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Roanoke Valley Norton Owners",
  description:
    "A small core of Norton enthusiasts located in Virginia's Roanoke Valley with members worldwide.",
  openGraph: {
    title: "Roanoke Valley Norton Owners",
    description:
      "Keeping Nortons alive in the Blue Ridge. Rides, rallies, and good company.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
