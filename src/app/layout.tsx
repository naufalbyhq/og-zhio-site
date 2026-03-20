import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zhio OG Creator",
  description: "Generate social-ready OpenGraph, quote, and code images instantly.",
  metadataBase: new URL("https://og.zhio.site"),
  openGraph: {
    title: "Zhio OG Creator",
    description: "Generate social-ready OpenGraph, quote, and code images instantly.",
    type: "website",
    url: "https://og.zhio.site",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zhio OG Creator",
    description: "Generate social-ready OpenGraph, quote, and code images instantly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
