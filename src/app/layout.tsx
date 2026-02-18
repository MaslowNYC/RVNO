import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { AdminToolbar } from "@/components/AdminToolbar";

export const metadata: Metadata = {
  title: "Roanoke Valley Norton Owners",
  description:
    "A small core of Norton enthusiasts located in Virginia's Roanoke Valley with members worldwide.",
  icons: {
    icon: "/favicon.png",
  },
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
      <body className="min-h-screen flex flex-col bg-rvno-bg text-rvno-ink">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <AdminToolbar />
        </Providers>
      </body>
    </html>
  );
}
