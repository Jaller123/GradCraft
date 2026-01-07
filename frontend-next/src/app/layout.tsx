import type { Metadata } from "next";
import "./globals.css";
import Footer from "../components/layout/Footer";
import ConsentBanner from "../features/consent/ConsentBanner";
import ConsentScripts from "../features/consent/ConsentScripts";
import NavbarGate from "../components/layout/NavbarGate";

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
        <NavbarGate />
        {children}
        <Footer />
        <ConsentScripts />
        <ConsentBanner />
      </body>
    </html>
  );
}
