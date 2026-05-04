import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Las Empanadas de Titi | Caballito, Buenos Aires",
  description:
    "Empanadas y canastitas artesanales que son un gol. Pedí por WhatsApp. Delivery y take-away en Caballito, CABA. Malvinas Argentinas 285.",
  keywords: [
    "empanadas",
    "canastitas",
    "Caballito",
    "Buenos Aires",
    "delivery",
    "comida argentina",
    "Las Empanadas de Titi",
  ],
  openGraph: {
    title: "Las Empanadas de Titi",
    description: "Empanadas y canastitas que son un gol 🥟",
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
