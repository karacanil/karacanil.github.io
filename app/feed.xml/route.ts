import { getPublishedArticles } from "../lib/articles";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../lib/site";

// Rendered once at build time and exported as the static file /feed.xml.
export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const articles = getPublishedArticles()
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  const items = articles
    .map((article) => {
      const url = `${SITE_URL}/writing/${article.slug}/`;
      return [
        "    <item>",
        `      <title>${escapeXml(article.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${new Date(`${article.date}T00:00:00Z`).toUTCString()}</pubDate>`,
        `      <description>${escapeXml(article.description)}</description>`,
        ...article.topics.map(
          (topic) => `      <category>${escapeXml(topic)}</category>`,
        ),
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const lastBuildDate = articles[0]
    ? `\n    <lastBuildDate>${new Date(`${articles[0].date}T00:00:00Z`).toUTCString()}</lastBuildDate>`
    : "";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}/</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />${lastBuildDate}
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
