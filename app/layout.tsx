import type { Metadata } from "next";
import "./globals.css";

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
  metadataBase: new URL("https://karacanil.github.io"),
  title: "The Working Set",
  description:
    "Independent writing on software engineering, computer vision, games, embedded systems, and the workbench in between.",
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
