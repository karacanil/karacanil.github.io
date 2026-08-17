import { SiteFooter, SiteHeader } from "./components/site-chrome";
import { ArticleBrowser } from "./components/article-browser";
import { getPublishedArticleSummaries } from "./lib/articles";

export default function Home() {
  const articles = getPublishedArticleSummaries();

  return (
    <main>
      <SiteHeader />

      <section className="hero shell" id="top">
        <div className="hero-kicker">
          <span>INDEPENDENT TECHNICAL NOTES</span>
          <span className="availability"><i /> MARKDOWN-POWERED</span>
        </div>
        <div className="hero-content">
          <h1>Software, vision, games—and the systems behind them.</h1>
          <p>
            Practical explanations, project notes, and longer thoughts from the
            space between software and hardware.
          </p>
          <a className="text-link" href="#writing">Browse the articles <span>↓</span></a>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="orbit-core">+</span>
        </div>
      </section>

      <section className="topic-strip" aria-label="Main subjects">
        <div className="shell">
          <span>LINUX &amp; SYSTEMS</span>
          <span>COMPUTER VISION</span>
          <span>GAME DEVELOPMENT</span>
          <span>EMBEDDED</span>
        </div>
      </section>

      <ArticleBrowser articles={articles} />

      <section className="publication-about shell">
        <div>
          <span className="eyebrow">ABOUT THE PUBLICATION</span>
          <p>
            The Working Set is an independent collection of writing about
            technology, games, and making things.
          </p>
        </div>
        <a className="text-link" href="/about">About the site <span>→</span></a>
      </section>

      <SiteFooter />
    </main>
  );
}
