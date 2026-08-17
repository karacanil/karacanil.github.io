import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "../../components/markdown";
import { SiteFooter, SiteHeader } from "../../components/site-chrome";
import {
  getArticle,
  getHeadings,
  getPublishedArticles,
} from "../../lib/articles";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article || article.draft) {
    return { title: "Article not found — The Working Set" };
  }

  return {
    title: `${article.title} — The Working Set`,
    description: article.description,
    alternates: { canonical: `/writing/${article.slug}/` },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article || article.draft) {
    notFound();
  }

  const headings = getHeadings(article.content);

  return (
    <main className="article-page">
      <SiteHeader />

      <article>
        <section className="article-hero shell">
          <div className="article-hero-meta">
            <span>ARTICLE</span>
            <span>{article.category}</span>
            <span>{article.readingTime}</span>
          </div>
          <h1>{article.title}</h1>
          <p className="article-dek">{article.description}</p>
          <div className="article-byline">
            <span>{article.displayDate}</span>
          </div>
          <div className="article-topic-links" aria-label="Article topics">
            {article.topics.map((topic) => (
              <Link href={`/?topic=${encodeURIComponent(topic)}#writing`} key={topic}>
                #{topic}
              </Link>
            ))}
          </div>
        </section>

        <div className="article-body shell">
          <aside className="article-rail">
            <span>ON THIS PAGE</span>
            {headings.map((heading) => (
              <a
                className={heading.level === 3 ? "nested" : undefined}
                href={`#${heading.id}`}
                key={heading.id}
              >
                {heading.text}
              </a>
            ))}
          </aside>

          <div className="prose">
            <Markdown content={article.content} />
            <div className="article-end">
              <span>Thanks for reading.</span>
              <Link href="/#writing">BACK TO ARTICLES →</Link>
            </div>
          </div>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
