import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claimwise · Schadenprüfung",
  description: "Arbeitsbereich für die KI-gestützte Schadenprüfung. Frontend-Demo mit Schadensdaten, Chat und Quellenansicht.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de-CH"><body>{children}</body></html>;
}
