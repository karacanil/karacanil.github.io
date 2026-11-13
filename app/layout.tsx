import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./lib/site";

const themeScript = `
  (function () {
    try {
      var saved = localStorage.getItem("working-set-theme");
      var preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      document.documentElement.dataset.theme = saved === "dark" || saved === "light" ? saved : preferred;
    } catch (_) {
      document.documentElement.dataset.theme = "light";
    }
  })();
`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  // No canonical here: pages without their own (such as the 404) would inherit it.
  alternates: {
    types: { "application/rss+xml": [{ url: "/feed.xml", title: SITE_NAME }] },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [{ url: "/favicon-ws.svg", type: "image/svg+xml" }],
    shortcut: "/favicon-ws.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
