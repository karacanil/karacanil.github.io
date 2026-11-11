import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "./components/site-chrome";

export const metadata: Metadata = {
  title: "Page not found — The Working Set",
};

export default function NotFound() {
  return (
    <main>
      <SiteHeader />

      <section className="hero shell">
        <div className="hero-kicker">
          <span>ERROR 404</span>
          <span className="availability"><i /> PAGE FAULT</span>
        </div>
        <div className="hero-content">
          <h1>This page is not in the working set.</h1>
          <p>
            The address may be mistyped, or the article may have been moved or
            removed.
          </p>
          <Link className="text-link" href="/#writing">Browse the articles <span>→</span></Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
