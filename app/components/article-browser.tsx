"use client";

import { useEffect, useMemo, useState } from "react";
import type { ArticleSummary } from "../lib/articles";

const ARTICLES_PER_PAGE = 9;

type TopicSummary = {
  label: string;
  count: number;
};

function topicKey(topic: string): string {
  return topic.toLowerCase();
}

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export function ArticleBrowser({ articles }: { articles: ArticleSummary[] }) {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_PAGE);

  const topics = useMemo<TopicSummary[]>(() => {
    const counts = new Map<string, TopicSummary>();

    for (const article of articles) {
      for (const topic of article.topics) {
        const key = topicKey(topic);
        const current = counts.get(key);
        counts.set(key, {
          label: current?.label || topic,
          count: (current?.count || 0) + 1,
        });
      }
    }

    return Array.from(counts.values()).sort(
      (a, b) => b.count - a.count || a.label.localeCompare(b.label),
    );
  }, [articles]);

  useEffect(() => {
    const requestedTopic = new URLSearchParams(window.location.search).get("topic");
    if (!requestedTopic) return;

    const match = topics.find(
      (topic) => topicKey(topic.label) === topicKey(requestedTopic),
    );
    if (!match) return;

    const timer = window.setTimeout(() => setActiveTopic(match.label), 0);
    return () => window.clearTimeout(timer);
  }, [topics]);

  const filteredArticles = activeTopic
    ? articles.filter((article) =>
        article.topics.some(
          (topic) => topicKey(topic) === topicKey(activeTopic),
        ),
      )
    : articles;
  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hiddenArticleCount = filteredArticles.length - visibleArticles.length;

  function chooseTopic(topic: string | null, scrollToArticles = false) {
    setActiveTopic(topic);
    setVisibleCount(ARTICLES_PER_PAGE);

    const url = new URL(window.location.href);
    if (topic) {
      url.searchParams.set("topic", topic);
    } else {
      url.searchParams.delete("topic");
    }
    url.hash = "writing";
    window.history.replaceState({}, "", url);

    if (scrollToArticles) {
      window.requestAnimationFrame(() => {
        document.getElementById("writing")?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }

  return (
    <>
      <section className="writing shell section" id="writing">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LATEST</span>
            <h2>Recent articles</h2>
          </div>
          <p>Technical explanations, field notes, and ideas developed through ongoing projects.</p>
        </div>

        <div className="filter-summary" aria-live="polite">
          <span>
            {activeTopic ? (
              <>Showing {visibleArticles.length} of {filteredArticles.length} articles tagged <strong>#{activeTopic}</strong></>
            ) : (
              <>Showing {visibleArticles.length} of {articles.length} articles</>
            )}
          </span>
          {activeTopic && (
            <button type="button" onClick={() => chooseTopic(null)}>
              CLEAR FILTER ×
            </button>
          )}
        </div>

        <div
          className={activeTopic ? "article-grid filtered" : "article-grid"}
          id="article-grid"
        >
          {visibleArticles.map((article, index) => (
            <article className={`article-card ${article.featured ? "featured" : ""}`} key={article.slug}>
              <a
                className="article-card-link"
                href={`/writing/${article.slug}`}
                aria-label={`Read ${article.title}`}
              />
              <div className={`card-signal ${article.accent}`} aria-hidden="true">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div className="signal-graphic"><i /><i /><i /></div>
              </div>
              <div className="article-copy">
                <span className="article-kind">{article.category}</span>
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                <div className="article-topics" aria-label={`Topics for ${article.title}`}>
                  {article.topics.map((topic) => (
                    <button
                      aria-pressed={activeTopic === topic}
                      className="topic-chip"
                      key={topic}
                      onClick={() => chooseTopic(topic)}
                      type="button"
                    >
                      #{topic}
                    </button>
                  ))}
                </div>
                <div className="article-meta">
                  <span>{article.readingTime} · {article.displayDate}</span>
                  <a className="read-article-link" href={`/writing/${article.slug}`} aria-label={`Read ${article.title}`}>
                    <span>READ ARTICLE</span><Arrow />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
        {hiddenArticleCount > 0 && (
          <div className="article-pagination">
            <button
              aria-controls="article-grid"
              onClick={() => setVisibleCount((count) => count + ARTICLES_PER_PAGE)}
              type="button"
            >
              LOAD {Math.min(ARTICLES_PER_PAGE, hiddenArticleCount)} MORE
              <span aria-hidden="true">↓</span>
            </button>
            <span>{hiddenArticleCount} remaining</span>
          </div>
        )}
        <p className="markdown-note">
          Every article is written in Markdown and automatically inherits the same layout.
        </p>
      </section>

      <section className="topics section" id="topics">
        <div className="shell">
          <div className="section-heading inverted">
            <div>
              <span className="eyebrow">TOPICS</span>
              <h2>Browse by topic</h2>
            </div>
            <p>Choose a tag to filter the article list. Add or remove topics in each article’s Markdown file.</p>
          </div>
          <div className="topic-filter-grid" aria-label="Filter articles by topic">
            {topics.map((topic) => {
              const selected = activeTopic === topic.label;
              return (
                <button
                  aria-pressed={selected}
                  className={selected ? "topic-filter-button active" : "topic-filter-button"}
                  key={topic.label}
                  onClick={() => chooseTopic(selected ? null : topic.label, true)}
                  type="button"
                >
                  <span>#{topic.label}</span>
                  <small>{topic.count} {topic.count === 1 ? "article" : "articles"}</small>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
