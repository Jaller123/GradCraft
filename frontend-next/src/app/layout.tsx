import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ConsentBanner from "../features/consent/ConsentBanner";
import ConsentScripts from "../features/consent/ConsentScripts";

export const metadata: Metadata = {
  title: "GradCraft",
  description: "GradCraft CV builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
        <ConsentScripts />
        <ConsentBanner />
      </body>
    </html>
  );
}
