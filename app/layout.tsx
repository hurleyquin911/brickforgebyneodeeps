import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { display, scribble } from "@/lib/fonts";
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
  title: {
    default: "BrickForge by NeoDeeps",
    template: "%s · BrickForge",
  },
  description: "BrickForge by NeoDeeps — studio rakit 3D di browser.",
  icons: {
    icon: "/Logo.png",
    apple: "/Logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${scribble.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
