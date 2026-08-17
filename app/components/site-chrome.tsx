import Link from "next/link";
import { MobileMenu } from "./mobile-menu";
import { ThemeToggle } from "./theme-toggle";

export function Wordmark() {
  return (
    <Link className="wordmark" href="/" aria-label="The Working Set home">
      <span className="wordmark-mark">WS</span>
      <span className="wordmark-copy">
        THE WORKING SET
        <br />
        <em>SOFTWARE · VISION · GAMES</em>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header shell">
      <Wordmark />
      <nav className="desktop-nav" aria-label="Primary navigation">
        <Link href="/#writing">ARTICLES</Link>
        <Link href="/#topics">TOPICS</Link>
      </nav>
      <div className="header-actions">
        <ThemeToggle />
        <Link className="signal-link" href="/about/">ABOUT</Link>
        <MobileMenu />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer shell">
      <div>
        <span className="footer-mark">THE WORKING SET</span>
        <p>Notes on software, vision, and games.</p>
      </div>
      <span>SOFTWARE · VISION · GAMES</span>
      <span>© 2026 THE WORKING SET</span>
    </footer>
  );
}
