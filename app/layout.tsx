import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const APP_NAME = "Gacha Tracker";
const APP_DEFAULT_TITLE = "Gacha Tracker - Banner & News Dashboard";
const APP_TITLE_TEMPLATE = "%s - Gacha Tracker";
const APP_DESCRIPTION =
  "Track active banners, events, and news for Honkai Star Rail, Zenless Zone Zero, Wuthering Waves, Arknights Endfield, and Neverness to Everness.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1419",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.className} antialiased`}>
        {children}
        <ServiceWorkerRegister />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
