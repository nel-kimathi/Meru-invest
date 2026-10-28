import type { Metadata, Viewport } from "next";
import { Barlow, Bebas_Neue, Figtree } from "next/font/google";
import "./globals.css";

// Figtree: admin + dashboards (unchanged).
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Bebas Neue: display headings on the public site (font-display).
const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Barlow: body copy on the public site (font-body, Bahnschrift first where installed).
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Meru Invest",
    template: "%s | Meru Invest",
  },
  description:
    "The Meru International Investment Conference & Consumer Fair (MIICCOF), connecting investors, government and business to opportunities in Meru.",
  icons: {
    icon: "/favicon.ico?v=2",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b3a25",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} ${bebas.variable} ${barlow.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
