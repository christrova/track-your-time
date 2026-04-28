import type { Metadata } from "next";
import { Geist_Mono, Josefin_Sans } from "next/font/google";
import "./globals.css";
import { PresenceProvider } from "@/providers/presence-provider";
import { Analytics } from "@vercel/analytics/next";

const josefinSans = Josefin_Sans({
  variable: "--app-font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "En ce moment",
  description:
    "Un dashboard simple pour suivre tes tâches, ton statut (travail/pause/hors ligne) et partager un profil public propre.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr-FR">
      <body
        className={`${josefinSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <PresenceProvider>
          {children}
          <Analytics />
        </PresenceProvider>
      </body>
    </html>
  );
}
