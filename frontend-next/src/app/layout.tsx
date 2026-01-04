import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ConsentBanner from "../components/ConsentBanner";
import ConsentScripts from "../components/ConsentScripts";

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
