import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {Toaster} from "react-hot-toast"
import ClientAuthLoader from "@/components/ClientAuthLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CollaboDraw",
  description: "Collaborative drawing application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black bg-[radial-gradient(circle,_rgb(36,36,36)_0%,_rgb(0,0,0)_100%)]`}
      >
        <ClientAuthLoader />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
