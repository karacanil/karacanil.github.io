import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/site-chrome";

export const metadata: Metadata = {
  title: "About — The Working Set",
  description: "About The Working Set and its author.",
};

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />

      <section className="about-page shell">
        <div className="about-code" aria-hidden="true">
          <span>ABOUT.TXT</span>
          <div className="portrait-terminal">
            <b>WS</b>
            <i className="corner tl" /><i className="corner tr" />
            <i className="corner bl" /><i className="corner br" />
          </div>
          <span>EST. 2026 · ANKARA</span>
        </div>

        <div className="about-copy">
          <span className="eyebrow">ABOUT THE WORKING SET</span>
          <h1>A place for ideas that are currently in use.</h1>
          <p className="about-lead">
            The Working Set is an independent technical blog written by Anıl Karaca.
          </p>
          <p>
            I’m an electrical and electronics engineer interested in the places
            where software meets the physical world. I work across machine
            learning, computer vision, embedded systems, and low-level software.
          </p>
          <p>
            Games and game development are the other half of the site: design
            patterns, mechanics, tools, and the small technical decisions that
            shape how a system feels. The Workbench category leaves room for
            everything else—3D printing, audio, electronics, and projects that
            do not fit neatly into one label.
          </p>
          <div className="about-links">
            <a href="https://github.com/karacanil" target="_blank" rel="noreferrer">GITHUB <Arrow /></a>
            <a href="https://www.linkedin.com/in/karaca-anil/" target="_blank" rel="noreferrer">LINKEDIN <Arrow /></a>
            <a href="mailto:karaca_anil@hotmail.com">EMAIL <Arrow /></a>
          </div>
        </div>
      </section>

      <section className="name-note">
        <div className="shell">
          <span className="eyebrow">THE NAME</span>
          <p>
            In computing, a working set is the information actively needed by a
            running process. Here, it means the subjects, problems, and ideas
            currently worth keeping close.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

